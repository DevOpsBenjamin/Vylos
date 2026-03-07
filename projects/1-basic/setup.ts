import type { VylosPlugin } from '@vylos/core';
import { DI_TOKENS, InventoryManager } from '@vylos/core';
import { useGameStore } from '@game/gameState';
import { CATEGORIES, ITEMS } from '@game/items';

const plugin: VylosPlugin = {
  setup(container) {
    const im = container.resolve<InventoryManager>(DI_TOKENS.InventoryManager);
    im.registerCategories(CATEGORIES);
    im.registerItems(ITEMS);
  },
  gameStore: (pinia) => useGameStore(pinia),
};

export default plugin;
