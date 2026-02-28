import { build as viteBuild } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { vylosProjectPlugin } from '../vite/projectPlugin';
import { vylosI18nPlugin } from '../vite/i18nPlugin';
import { resolveGameAlias } from '../utils/resolveGameAlias';

export async function build(projectRoot: string, base?: string) {
  console.log(`\n  Vylos building...\n  Project: ${projectRoot}\n`);

  const outDir = resolve(projectRoot, 'dist');

  const alias: Record<string, string> = { '@project': projectRoot };
  const gamePlugin = resolveGameAlias(projectRoot);
  if (gamePlugin) alias['@game'] = gamePlugin;

  await viteBuild({
    root: projectRoot,
    base: base ?? '/',
    plugins: [
      vue(),
      tailwindcss(),
      vylosProjectPlugin(projectRoot),
      vylosI18nPlugin(projectRoot),
      viteSingleFile(),
    ],
    resolve: {
      alias,
      dedupe: ['vue', 'pinia', '@vylos/core'],
    },
    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: resolve(projectRoot, 'index.html'),
      },
    },
  });

  console.log(`\n  Build complete: ${outDir}\n`);
}
