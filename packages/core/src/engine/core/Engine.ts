import type { VylosEvent, VylosGameState, Checkpoint, SaveSlot } from '../types';
import { EventManager } from '../managers/EventManager';
import { HistoryManager } from '../managers/HistoryManager';
import { InventoryManager } from '../managers/InventoryManager';
import { NavigationManager, NavigationAction } from '../managers/NavigationManager';
import { SaveManager } from '../managers/SaveManager';
import { SettingsManager } from '../managers/SettingsManager';
import { EventRunner } from './EventRunner';
import { JumpSignal } from '../errors/JumpSignal';
import { logger } from '../utils/logger';


export interface EngineLoopCallbacks {
  /** Called each loop iteration (update UI: available locations, actions, background) */
  onTick?(state: VylosGameState): void;
  /** Called when player selects an action */
  onAction?(actionId: string, state: VylosGameState): void;
}

export interface EngineDeps {
  eventManager: EventManager;
  historyManager: HistoryManager;
  inventoryManager: InventoryManager;
  navigationManager: NavigationManager;
  eventRunner: EventRunner;
  saveManager: SaveManager;
  settingsManager: SettingsManager;
}

/**
 * Main engine orchestrator.
 * Runs the game loop: evaluate events → execute → wait for navigation → repeat.
 */
export class Engine {
  readonly eventManager: EventManager;
  readonly historyManager: HistoryManager;
  readonly inventoryManager: InventoryManager;
  readonly navigationManager: NavigationManager;
  readonly eventRunner: EventRunner;
  readonly saveManager: SaveManager;
  readonly settingsManager: SettingsManager;
  private running = false;

  /** Callback to reset game state for new game (set by setup) */
  onNewGame: (() => void) | null = null;

  /** Pending mid-event resume after load */
  private pendingResume: {
    eventId: string;
    checkpoints: Checkpoint[];
    initialState: VylosGameState;
  } | null = null;

  /** Flag to skip event lock/push when interrupted by a load */
  private loadInterrupted = false;

  constructor(deps: EngineDeps) {
    this.eventManager = deps.eventManager;
    this.historyManager = deps.historyManager;
    this.inventoryManager = deps.inventoryManager;
    this.navigationManager = deps.navigationManager;
    this.eventRunner = deps.eventRunner;
    this.saveManager = deps.saveManager;
    this.settingsManager = deps.settingsManager;
  }

  /** Reset all engine state and start a fresh game */
  startNewGame(): void {
    this.eventManager.resetAll();
    this.historyManager.clear();
    this.onNewGame?.();
    this.eventRunner.interrupt('new game');
    this.navigationManager.cancel();
  }

  /** Register events and start the game loop */
  async run(events: VylosEvent[], getState: () => VylosGameState, loop?: EngineLoopCallbacks): Promise<void> {
    this.eventManager.registerAll(events);
    this.running = true;

    logger.info('Engine started');

    while (this.running) {
      // Reset load-interrupted flag at the top of each iteration.
      // loadSave() sets this to interrupt the current event, but once
      // the loop resumes it must be cleared — otherwise events complete
      // without being finalized (stuck in 'running' forever).
      this.loadInterrupted = false;

      // Handle pending load resume before anything else
      if (this.pendingResume) {
        await this.handleResume(getState);
        continue;
      }

      const state = getState();

      // Update UI (locations, actions, background)
      loop?.onTick?.(state);

      // Evaluate event conditions
      this.eventManager.evaluate(state);

      // Get next unlocked event
      const event = this.eventManager.getNextUnlocked(state);

      if (event) {
        await this.executeEvent(event, getState);
        continue; // Re-evaluate after event execution
      }

      if (!this.running) break;

      // Wait for navigation input
      const nav = await this.navigationManager.waitForNavigation();

      switch (nav.action) {
        case NavigationAction.Back:
          this.handleBack();
          break;
        case NavigationAction.Forward:
          this.handleForward();
          break;
        case NavigationAction.Continue:
          // Continue to next loop iteration
          break;
        case NavigationAction.Location:
          if (nav.payload) {
            const s = getState();
            s.locationId = nav.payload;
          }
          break;
        case NavigationAction.Action:
          if (nav.payload) {
            loop?.onAction?.(nav.payload, getState());
          }
          break;
        case NavigationAction.DrawableEvent:
          if (nav.payload) {
            const drawableEvent = this.eventManager.get(nav.payload);
            if (drawableEvent) {
              await this.executeEvent(drawableEvent, getState);
            }
          }
          break;
      }
    }

    logger.info('Engine stopped');
  }

  /**
   * Load a save and resume execution.
   * Restores game state, history, event lock state, and sets up mid-event resume if needed.
   */
  loadSave(saveData: SaveSlot, setState: (state: VylosGameState) => void): void {
    logger.info('Loading save...');

    // Restore game state
    setState(JSON.parse(JSON.stringify(saveData.gameState)));
    logger.debug(`Restored game state (location: ${saveData.gameState.locationId})`);

    // Restore event lock state
    this.eventManager.resetAll();
    if (saveData.lockedEventIds) {
      this.eventManager.restoreLockedIds(saveData.lockedEventIds);
      logger.debug(`Restored ${saveData.lockedEventIds.length} locked events`);
    }

    // Restore history
    if (saveData.history) {
      this.historyManager.restore(saveData.history, saveData.historyIndex ?? -1);
      logger.debug(`Restored history (${saveData.history.length} entries, index ${saveData.historyIndex ?? -1})`);
    } else {
      this.historyManager.clear();
    }

    // Set up mid-event resume if saved during an event
    if (saveData.eventId && saveData.checkpoints?.length && saveData.initialState) {
      this.pendingResume = {
        eventId: saveData.eventId,
        checkpoints: saveData.checkpoints,
        initialState: saveData.initialState,
      };
      logger.debug(`Pending resume: ${saveData.eventId} (${saveData.checkpoints.length} checkpoints)`);
    }

    // Interrupt current execution so the loop picks up the new state
    this.loadInterrupted = true;
    this.eventRunner.interrupt('load');
    this.navigationManager.cancel();
    logger.info('Save loaded');
  }

  /** Execute a single event, handling jumps */
  private async executeEvent(event: VylosEvent, getState: () => VylosGameState): Promise<void> {
    let currentEvent: VylosEvent | undefined = event;

    while (currentEvent) {
      this.eventManager.setRunning(currentEvent.id);
      logger.debug(`Executing event: ${currentEvent.id}`);

      try {
        await this.eventRunner.executeEvent(currentEvent);

        // Skip lock/push if interrupted by a load
        if (this.loadInterrupted) return;

        // Event completed — check locked() to decide fate
        const state = getState();
        this.finishEvent(currentEvent, state);
        this.historyManager.push(currentEvent.id, this.eventRunner.checkpoints.getAll());
        currentEvent = undefined;
      } catch (error) {
        if (this.loadInterrupted) return;

        if (error instanceof JumpSignal) {
          // Finish current event, find jump target
          const state = getState();
          this.finishEvent(currentEvent, state);
          this.historyManager.push(currentEvent.id, this.eventRunner.checkpoints.getAll());

          const target = this.eventManager.get(error.targetEventId);
          if (target) {
            logger.debug(`Jump to: ${error.targetEventId}`);
            currentEvent = target;
          } else {
            logger.error(`Jump target not found: ${error.targetEventId}`);
            currentEvent = undefined;
          }
        } else {
          logger.error('Event execution error:', error);
          currentEvent = undefined;
        }
      }
    }
  }

  /** Handle resuming a mid-event save */
  private async handleResume(getState: () => VylosGameState): Promise<void> {
    const resume = this.pendingResume!;
    this.pendingResume = null;

    const event = this.eventManager.get(resume.eventId);
    if (!event) {
      logger.error(`Resume: event not found: ${resume.eventId}`);
      return;
    }

    this.eventManager.setRunning(resume.eventId);
    this.eventRunner.checkpoints.restore(resume.checkpoints);
    logger.debug(`Resuming event: ${resume.eventId} (${resume.checkpoints.length} checkpoints)`);

    try {
      await this.eventRunner.resumeEvent(event, resume.initialState);

      if (this.loadInterrupted) return;

      const state = getState();
      this.finishEvent(event, state);
      this.historyManager.push(resume.eventId, this.eventRunner.checkpoints.getAll());
    } catch (error) {
      if (this.loadInterrupted) return;

      if (error instanceof JumpSignal) {
        const state = getState();
        this.finishEvent(event, state);
        this.historyManager.push(resume.eventId, this.eventRunner.checkpoints.getAll());

        const target = this.eventManager.get(error.targetEventId);
        if (target) {
          logger.debug(`Resume jump to: ${error.targetEventId}`);
          await this.executeEvent(target, getState);
        }
      } else {
        logger.error('Resume execution error:', error);
      }
    }
  }

  /** After event execution: lock permanently or return to Ready */
  private finishEvent(event: VylosEvent, state: VylosGameState): void {
    if (event.locked?.(state) === true) {
      this.eventManager.setLocked(event.id);
    } else {
      this.eventManager.setReady(event.id);
    }
  }

  private handleBack(): void {
    const entry = this.historyManager.goBack();
    if (entry) {
      logger.debug(`History back: ${entry.eventId}`);
    }
  }

  private handleForward(): void {
    const entry = this.historyManager.goForward();
    if (entry) {
      logger.debug(`History forward: ${entry.eventId}`);
    }
  }

  /** Print a debug snapshot of the entire engine state to the console */
  debugPrint(): void {
    const runner = this.eventRunner.getDebugInfo();
    const eventCounts = this.eventManager.getStatusCounts();
    const nav = this.navigationManager;
    const hist = this.historyManager;

    console.group(`${logger.getPrefix()} Engine Debug`);

    // Engine loop
    console.log('Engine:', {
      running: this.running,
      loadInterrupted: this.loadInterrupted,
      pendingResume: this.pendingResume ? this.pendingResume.eventId : null,
    });

    // Event execution
    console.log('Event Runner:', {
      currentEvent: runner.currentEventId,
      step: runner.currentStep,
      interrupted: runner.interrupted,
      browsingHistory: runner.browsingHistory,
      browseIndex: runner.browseIndex,
      background: runner.currentBackground,
      foreground: runner.currentForeground,
      hasPendingRedo: runner.hasPendingRedo,
    });

    // Checkpoints
    console.log('Checkpoints:', {
      count: runner.checkpoints.count,
      isReplaying: runner.checkpoints.isReplaying,
      replayStep: runner.checkpoints.replayStep,
    });

    // Live dialogue
    if (runner.liveDialogue) {
      console.log('Live Dialogue:', {
        speaker: runner.liveDialogue.speaker?.name ?? '(narrator)',
        text: runner.liveDialogue.text,
      });
    }

    // Events by status
    console.group('Events:');
    for (const [status, data] of Object.entries(eventCounts)) {
      console.log(`${status}: ${data.count}`, data.ids);
    }
    console.groupEnd();

    // Navigation
    console.log('Navigation:', { waiting: nav.isWaiting });

    // History
    console.log('History:', {
      entries: hist.count,
      index: hist.index,
      canGoBack: hist.canGoBack,
      canGoForward: hist.canGoForward,
      currentEvent: hist.current?.eventId ?? null,
    });

    console.groupEnd();
  }

  /** Stop the engine loop */
  stop(): void {
    this.running = false;
    this.eventRunner.interrupt('engine stopped');
    this.navigationManager.cancel();
  }
}
