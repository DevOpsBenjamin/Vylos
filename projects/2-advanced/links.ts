import type { LocationManager } from '@vylos/core';

/**
 * Hub-and-spoke navigation graph for the Aegis station.
 * Bridge is the central hub connecting to all other modules.
 */
export default function registerLinks(locationManager: LocationManager): void {
  // TODO: Hub — Bridge connects to all modules
  // locationManager.link('bridge', ['reactor', 'medbay', 'airlock', 'quarters']);

  // TODO: Spokes — each module connects back to Bridge
  // locationManager.link('reactor', 'bridge');
  // locationManager.link('medbay', 'bridge');
  // locationManager.link('airlock', 'bridge');
  // locationManager.link('quarters', 'bridge');

  // TODO: Add conditional links (e.g., airlock requires EVA suit)
  // locationManager.link('airlock', 'exterior', {
  //   condition: (state) => state.flags.hasEvaSuit,
  // });
}
