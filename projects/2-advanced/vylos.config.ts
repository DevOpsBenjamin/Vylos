import type { VylosConfig } from '@vylos/core';

export default {
  name: 'Aegis Protocol',
  id: 'aegis',
  version: '1.0.0',
  languages: ['en', 'fr'],
  defaultLanguage: 'fr',
  defaultLocation: 'bridge',
  startGameTime: 8,
  resolution: { width: 1920, height: 1080 },
} satisfies VylosConfig;
