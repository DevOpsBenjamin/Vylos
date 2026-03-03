import type { VylosConfig } from '@vylos/core';

export default {
  name: 'Vylos Advanced Demo',
  id: 'advanced',
  version: '0.1.0',
  languages: ['en', 'fr'],
  defaultLanguage: 'en',
  defaultLocation: 'apartment',
  startGameTime: 8,
  resolution: { width: 1920, height: 1080 },
} satisfies VylosConfig;
