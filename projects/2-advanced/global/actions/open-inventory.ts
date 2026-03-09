import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.global.actions;

const openInventory = {
  id: 'open_inventory',
  label: t.openInventory,

  execute(_engine: VylosActionAPI, state: GameState) {
    state.ui.inventoryOpen = true;
  },
} satisfies VylosAction<GameState>;

export default openInventory;
