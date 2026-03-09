import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.global.actions;

const openInventory: Action = {
  id: 'open_inventory',
  label: t.openInventory,

  execute(_engine, state) {
    state.ui.inventoryOpen = true;
  },
};

export default openInventory;
