import type { VylosPlugin } from '@vylos/core';
import { useRomanceGameStore } from './gameState';

const plugin: VylosPlugin = {
  gameStore: (pinia) => useRomanceGameStore(pinia),
};

export default plugin;
