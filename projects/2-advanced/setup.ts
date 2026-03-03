import type { VylosPlugin } from '@vylos/core';
import { DI_TOKENS, InventoryManager } from '@vylos/core';
import { useAdvancedGameStore } from '@game/gameDatas/gameState';
import { CATEGORIES, ITEMS } from '@game/data/items';
import AdvancedTopBar from '@game/components/AdvancedTopBar.vue';
import JournalOverlay from '@game/components/JournalOverlay.vue';

const plugin: VylosPlugin = {
  setup(container) {
    const im = container.resolve<InventoryManager>(DI_TOKENS.InventoryManager);
    im.registerCategories(CATEGORIES);
    im.registerItems(ITEMS);
  },

  components: {
    TopBar: AdvancedTopBar,
    JournalOverlay,
  },

  gameStore: (pinia) => useAdvancedGameStore(pinia),
};

export default plugin;
