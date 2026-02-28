import type { Plugin, ViteDevServer } from 'vite';
import { resolve } from 'path';
import { existsSync, cpSync, readdirSync } from 'fs';

/** Normalize a path to forward slashes (Windows compatibility). */
function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

/** Escape a string for safe inclusion in a single-quoted JavaScript string literal. */
function escapeForStringLiteral(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Recursively collect all `.ts` files under `dir`.
 * Returns absolute paths with forward slashes.
 */
function collectTsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(normalizePath(full));
    }
  }
  return results;
}

/** An import alias and its normalized absolute path. */
interface ImportEntry {
  alias: string;
  path: string;
}

/** List subdirectories under `dir` (returns empty array if dir doesn't exist). */
function listSubdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => resolve(dir, e.name));
}

/**
 * Collect imports from per-location subdirectories and a global directory.
 * For each location subdirectory, scans `<locationDir>/<subdir>` for .ts files.
 * Then scans `<globalDir>/<subdir>` for additional .ts files.
 */
function collectImports(
  locationsDir: string,
  globalDir: string,
  subdir: string,
  prefix: string,
): ImportEntry[] {
  const imports: ImportEntry[] = [];
  for (const locDir of listSubdirs(locationsDir)) {
    for (const file of collectTsFiles(resolve(locDir, subdir))) {
      imports.push({ alias: `${prefix}${imports.length}`, path: file });
    }
  }
  for (const file of collectTsFiles(resolve(globalDir, subdir))) {
    imports.push({ alias: `${prefix}${imports.length}`, path: file });
  }
  return imports;
}

/**
 * Scan the project root and generate the code for the `virtual:vylos-project`
 * module. Returns eagerly-imported locations, events, actions, and optionally
 * initLinks.
 */
function generateAutoDiscoveryCode(projectRoot: string): string {
  const locationsDir = resolve(projectRoot, 'locations');
  const globalDir = resolve(projectRoot, 'global');

  // Discover location definition files
  const locationImports: ImportEntry[] = [];
  for (const locDir of listSubdirs(locationsDir)) {
    const locationFile = resolve(locDir, 'location.ts');
    if (existsSync(locationFile)) {
      locationImports.push({
        alias: `_loc${locationImports.length}`,
        path: normalizePath(locationFile),
      });
    }
  }

  // Discover event and action files (per-location + global)
  const eventImports = collectImports(locationsDir, globalDir, 'events', '_evt');
  const actionImports = collectImports(locationsDir, globalDir, 'actions', '_act');

  // Optional links file
  const linksPath = resolve(projectRoot, 'links.ts');
  const hasLinks = existsSync(linksPath);

  // --- Generate code ---
  const allImports = [...locationImports, ...eventImports, ...actionImports];
  const lines: string[] = allImports.map(
    (imp) => `import * as ${imp.alias}_mod from '${escapeForStringLiteral(imp.path)}';`,
  );
  if (hasLinks) {
    lines.push(`import * as _links_mod from '${escapeForStringLiteral(normalizePath(linksPath))}';`);
  }

  lines.push('');
  lines.push(`function _unwrap(mod, path) {`);
  lines.push(`  if (mod.default === undefined || mod.default === null) {`);
  lines.push(`    console.error('[vylos] File "' + path + '" does not have a default export. Add "export default { ... }" to include it in auto-discovery. Skipping this file.');`);
  lines.push(`  }`);
  lines.push(`  return mod.default;`);
  lines.push(`}`);
  lines.push('');

  function toUnwrapList(imports: ImportEntry[]): string {
    return imports.map((imp) => `_unwrap(${imp.alias}_mod, '${escapeForStringLiteral(imp.path)}')`).join(', ');
  }

  lines.push(`export const locations = [${toUnwrapList(locationImports)}].filter(Boolean);`);
  lines.push(`export const events = [${toUnwrapList(eventImports)}].filter(Boolean);`);
  lines.push(`export const actions = [${toUnwrapList(actionImports)}].filter(Boolean);`);

  if (hasLinks) {
    lines.push(
      `export const initLinks = _unwrap(_links_mod, '${escapeForStringLiteral(normalizePath(linksPath))}');`,
    );
  }

  return lines.join('\n') + '\n';
}

/**
 * Vite plugin that resolves virtual module `vylos:project` to the project's config,
 * and `virtual:vylos-project` to auto-discovered locations/events/actions.
 * Also serves project assets in dev and copies them in build.
 */
export function vylosProjectPlugin(projectRoot: string): Plugin {
  const virtualModuleId = 'vylos:project';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const autoDiscoveryId = 'virtual:vylos-project';
  const resolvedAutoDiscoveryId = '\0' + autoDiscoveryId;

  let server: ViteDevServer | undefined;

  return {
    name: 'vylos-project',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      if (id === autoDiscoveryId) {
        return resolvedAutoDiscoveryId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        const configPath = normalizePath(resolve(projectRoot, 'vylos.config.ts'));
        const setupPath = resolve(projectRoot, 'setup.ts');

        let code = `export { default as config } from '${configPath}';\n`;

        if (existsSync(setupPath)) {
          code += `export { default as plugin } from '${normalizePath(setupPath)}';\n`;
        } else {
          code += `export const plugin = undefined;\n`;
        }

        return code;
      }

      if (id === resolvedAutoDiscoveryId) {
        return generateAutoDiscoveryCode(projectRoot);
      }
    },

    configureServer(devServer) {
      server = devServer;
      const assetsDir = resolve(projectRoot, 'assets');

      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        // Rewrite /assets/... to project assets dir
        if (req.url.startsWith('/assets/')) {
          const assetPath = resolve(assetsDir, req.url.slice('/assets/'.length));
          const normalizedAssetPath = normalizePath(assetPath);
          const normalizedAssetsDir = normalizePath(assetsDir);
          if (normalizedAssetPath.startsWith(normalizedAssetsDir + '/') && existsSync(assetPath)) {
            req.url = '/@fs/' + normalizedAssetPath;
          }
        }

        next();
      });

      // HMR: watch for file add/remove in scanned directories
      const locationsDir = normalizePath(resolve(projectRoot, 'locations'));
      const globalEventsDir = normalizePath(
        resolve(projectRoot, 'global', 'events'),
      );
      const globalActionsDir = normalizePath(
        resolve(projectRoot, 'global', 'actions'),
      );
      const linksPath = normalizePath(resolve(projectRoot, 'links.ts'));

      function isInWatchedDir(filePath: string): boolean {
        const normalized = normalizePath(filePath);
        return (
          normalized.startsWith(locationsDir + '/') ||
          normalized.startsWith(globalEventsDir + '/') ||
          normalized.startsWith(globalActionsDir + '/')
        );
      }

      function isLinksFile(filePath: string): boolean {
        return normalizePath(filePath) === linksPath;
      }

      function invalidateAutoDiscovery() {
        const mod = server?.moduleGraph.getModuleById(resolvedAutoDiscoveryId);
        if (mod) {
          server!.moduleGraph.invalidateModule(mod);
          server!.ws.send({ type: 'full-reload' });
        }
      }

      server.watcher.on('add', (filePath) => {
        if (isLinksFile(filePath) || (filePath.endsWith('.ts') && isInWatchedDir(filePath))) {
          invalidateAutoDiscovery();
        }
      });

      server.watcher.on('unlink', (filePath) => {
        if (isLinksFile(filePath) || (filePath.endsWith('.ts') && isInWatchedDir(filePath))) {
          invalidateAutoDiscovery();
        }
      });
    },

    writeBundle() {
      const assetsDir = resolve(projectRoot, 'assets');
      const outDir = resolve(projectRoot, 'dist', 'assets');

      if (existsSync(assetsDir)) {
        cpSync(assetsDir, outDir, { recursive: true });
      }
    },
  };
}
