import type { LocationManager } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default function (lm: LocationManager<GameState>) {
  lm.link('apartment', 'hallway');
  lm.link('hallway', ['apartment', 'cafe', 'park']);
  lm.link('cafe', 'hallway');
  lm.link('park', 'hallway');
  lm.link('hallway', 'neighbor', { condition: (s) => s.characters.lena.known });
  lm.link('neighbor', 'hallway');
}
