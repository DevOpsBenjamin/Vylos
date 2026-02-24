import { toRaw } from 'vue';
import type {
  VylosAPI,
  VylosEvent,
  BaseGameState,
  TextEntry,
  SayOptions,
  ChoiceItem,
  CheckpointType,
  ChoiceOption,
  DialogueState,
} from '../types';
import { CheckpointManager } from './CheckpointManager';
import { WaitManager } from '../managers/WaitManager';
import { JumpSignal } from '../errors/JumpSignal';
import { EventEndError } from '../errors/EventEndError';
import { InterruptSignal } from '../errors/InterruptSignal';
import { logger } from '../utils/logger';
import { interpolate } from '../utils/TimeHelper';

export interface EventRunnerCallbacks {
  /** Called when dialogue should be displayed */
  onSay(text: string, speaker: string | null): void;
  /** Called when choices should be displayed */
  onChoice(options: Array<{ text: string; value: string; disabled?: boolean }>): void;
  /** Called to update background */
  onSetBackground(path: string): void;
  /** Called to update foreground */
  onSetForeground(path: string | null): void;
  /** Called to show overlay */
  onShowOverlay(componentId: string, props?: Record<string, unknown>): void;
  /** Called to hide overlay */
  onHideOverlay(): void;
  /** Called when location changes */
  onSetLocation(locationId: string): void;
  /** Called to clear dialogue/choices (between steps) */
  onClear(): void;
  /** Resolve a TextEntry to a string using current language */
  resolveText(entry: string | TextEntry): string;
  /** Get current game state */
  getState(): BaseGameState;
  /** Set game state (after rollback) */
  setState(state: BaseGameState): void;
}

/** Data returned when browsing history steps */
export interface HistoryStep {
  type: 'say' | 'choice';
  dialogue?: DialogueState | null;
  choiceOptions?: ChoiceOption[];
  choiceResult?: string;
  stepIndex: number;
}

/**
 * EventRunner implements VylosAPI and drives event execution.
 *
 * It uses native async/await: each `say()` / `choice()` pauses the event function.
 * The WaitManager creates promises that the UI resolves when the player interacts.
 *
 * During rollback, it replays the event by instantly resolving promises
 * with stored checkpoint data until reaching the target step.
 */
export class EventRunner implements VylosAPI {
  readonly checkpoints: CheckpointManager;
  private waitManager = new WaitManager();
  private callbacks: EventRunnerCallbacks;
  private currentStep = 0;
  private interrupted = false;

  /** History browsing index (-1 = live, not browsing) */
  private browseIndex = -1;
  /** The live dialogue being displayed when history browsing started */
  private liveDialogue: { text: string; speaker: string | null } | null = null;
  /** Current background path (tracked for checkpoint storage) */
  private currentBackground: string | null = null;

  /** Snapshot of game state before event started (for redo) */
  private initialState: BaseGameState | null = null;
  /** Reference to the currently executing event (for redo) */
  private currentEvent: VylosEvent | null = null;
  /** Pending redo request (set by UI, consumed by redo loop) */
  private pendingRedo: { step: number; choice: string } | null = null;

  constructor(callbacks: EventRunnerCallbacks) {
    this.callbacks = callbacks;
    this.checkpoints = new CheckpointManager();
  }

  /** Whether the player is browsing text history */
  get isBrowsingHistory(): boolean {
    return this.browseIndex >= 0;
  }

  /** Current event ID (null if no event executing) */
  get currentEventId(): string | null {
    return this.currentEvent?.id ?? null;
  }

  /** Get initial state snapshot for save (deep clone) */
  getInitialState(): BaseGameState | null {
    return this.initialState ? structuredClone(this.initialState) : null;
  }

  /** Get the live dialogue for restoring display after exiting history */
  getLiveDialogue(): { text: string; speaker: string | null } | null {
    return this.liveDialogue;
  }

  /** Go back one step in history. Returns step data or null if at beginning. */
  historyBack(): HistoryStep | null {
    const targetIndex = this.browseIndex === -1
      ? this.checkpoints.count - 1  // Start from last completed checkpoint
      : this.browseIndex - 1;

    if (targetIndex < 0) return null;

    // Find a browsable checkpoint (say with dialogue, or choice with options)
    let idx = targetIndex;
    while (idx >= 0) {
      const cp = this.checkpoints.getAt(idx);
      if (cp?.dialogue || cp?.choiceOptions) break;
      idx--;
    }
    if (idx < 0) return null;

    this.browseIndex = idx;
    return this.buildHistoryStep(idx);
  }

  /** Go forward one step in history. Returns step data or null if exiting history. */
  historyForward(): HistoryStep | null {
    if (this.browseIndex === -1) return null;

    // Find next browsable checkpoint after current
    let idx = this.browseIndex + 1;
    while (idx < this.checkpoints.count) {
      const cp = this.checkpoints.getAt(idx);
      if (cp?.dialogue || cp?.choiceOptions) break;
      idx++;
    }

    if (idx >= this.checkpoints.count) {
      // Reached the end — return to live
      this.browseIndex = -1;
      return null;
    }

    this.browseIndex = idx;
    return this.buildHistoryStep(idx);
  }

  /** Exit history browsing without returning step data */
  exitHistoryBrowsing(): void {
    this.browseIndex = -1;
  }

  /** Request a choice redo from history (called by UI) */
  requestRedoChoice(stepIndex: number, newChoice: string): void {
    this.pendingRedo = { step: stepIndex, choice: newChoice };
    this.waitManager.reject(new InterruptSignal('choice redo'));
  }

  /** Execute an event, handling jump signals, interrupts, and redo */
  async executeEvent(event: VylosEvent): Promise<void> {
    this.initialState = structuredClone(toRaw(this.callbacks.getState()));
    this.currentEvent = event;
    this.checkpoints.clear();
    this.currentStep = 0;
    this.interrupted = false;
    this.browseIndex = -1;
    this.liveDialogue = null;
    this.pendingRedo = null;

    try {
      await this.runEventExecution(event);
    } finally {
      this.callbacks.onClear();
      this.initialState = null;
      this.currentEvent = null;
    }
  }

  /** Re-execute an event for rollback, fast-forwarding to targetStep */
  async rollbackTo(event: VylosEvent, targetStep: number): Promise<void> {
    const restoredState = this.checkpoints.prepareRollback(targetStep);
    if (!restoredState) {
      logger.warn('Cannot rollback to step', targetStep);
      return;
    }

    this.callbacks.setState(restoredState);
    this.currentStep = 0;
    this.interrupted = false;

    try {
      const state = this.callbacks.getState();
      await event.execute(this, state);
    } catch (error) {
      if (error instanceof JumpSignal) throw error;
      if (error instanceof EventEndError) return;
      if (error instanceof InterruptSignal) return;
      throw error;
    } finally {
      this.callbacks.onClear();
    }
  }

  /** Resume a saved mid-event execution (for load). Checkpoints must be restored externally first. */
  async resumeEvent(event: VylosEvent, savedInitialState: BaseGameState): Promise<void> {
    this.initialState = structuredClone(savedInitialState);
    this.currentEvent = event;
    this.currentStep = 0;
    this.interrupted = false;
    this.browseIndex = -1;
    this.liveDialogue = null;
    this.pendingRedo = null;

    // Restore to initial state, then replay through all stored checkpoints
    this.callbacks.setState(structuredClone(savedInitialState));
    this.checkpoints.setReplayTo(this.checkpoints.count);

    try {
      await this.runEventExecution(event);
    } finally {
      this.callbacks.onClear();
      this.initialState = null;
      this.currentEvent = null;
    }
  }

  /** Interrupt the current event execution */
  interrupt(reason: string): void {
    this.interrupted = true;
    this.waitManager.reject(new InterruptSignal(reason));
  }

  // --- VylosAPI Implementation ---

  async say(text: string | TextEntry, options?: SayOptions): Promise<void> {
    this.checkInterrupt();

    let resolvedText = this.callbacks.resolveText(text);

    // Interpolate variables
    if (options?.variables) {
      resolvedText = interpolate(resolvedText, options.variables);
    }

    // Resolve speaker
    let speaker: string | null = null;
    if (options?.from) {
      speaker = this.callbacks.resolveText(options.from);
    }

    // If replaying, fast-forward: capture checkpoint and resolve immediately
    if (this.checkpoints.isReplaying) {
      this.checkpoints.advanceReplay();
      this.currentStep++;
      return;
    }

    // Track the live dialogue (for history browsing restoration)
    this.liveDialogue = { text: resolvedText, speaker };

    // Show dialogue in UI
    this.callbacks.onSay(resolvedText, speaker);

    // Wait for player to click continue
    await this.waitManager.wait();

    // Exit history browsing if active
    this.browseIndex = -1;

    // Capture checkpoint after interaction (store dialogue for history)
    this.checkpoints.capture(
      this.callbacks.getState(),
      'say' as CheckpointType,
      undefined,
      {
        dialogue: { text: resolvedText, speaker, isNarration: !speaker },
        background: this.currentBackground,
      },
    );

    this.liveDialogue = null;
    this.callbacks.onClear();
    this.currentStep++;
  }

  async choice<T extends string>(items: ChoiceItem<T>[]): Promise<T> {
    this.checkInterrupt();

    // Filter by condition
    const available = items.filter(item => !item.condition || item.condition());

    // Resolve text entries
    const resolvedOptions = available.map(item => ({
      text: this.callbacks.resolveText(item.text),
      value: item.value,
      disabled: item.disabled,
    }));

    // If replaying, return stored choice result
    if (this.checkpoints.isReplaying) {
      const storedResult = this.checkpoints.getReplayChoiceResult();
      this.checkpoints.advanceReplay();
      this.currentStep++;
      if (storedResult !== undefined) {
        return storedResult as T;
      }
      // Fallback: if no stored result, pick first option
      logger.warn('No stored choice result during replay, using first option');
      return resolvedOptions[0].value as T;
    }

    // Show choices in UI
    this.callbacks.onChoice(resolvedOptions);

    // Wait for player selection
    const result = await this.waitManager.wait<string>();

    // Capture checkpoint with choice result and options (for history redo)
    this.checkpoints.capture(
      this.callbacks.getState(),
      'choice' as CheckpointType,
      result,
      { choiceOptions: resolvedOptions },
    );

    this.callbacks.onClear();
    this.currentStep++;
    return result as T;
  }

  setBackground(path: string): void {
    this.currentBackground = path;
    this.callbacks.onSetBackground(path);
  }

  setForeground(path: string | null): void {
    this.callbacks.onSetForeground(path);
  }

  async showOverlay(componentId: string, props?: Record<string, unknown>): Promise<void> {
    this.checkInterrupt();

    if (this.checkpoints.isReplaying) {
      this.checkpoints.advanceReplay();
      this.currentStep++;
      return;
    }

    this.callbacks.onShowOverlay(componentId, props);
    await this.waitManager.wait();

    this.checkpoints.capture(
      this.callbacks.getState(),
      'overlay' as CheckpointType,
    );

    this.currentStep++;
  }

  hideOverlay(): void {
    this.callbacks.onHideOverlay();
  }

  jump(eventId: string): never {
    throw new JumpSignal(eventId);
  }

  end(): never {
    throw new EventEndError();
  }

  async wait(ms: number): Promise<void> {
    this.checkInterrupt();

    if (this.checkpoints.isReplaying) {
      this.checkpoints.advanceReplay();
      this.currentStep++;
      return;
    }

    await new Promise<void>(resolve => setTimeout(resolve, ms));

    this.checkpoints.capture(
      this.callbacks.getState(),
      'wait' as CheckpointType,
    );
    this.currentStep++;
  }

  setLocation(locationId: string): void {
    this.callbacks.onSetLocation(locationId);
  }

  playSfx(_path: string): void {
    // TODO: Audio system
  }

  playMusic(_path: string): void {
    // TODO: Audio system
  }

  stopMusic(): void {
    // TODO: Audio system
  }

  /** Resolve the current wait (called by UI) */
  resolveWait(value?: unknown): void {
    this.waitManager.resolve(value);
  }

  // --- Private helpers ---

  /** Build a HistoryStep from a checkpoint at the given index */
  private buildHistoryStep(idx: number): HistoryStep {
    const cp = this.checkpoints.getAt(idx)!;
    if (cp.choiceOptions) {
      return {
        type: 'choice',
        choiceOptions: cp.choiceOptions,
        choiceResult: cp.choiceResult,
        stepIndex: idx,
      };
    }
    return {
      type: 'say',
      dialogue: cp.dialogue,
      stepIndex: idx,
    };
  }

  /** Inner execution loop that supports redo by restarting the event */
  private async runEventExecution(event: VylosEvent): Promise<void> {
    while (true) {
      try {
        const state = this.callbacks.getState();
        await event.execute(this, state);
        return; // success — event completed normally
      } catch (error) {
        if (error instanceof InterruptSignal) {
          if (this.pendingRedo) {
            this.setupRedo();
            continue; // retry with redo setup
          }
          logger.debug('Event interrupted:', error.reason);
          return;
        }
        if (error instanceof JumpSignal) throw error;
        if (error instanceof EventEndError) {
          logger.debug('Event ended normally');
          return;
        }
        throw error;
      }
    }
  }

  /** Prepare for redo: inject new choice, set replay, restore initial state */
  private setupRedo(): void {
    const redo = this.pendingRedo!;
    this.pendingRedo = null;

    // Inject the new choice at the target step
    this.checkpoints.updateChoiceAt(redo.step, redo.choice);
    // Replay from beginning through the target step (inclusive), then live
    this.checkpoints.setReplayTo(redo.step + 1);

    // Restore game state to before the event started
    this.callbacks.setState(structuredClone(this.initialState!));

    // Reset execution state
    this.currentStep = 0;
    this.browseIndex = -1;
    this.liveDialogue = null;
    this.interrupted = false;
  }

  /** Check if execution should be interrupted */
  private checkInterrupt(): void {
    if (this.interrupted) {
      throw new InterruptSignal('execution interrupted');
    }
  }
}
