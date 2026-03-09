import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.global.actions;

const openScanner: Action = {
  id: 'open_scanner',
  label: t.openScanner,

  execute(_engine, state) {
    state.ui.scannerOpen = true;
  },
};

export default openScanner;
