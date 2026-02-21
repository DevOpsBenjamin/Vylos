import type {
  VylosAPI,
  VylosEvent,
  BaseGameState,
  TextEntry,
  SayOptions,
  ChoiceItem,
  CheckpointType,
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

  constructor(callbacks: EventRunnerCallbacks) {
    this.callbacks = callbacks;
    this.checkpoints = new CheckpointManager();
  }

  /** Execute an event, handling jump signals and interrupts */
  async executeEvent(event: VylosEvent): Promise<void> {
    this.checkpoints.clear();
    this.currentStep = 0;
    this.interrupted = false;

    try {
      const state = this.callbacks.getState();
      await event.execute(this, state);
    } catch (error) {
      if (error instanceof JumpSignal) {
        throw error; // Propagate to engine for handling
      }
      if (error instanceof EventEndError) {
        logger.debug('Event ended normally');
        return;
      }
      if (error instanceof InterruptSignal) {
        logger.debug('Event interrupted:', error.reason);
        return;
      }
      throw error;
    } finally {
      this.callbacks.onClear();
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

    // Show dialogue in UI
    this.callbacks.onSay(resolvedText, speaker);

    // Wait for player to click continue
    await this.waitManager.wait();

    // Capture checkpoint after interaction
    this.checkpoints.capture(
      this.callbacks.getState(),
      'say' as CheckpointType,
    );

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

    // Capture checkpoint with choice result
    this.checkpoints.capture(
      this.callbacks.getState(),
      'choice' as CheckpointType,
      result,
    );

    this.callbacks.onClear();
    this.currentStep++;
    return result as T;
  }

  setBackground(path: string): void {
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

  /** Check if execution should be interrupted */
  private checkInterrupt(): void {
    if (this.interrupted) {
      throw new InterruptSignal('execution interrupted');
    }
  }
}
