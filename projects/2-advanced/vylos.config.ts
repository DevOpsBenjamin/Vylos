import type { VylosConfig } from '@vylos/core';

export default {
  name: 'Aegis Protocol',
  id: 'aegis',
  version: '1.0.0',
  languages: [{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }],
  defaultLanguage: 'fr',
  defaultLocation: 'bridge',
  startGameTime: 6,
  resolution: { width: 1920, height: 1080 },
} satisfies VylosConfig;
