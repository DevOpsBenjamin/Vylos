import type { LocationManager } from '@vylos/core';
import type { GameState } from '@game/gameState';

/**
 * Hub-and-spoke navigation graph for the Aegis station.
 * Bridge is the central hub connecting to all other modules.
 * Cross-connections: reactor ↔ airlock, medbay ↔ quarters.
 */
export default function registerLinks(lm: LocationManager<GameState>): void {
  // Hub — Bridge connects to all modules
  lm.link('bridge', ['reactor', 'medbay', 'airlock', 'quarters']);

  // Spokes — each module connects back to Bridge
  lm.link('reactor', 'bridge');
  lm.link('medbay', 'bridge');
  lm.link('airlock', 'bridge');
  lm.link('quarters', 'bridge');

  // Cross-connections (adjacent modules)
  lm.link('reactor', 'airlock');
  lm.link('airlock', 'reactor');
  lm.link('medbay', 'quarters');
  lm.link('quarters', 'medbay');
}
