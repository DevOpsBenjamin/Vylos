import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { vylosProjectPlugin } from '../vite/projectPlugin';
import { vylosI18nPlugin } from '../vite/i18nPlugin';
import { vylosEditorApiPlugin } from '../vite/editorApiPlugin';

export async function dev(projectRoot: string) {
  console.log(`\n  Vylos dev server starting...\n  Project: ${projectRoot}\n`);

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
      alias: {
        '@project': projectRoot,
      },
      dedupe: ['vue', 'pinia'],
    },
    optimizeDeps: {
      include: ['vue', 'pinia', 'reflect-metadata'],
    },
    server: {
      port: 5173,
      open: true,
    },
  });

  await server.listen();
  server.printUrls();
}
