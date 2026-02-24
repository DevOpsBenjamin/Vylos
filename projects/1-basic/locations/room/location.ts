import type { VylosLocation } from '@vylos/core';

const room: VylosLocation = {
  id: 'room',
  name: 'A Simple Room',
  backgrounds: [
    { path: '/locations/room/assets/room_day.png', timeRange: [6, 20] },
    { path: '/locations/room/assets/room_night.png', timeRange: [20, 6] },
  ],
};

export default room;
