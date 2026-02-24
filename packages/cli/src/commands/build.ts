import { build as viteBuild } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { vylosProjectPlugin } from '../vite/projectPlugin';
import { vylosI18nPlugin } from '../vite/i18nPlugin';

export async function build(projectRoot: string, base?: string) {
  console.log(`\n  Vylos building...\n  Project: ${projectRoot}\n`);

  const outDir = resolve(projectRoot, 'dist');

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
      alias: {
        '@project': projectRoot,
      },
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
