import type { VylosPlugin } from '@vylos/core';
import { useBasicGameStore } from '@game/gameState';

const plugin: VylosPlugin = {
  gameStore: (pinia) => useBasicGameStore(pinia),
};

export default plugin;
