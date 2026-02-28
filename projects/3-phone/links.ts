import type { LocationManager } from '@vylos/core';

export default function (lm: LocationManager) {
  lm.link('homescreen', ['messages', 'gallery', 'settings']);
  lm.link('messages', 'homescreen');
  lm.link('gallery', 'homescreen');
  lm.link('settings', 'homescreen');
}
