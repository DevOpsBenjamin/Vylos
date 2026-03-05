import type { VylosLocation } from '@vylos/core';
import type { GameState } from '@game/gameState';

const neighbor: VylosLocation = {
  id: 'neighbor',
  name: { en: "Lena's Apartment", fr: "Appartement de Lena" },
  backgrounds: [
    { path: '/assets/locations/neighbor/lena_apartment.png' },
  ],
  accessible: (state) => (state as GameState).characters.lena.known,
};

export default neighbor;
