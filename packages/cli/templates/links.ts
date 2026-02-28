import type { LocationManager } from '@vylos/core';

export default function (lm: LocationManager) {
  lm.link('room', ['hallway']);
  lm.link('hallway', ['room']);
}
