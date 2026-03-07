import type { VylosPlugin } from '@vylos/core';
import { useGameStore } from '@game/gameState';
import { CATEGORIES, ITEMS } from '@game/items';

const plugin: VylosPlugin = {
  setup({ inventoryManager }) {
    inventoryManager.registerCategories(CATEGORIES);
    inventoryManager.registerItems(ITEMS);
  },
  gameStore: (pinia) => useGameStore(pinia),
};

export default plugin;
