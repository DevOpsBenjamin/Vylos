import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const airlock = {
  id: 'airlock',
  name: { en: 'Airlock / Storage', fr: 'Sas / Stockage' },
  backgrounds: [
    { path: 'assets/locations/airlock/bg/day.png', timeRange: [6, 18] as [number, number] },
    { path: 'assets/locations/airlock/bg/night.png', timeRange: [18, 6] as [number, number] },
  ],
} satisfies VylosLocation<GameState>;

export default airlock;
