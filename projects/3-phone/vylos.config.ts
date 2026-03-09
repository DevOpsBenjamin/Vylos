import type { VylosConfig } from '@vylos/core';

export default {
  name: 'LifeOS',
  id: 'phone',
  version: '0.1.0',
  languages: [{ code: 'en', label: 'English' }],
  defaultLanguage: 'en',
  defaultLocation: 'homescreen',
  startGameTime: 22.5,
  resolution: { width: 390, height: 844 },
} satisfies VylosConfig;
