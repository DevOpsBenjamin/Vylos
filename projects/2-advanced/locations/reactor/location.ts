import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const reactor = {
  id: 'reactor',
  name: { en: 'Reactor Core', fr: 'Coeur du Réacteur' },
  backgrounds: [
    { path: 'assets/locations/reactor/bg/day.png', timeRange: [6, 18] as [number, number] },
    { path: 'assets/locations/reactor/bg/night.png', timeRange: [18, 6] as [number, number] },
  ],
} satisfies VylosLocation<GameState>;

export default reactor;
