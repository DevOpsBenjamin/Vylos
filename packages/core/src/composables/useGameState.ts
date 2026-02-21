import { useGameStateStore } from '../stores/gameState';

/**
 * Composable wrapping the gameState Pinia store for reactive access.
 */
export function useGameState() {
  const store = useGameStateStore();
  return store;
}
