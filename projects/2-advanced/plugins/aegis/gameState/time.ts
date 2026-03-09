import type { GameState } from './index';

export type ShiftPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeState {
  day: number;
  phase: ShiftPhase;
  totalPhases: number;
}

export const PHASES = ['dawn', 'day', 'dusk', 'night'] as const satisfies readonly ShiftPhase[];

export const PHASE_HOURS = {
  dawn: 6,
  day: 12,
  dusk: 18,
  night: 0,
} satisfies Record<ShiftPhase, number>;

/** Tuning knobs — tweak these to balance the 10-day survival loop. */
export const BALANCE = {
  oxygenPerShift: -3,
  energyPerShift: -2,
  materialsPerShift: 0,
  degradationPerShift: -2,
  stressPerOverwork: 10,
  stressPerFlare: 15,
  stressPerRest: -15,
  affinityPerGoodChoice: 10,
  affinityPerBadChoice: -5,
  repairAmount: 20,
  healAmount: Infinity,
  scavengeAmount: 8,
} as const;

export function createTimeState(): TimeState {
  return { day: 1, phase: 'dawn', totalPhases: 0 };
}

/**
 * Advance the shift phase by `ticks` steps.
 * Handles day rollover (night -> dawn = new day) and syncs gameTime.
 */
export function advanceTime(state: GameState, ticks = 1): void {
  for (let i = 0; i < ticks; i++) {
    const currentIndex = PHASES.indexOf(state.time.phase);
    const nextIndex = (currentIndex + 1) % PHASES.length;

    if (nextIndex === 0) {
      state.time.day++;
    }

    state.time.phase = PHASES[nextIndex];
    state.time.totalPhases++;
    state.gameTime = PHASE_HOURS[state.time.phase];
  }
}
