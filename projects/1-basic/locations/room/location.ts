import type { VylosLocation } from '@vylos/core';

const room: VylosLocation = {
  id: 'room',
  name: 'A Simple Room',
  backgrounds: [
    { path: '/assets/locations/room/room_day.png', timeRange: [6, 20] },
    { path: '/assets/locations/room/room_night.png', timeRange: [20, 6] },
  ],
};

export default room;
