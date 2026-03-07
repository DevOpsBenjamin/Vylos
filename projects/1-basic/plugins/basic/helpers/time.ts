import type { GameState } from '@game/gameState';

/** Advance game time. If it is past 9 PM, skip ahead to morning instead. */
export function advanceTime(state: GameState, hours: number): void {
    if (state.gameTime % 24 > 21) {
        state.gameTime += 8;
    } else {
        state.gameTime += hours;
    }
}