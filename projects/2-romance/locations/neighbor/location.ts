import type { VylosLocation, VylosGameState } from '@vylos/core';

const neighbor: VylosLocation = {
  id: 'neighbor',
  name: { en: "Lena's Apartment", fr: "Appartement de Lena" },
  backgrounds: [
    { path: '/assets/locations/neighbor/lena_apartment.png' },
  ],
  accessible(state: VylosGameState) {
    return state.flags['knows_lena'] === true;
  },
};

export default neighbor;
