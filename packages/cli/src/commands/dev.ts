import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { vylosProjectPlugin } from '../vite/projectPlugin';
import { vylosI18nPlugin } from '../vite/i18nPlugin';
import { vylosEditorApiPlugin } from '../vite/editorApiPlugin';
import { resolveGameAlias } from '../utils/resolveGameAlias';

export interface DevOptions {
  open?: boolean;
}

export async function dev(projectRoot: string, options?: DevOptions) {
  console.log(`\n  Vylos dev server starting...\n  Project: ${projectRoot}\n`);

  const alias: Record<string, string> = { '@project': projectRoot };
  const gamePlugin = resolveGameAlias(projectRoot);
  if (gamePlugin) alias['@game'] = gamePlugin;

  const server = await createServer({
    root: projectRoot,
    plugins: [
      vue(),
      tailwindcss(),
      vylosProjectPlugin(projectRoot),
      vylosI18nPlugin(projectRoot),
      vylosEditorApiPlugin(),
    ],
    resolve: {
      alias,
      dedupe: ['vue', 'pinia', '@vylos/core'],
    },
    optimizeDeps: {
      include: ['vue', 'pinia'],
    },
    server: {
      port: 5173,
      open: options?.open ?? true,
    },
  });

  await server.listen();
  server.printUrls();
}
