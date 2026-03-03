import type { VylosLocation } from '@vylos/core';

const park: VylosLocation = {
  id: 'park',
  name: { en: 'Riverside Park', fr: 'Parc de la Riviere' },
  backgrounds: [
    { path: '/assets/locations/park/park_day.jpg', timeRange: [6, 17] },
    { path: '/assets/locations/park/park_sunset.jpg', timeRange: [17, 20] },
    { path: '/assets/locations/park/park_night.jpg', timeRange: [20, 6] },
  ],
};

export default park;
