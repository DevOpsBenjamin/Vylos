import type { VylosConfig } from '@vylos/core';

export default {
  name: 'Vylos Basic Demo',
  id: '1-basic',
  version: '0.1.0',
  languages: [{ code: 'en', label: 'English' }],
  defaultLanguage: 'en',
  defaultLocation: 'home',
  startGameTime: 8,
  resolution: { width: 1920, height: 1080 },
} satisfies VylosConfig;
