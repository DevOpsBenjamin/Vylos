import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/global/actions';

const openScanner = {
  id: 'open_scanner',
  label: t.openScanner,

  execute(_engine: VylosActionAPI, state: GameState) {
    state.ui.scannerOpen = true;
  },
} satisfies VylosAction<GameState>;

export default openScanner;
