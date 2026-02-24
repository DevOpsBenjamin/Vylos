import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, cpSync } from 'fs';

/**
 * Vite plugin that resolves virtual module `vylos:project` to the project's config.
 * Also serves project assets in dev and copies them in build.
 */
export function vylosProjectPlugin(projectRoot: string): Plugin {
  const virtualModuleId = 'vylos:project';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vylos-project',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        const configPath = resolve(projectRoot, 'vylos.config.ts');
        const setupPath = resolve(projectRoot, 'setup.ts');

        let code = `export { default as config } from '${configPath.replace(/\\/g, '/')}';\n`;

        if (existsSync(setupPath)) {
          code += `export { default as plugin } from '${setupPath.replace(/\\/g, '/')}';\n`;
        } else {
          code += `export const plugin = undefined;\n`;
        }

        return code;
      }
    },

    configureServer(server) {
      const assetsDir = resolve(projectRoot, 'assets');

      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        // Rewrite /assets/... to project assets dir
        if (req.url.startsWith('/assets/')) {
          const assetPath = resolve(assetsDir, req.url.slice('/assets/'.length));
          if (existsSync(assetPath)) {
            req.url = '/@fs/' + assetPath.replace(/\\/g, '/');
          }
        }

        next();
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
