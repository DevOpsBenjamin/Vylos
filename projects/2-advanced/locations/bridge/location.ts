import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const bridge = {
  id: 'bridge',
  name: { en: 'Command Bridge', fr: 'Passerelle de Commandement' },
  backgrounds: [
    { path: 'assets/locations/bridge/bg/day.png', timeRange: [6, 18] as [number, number] },
    { path: 'assets/locations/bridge/bg/night.png', timeRange: [18, 6] as [number, number] },
  ],
} satisfies VylosLocation<GameState>;

export default bridge;
