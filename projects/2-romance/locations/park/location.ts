import type { VylosLocation } from '@vylos/core';

const park: VylosLocation = {
  id: 'park',
  name: { en: 'Riverside Park', fr: 'Parc de la Riviere' },
  backgrounds: [
    { path: '/locations/park/assets/park_day.jpg', timeRange: [6, 17] },
    { path: '/locations/park/assets/park_sunset.jpg', timeRange: [17, 20] },
    { path: '/locations/park/assets/park_night.jpg', timeRange: [20, 6] },
  ],
};

export default park;
