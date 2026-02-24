import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

/**
 * Vite plugin that resolves virtual module `vylos:project` to the project's config.
 * Also serves project assets.
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
      // Serve location assets
      const locationsDir = resolve(projectRoot, 'locations');
      const globalDir = resolve(projectRoot, 'global');

      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();

        // Rewrite /locations/... to project locations dir
        if (req.url.startsWith('/locations/')) {
          const assetPath = resolve(locationsDir, req.url.slice('/locations/'.length));
          if (existsSync(assetPath)) {
            req.url = '/@fs/' + assetPath.replace(/\\/g, '/');
          }
        }

        // Rewrite /global/... to project global dir
        if (req.url.startsWith('/global/')) {
          const assetPath = resolve(globalDir, req.url.slice('/global/'.length));
          if (existsSync(assetPath)) {
            req.url = '/@fs/' + assetPath.replace(/\\/g, '/');
          }
        }

        next();
      });
    },
  };
}
