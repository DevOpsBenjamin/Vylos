import type { LocationManager } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default function (lm: LocationManager<GameState>) {
  lm.link('homescreen', ['messages', 'gallery', 'settings']);
  lm.link('messages', 'homescreen');
  lm.link('gallery', 'homescreen');
  lm.link('settings', 'homescreen');
}
