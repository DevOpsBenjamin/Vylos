import type { VylosPlugin } from '@vylos/core';

// TODO: Import useGameStore from '@game/gameStore' once implemented
// TODO: Import scanner and inventory plugin setup once implemented

/**
 * Aegis Protocol plugin — composes station scanner, inventory,
 * and component overrides into a single VylosPlugin.
 */
const plugin: VylosPlugin = {
  setup(_context) {
    // TODO: Register inventory categories and items
    // TODO: Initialize station scanner
  },
  components: {
    // TODO: Override with Aegis-themed components
    // DialogueBox: AegisDialogueBox,
    // TopBar: AegisTopBar,
    // ActionOverlay: AegisActionOverlay,
    // LocationOverlay: AegisLocationOverlay,
    // Background: AegisBackground,
  },
  // TODO: Wire custom game store
  // gameStore: (pinia) => useGameStore(pinia),
};

export default plugin;
