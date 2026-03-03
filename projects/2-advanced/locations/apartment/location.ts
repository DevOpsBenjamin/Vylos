import type { VylosLocation } from '@vylos/core';

const apartment: VylosLocation = {
  id: 'apartment',
  name: { en: 'Your Apartment', fr: 'Votre Appartement' },
  backgrounds: [
    { path: '/assets/locations/apartment/apartment_day.png', timeRange: [6, 20] },
    { path: '/assets/locations/apartment/apartment_night.png', timeRange: [20, 6] },
  ],
};

export default apartment;
