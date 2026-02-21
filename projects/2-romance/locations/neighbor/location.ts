import type { VylosLocation, BaseGameState } from '@vylos/core';

const neighbor: VylosLocation = {
  id: 'neighbor',
  name: { en: "Lena's Apartment", fr: "Appartement de Lena" },
  backgrounds: [
    { path: '/locations/neighbor/assets/lena_apartment.png' },
  ],
  accessible(state: BaseGameState) {
    return state.flags['knows_lena'] === true;
  },
};

export default neighbor;
