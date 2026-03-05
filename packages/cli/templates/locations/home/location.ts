import type { VylosLocation } from '@vylos/core';

const home: VylosLocation = {
  id: 'home',
  name: 'Home',
  backgrounds: [
    { path: 'assets/locations/apartment/day.png', timeRange: [6, 18] },
    { path: 'assets/locations/apartment/night.png', timeRange: [18, 6] }
  ]
};

export default home;
