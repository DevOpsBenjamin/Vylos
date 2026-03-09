export interface ScannerCell {
  scanned: boolean;
  anomalyId: string | null;
}

export interface ScannerState {
  grid: ScannerCell[][];
  scansRemaining: number;
  anomaliesFound: string[];
  lastDiscovery: string | null;
}

export function createScannerState(): ScannerState {
  const grid: ScannerCell[][] = Array.from({ length: 6 }, () =>
    Array.from({ length: 6 }, () => ({ scanned: false, anomalyId: null })),
  );
  return {
    grid,
    scansRemaining: 3,
    anomaliesFound: [],
    lastDiscovery: null,
  };
}
