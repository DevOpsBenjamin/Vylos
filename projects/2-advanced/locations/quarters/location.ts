import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const quarters = {
  id: 'quarters',
  name: { en: 'Crew Quarters', fr: "Quartiers de l'Équipage" },
  backgrounds: [
    { path: 'assets/locations/quarters/bg/day.png', timeRange: [6, 18] as [number, number] },
    { path: 'assets/locations/quarters/bg/night.png', timeRange: [18, 6] as [number, number] },
  ],
} satisfies VylosLocation<GameState>;

export default quarters;
