import type { VylosConfig } from '@vylos/core';

export default {
  name: 'My Vylos Game',
  id: 'my-game',
  version: '0.1.0',
  languages: ['en'],
  defaultLanguage: 'en',
  defaultLocation: 'home',
  resolution: { width: 1920, height: 1080 },
} satisfies VylosConfig;
