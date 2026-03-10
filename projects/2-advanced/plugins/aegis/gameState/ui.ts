export interface AegisUIState {
  crewRosterOpen: boolean;
  stationOverviewOpen: boolean;
  crewAssignmentOpen: boolean;
  scannerOpen: boolean;
  inventoryOpen: boolean;
  /** Which crew is currently selected for assignment (null = none) */
  selectedCrewId: string | null;
}

export function createUIState(): AegisUIState {
  return {
    crewRosterOpen: false,
    stationOverviewOpen: false,
    crewAssignmentOpen: false,
    scannerOpen: false,
    inventoryOpen: false,
    selectedCrewId: null,
  };
}
