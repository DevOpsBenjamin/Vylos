import type { LocationManager } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default function (lm: LocationManager<GameState>) {
  lm.link('home', ['hallway']);
  lm.link('hallway', ['home']);
}
