import type { VylosLocation, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const neighbor: VylosLocation = {
  id: 'neighbor',
  name: { en: "Lena's Apartment", fr: "Appartement de Lena" },
  backgrounds: [
    { path: '/assets/locations/neighbor/lena_apartment.png' },
  ],
  accessible(state: VylosGameState) {
    return (state as AdvancedGameState).characters.lena.known;
  },
};

export default neighbor;
