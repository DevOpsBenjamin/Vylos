import type { LocationManager } from '@vylos/core';

export default function (lm: LocationManager) {
  lm.link('apartment', 'hallway');
  lm.link('hallway', ['apartment', 'cafe']);
  lm.link('cafe', 'hallway');
}
