/**
 * Typed flags for story progression and system events.
 * Action triggers live on each module's `actionState` field instead.
 */
export interface AegisFlags {
  // Solar flare tracking
  solarFlareScheduledDay: number;
  solarFlareDay: number;
  solarFlareWarningGiven: boolean;

  // Story progression
  distressSignalSent: boolean;
  reactorRepaired: boolean;
  hullBreachSealed: boolean;

  // Intro
  introDone: boolean;

  // Crisis events
  oxygenCriticalTriggered: boolean;
  crewBreakdownTriggered: boolean;
}

export function createFlags(): AegisFlags {
  return {
    introDone: false,
    solarFlareScheduledDay: 0,
    solarFlareDay: 0,
    solarFlareWarningGiven: false,
    distressSignalSent: false,
    reactorRepaired: false,
    hullBreachSealed: false,
    oxygenCriticalTriggered: false,
    crewBreakdownTriggered: false,
  };
}
