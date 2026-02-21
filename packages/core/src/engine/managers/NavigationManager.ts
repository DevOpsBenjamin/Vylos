import { WaitManager } from './WaitManager';
import { logger } from '../utils/logger';

export enum NavigationAction {
  Continue = 'continue',
  Back = 'back',
  Forward = 'forward',
  Action = 'action',
  Location = 'location',
}

export interface NavigationResult {
  action: NavigationAction;
  payload?: string;
}

/**
 * Manages navigation between game loop ticks.
 * The engine waits here for player input after each event completes.
 */
export class NavigationManager {
  private waitManager = new WaitManager();

  /** Whether the engine is currently waiting for navigation input */
  get isWaiting(): boolean {
    return this.waitManager.isWaiting;
  }

  /** Wait for the next navigation action from the player */
  async waitForNavigation(): Promise<NavigationResult> {
    return this.waitManager.wait<NavigationResult>();
  }

  /** Player wants to continue (advance to next event) */
  continue(): void {
    logger.debug('Navigation: continue');
    this.waitManager.resolve({ action: NavigationAction.Continue });
  }

  /** Player wants to go back */
  goBack(): void {
    logger.debug('Navigation: back');
    this.waitManager.resolve({ action: NavigationAction.Back });
  }

  /** Player wants to go forward */
  goForward(): void {
    logger.debug('Navigation: forward');
    this.waitManager.resolve({ action: NavigationAction.Forward });
  }

  /** Player selected an action */
  selectAction(actionId: string): void {
    logger.debug('Navigation: action', actionId);
    this.waitManager.resolve({ action: NavigationAction.Action, payload: actionId });
  }

  /** Player selected a location to travel to */
  selectLocation(locationId: string): void {
    logger.debug('Navigation: location', locationId);
    this.waitManager.resolve({ action: NavigationAction.Location, payload: locationId });
  }

  /** Cancel waiting (e.g., on game reset). Resolves the wait with Continue to unblock. */
  cancel(): void {
    this.waitManager.resolve({ action: NavigationAction.Continue });
  }
}
