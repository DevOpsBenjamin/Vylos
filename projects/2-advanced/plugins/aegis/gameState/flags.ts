/**
 * Typed flags for event gating.
 * Using a typed interface instead of Record<string, boolean> gives
 * autocomplete and compile-time safety on every flag check.
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

  // Crisis events
  oxygenCriticalTriggered: boolean;
  crewBreakdownTriggered: boolean;
}

export function createFlags(): AegisFlags {
  return {
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
