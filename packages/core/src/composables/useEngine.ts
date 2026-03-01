import { inject } from 'vue';
import type { Engine } from '../engine/core/Engine';
import { logger } from '../engine/utils/logger';

export const ENGINE_INJECT_KEY = 'vylos-engine';

/**
 * Composable that provides access to the engine instance via inject.
 * Must be used inside a component that is a descendant of GameShell.
 */
export function useEngine(): Engine {
  const engine = inject<Engine>(ENGINE_INJECT_KEY);
  if (!engine) {
    throw new Error(`${logger.getPrefix()} useEngine() called outside of GameShell context. Make sure the component is a descendant of GameShell.`);
  }
  return engine;
}
