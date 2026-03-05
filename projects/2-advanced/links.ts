import type { LocationManager, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

export default function (lm: LocationManager) {
  lm.link('apartment', 'hallway');
  lm.link('hallway', ['apartment', 'cafe', 'park']);
  lm.link('cafe', 'hallway');
  lm.link('park', 'hallway');
  lm.link('hallway', 'neighbor', { condition: (s: VylosGameState) => (s as AdvancedGameState).characters.lena.known });
  lm.link('neighbor', 'hallway');
}
