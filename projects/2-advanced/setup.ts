import type { VylosPlugin } from '@vylos/core';
import { useGameStore } from '@game/gameState';
import AegisTopBar from '@game/components/AegisTopBar.vue';
import AegisActionOverlay from '@game/components/AegisActionOverlay.vue';
import AegisLocationOverlay from '@game/components/AegisLocationOverlay.vue';
import AegisDialogueBox from '@game/components/AegisDialogueBox.vue';

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
    TopBar: AegisTopBar,
    ActionOverlay: AegisActionOverlay,
    LocationOverlay: AegisLocationOverlay,
    DialogueBox: AegisDialogueBox,
  },
  gameStore: (pinia) => useGameStore(pinia),
};

export default plugin;
