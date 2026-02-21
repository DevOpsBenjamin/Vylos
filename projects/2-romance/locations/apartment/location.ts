import type { VylosLocation } from '@vylos/core';

const apartment: VylosLocation = {
  id: 'apartment',
  name: { en: 'Your Apartment', fr: 'Votre Appartement' },
  backgrounds: [
    { path: '/locations/apartment/assets/apartment_day.png', timeRange: [6, 20] },
    { path: '/locations/apartment/assets/apartment_night.png', timeRange: [20, 6] },
  ],
};

export default apartment;
