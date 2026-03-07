import type { LocationManager } from '@vylos/core';

export default function (lm: LocationManager) {
  lm.link('home', ['hallway']);
  lm.link('hallway', ['home']);
}
