import { Plugin } from 'vite';
import { resolve, join } from 'path';
import fs from 'fs-extra';

export function vylosShadowingPlugin(userRoot: string, frameworkRoot: string): Plugin {
    return {
        name: 'vylos-shadowing',
        enforce: 'pre',
        async config(config) {
            // Define the standard aliases
            // We use '#' prefix to denote overridable internal modules

            const aliases = [
                { name: '#components', path: 'components' },
                { name: '#engine', path: 'engine' },
                { name: '#runtime', path: 'runtime' }
            ];

            const aliasConfig: Record<string, string> = {};

            for (const alias of aliases) {
                const userPath = join(userRoot, 'plugins', alias.path);
                const frameworkPath = join(frameworkRoot, 'src', alias.path);

                // We can't synchronously check file existence easily in 'config' hook if we want to be fast,
                // but for aliases we usually need a static path. 
                // Actually, Vite aliases support a custom resolver, but simple object alias is safer.
                // However, we want "File by File" shadowing, not just "Folder" shadowing?
                // If "Folder" shadowing is acceptable (if you override components, you override the folder), it's easy.
                // But the user wants to override ONE file.

                // Strategy: Use a custom resolver in 'resolveId' instead of simple alias.
            }

            return {
                // We don't return aliases here, we handle it in resolveId
            };
        },

        async resolveId(source, importer) {
            if (!source.startsWith('#')) return null;

            const match = source.match(/^#(\w+)\/(.+)$/);
            if (match) {
                const [, category, path] = match; // e.g. 'components', 'MainMenu.vue'

                // 1. Check User Plugin
                const userPath = join(userRoot, 'plugins', category, path);
                if (await fs.pathExists(userPath)) {
                    return userPath;
                }

                // 2. Fallback to Framework
                const frameworkPath = join(frameworkRoot, 'src', category, path);
                if (await fs.pathExists(frameworkPath)) {
                    return frameworkPath;
                }
            }

            return null;
        }
    };
}
