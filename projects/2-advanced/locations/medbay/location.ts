import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const medbay = {
  id: 'medbay',
  name: { en: 'Medbay', fr: 'Infirmerie' },
  backgrounds: [
    { path: 'assets/locations/medbay/bg/day.png', timeRange: [6, 18] as [number, number] },
    { path: 'assets/locations/medbay/bg/night.png', timeRange: [18, 6] as [number, number] },
  ],
} satisfies VylosLocation<GameState>;

export default medbay;
