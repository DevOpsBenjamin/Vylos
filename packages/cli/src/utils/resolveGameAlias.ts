import { resolve } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

/**
 * Scans `plugins/` for the first subdirectory and returns its absolute path.
 * Returns null if no plugins directory or no subdirectory exists.
 */
export function resolveGameAlias(projectRoot: string): string | null {
  const pluginsDir = resolve(projectRoot, 'plugins');
  if (!existsSync(pluginsDir)) return null;

  const dirs = readdirSync(pluginsDir).filter(f =>
    statSync(resolve(pluginsDir, f)).isDirectory(),
  );

  return dirs.length > 0 ? resolve(pluginsDir, dirs[0]) : null;
}
