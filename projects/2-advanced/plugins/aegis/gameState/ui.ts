export interface AegisUIState {
  crewRosterOpen: boolean;
  stationOverviewOpen: boolean;
  scannerOpen: boolean;
  inventoryOpen: boolean;
}

export function createUIState(): AegisUIState {
  return {
    crewRosterOpen: false,
    stationOverviewOpen: false,
    scannerOpen: false,
    inventoryOpen: false,
  };
}
