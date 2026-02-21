import type { VylosEvent, BaseGameState, Checkpoint, SaveSlot } from '../types';
import { EventManager } from '../managers/EventManager';
import { HistoryManager } from '../managers/HistoryManager';
import { NavigationManager, NavigationAction } from '../managers/NavigationManager';
import { SaveManager } from '../managers/SaveManager';
import { SettingsManager } from '../managers/SettingsManager';
import { EventRunner } from './EventRunner';
import { JumpSignal } from '../errors/JumpSignal';
import { logger } from '../utils/logger';

export interface EngineLoopCallbacks {
  /** Called each loop iteration (update UI: available locations, actions, background) */
  onTick?(state: BaseGameState): void;
  /** Called when player selects an action */
  onAction?(actionId: string, state: BaseGameState): void;
}

export interface EngineDeps {
  eventManager: EventManager;
  historyManager: HistoryManager;
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
  readonly navigationManager: NavigationManager;
  readonly eventRunner: EventRunner;
  readonly saveManager: SaveManager;
  readonly settingsManager: SettingsManager;
  private running = false;

  /** Pending mid-event resume after load */
  private pendingResume: {
    eventId: string;
    checkpoints: Checkpoint[];
    initialState: BaseGameState;
  } | null = null;

  /** Flag to skip event lock/push when interrupted by a load */
  private loadInterrupted = false;

  constructor(deps: EngineDeps) {
    this.eventManager = deps.eventManager;
    this.historyManager = deps.historyManager;
    this.navigationManager = deps.navigationManager;
    this.eventRunner = deps.eventRunner;
    this.saveManager = deps.saveManager;
    this.settingsManager = deps.settingsManager;
  }

  /** Register events and start the game loop */
  async run(events: VylosEvent[], getState: () => BaseGameState, loop?: EngineLoopCallbacks): Promise<void> {
    this.eventManager.registerAll(events);
    this.running = true;

    logger.info('Engine started');

    while (this.running) {
      // Handle pending load resume before anything else
      if (this.pendingResume) {
        this.loadInterrupted = false;
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
      }
    }

    logger.info('Engine stopped');
  }

  /**
   * Load a save and resume execution.
   * Restores game state, history, event lock state, and sets up mid-event resume if needed.
   */
  loadSave(saveData: SaveSlot, setState: (state: BaseGameState) => void): void {
    // Restore game state
    setState(JSON.parse(JSON.stringify(saveData.gameState)));

    // Restore event lock state
    this.eventManager.resetAll();
    if (saveData.lockedEventIds) {
      this.eventManager.restoreLockedIds(saveData.lockedEventIds);
    }

    // Restore history
    if (saveData.history) {
      this.historyManager.restore(saveData.history, saveData.historyIndex ?? -1);
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
    }

    // Interrupt current execution so the loop picks up the new state
    this.loadInterrupted = true;
    this.eventRunner.interrupt('load');
    this.navigationManager.cancel();
  }

  /** Execute a single event, handling jumps */
  private async executeEvent(event: VylosEvent, getState: () => BaseGameState): Promise<void> {
    let currentEvent: VylosEvent | undefined = event;

    while (currentEvent) {
      this.eventManager.setRunning(currentEvent.id);
      logger.debug(`Executing event: ${currentEvent.id}`);

      try {
        await this.eventRunner.executeEvent(currentEvent);

        // Skip lock/push if interrupted by a load
        if (this.loadInterrupted) return;

        // Event completed successfully
        const state = getState();
        this.eventManager.setLocked(currentEvent.id, state);
        this.historyManager.push(currentEvent.id, this.eventRunner.checkpoints.getAll());
        currentEvent = undefined;
      } catch (error) {
        if (this.loadInterrupted) return;

        if (error instanceof JumpSignal) {
          // Lock current event, find jump target
          const state = getState();
          this.eventManager.setLocked(currentEvent.id, state);
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
  private async handleResume(getState: () => BaseGameState): Promise<void> {
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
      this.eventManager.setLocked(resume.eventId, state);
      this.historyManager.push(resume.eventId, this.eventRunner.checkpoints.getAll());
    } catch (error) {
      if (this.loadInterrupted) return;

      if (error instanceof JumpSignal) {
        const state = getState();
        this.eventManager.setLocked(resume.eventId, state);
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

  /** Stop the engine loop */
  stop(): void {
    this.running = false;
    this.eventRunner.interrupt('engine stopped');
    this.navigationManager.cancel();
  }
}
