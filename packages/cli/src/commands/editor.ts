import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { vylosEditorApiPlugin } from '../vite/editorApiPlugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function editor(projectRoot: string) {
  console.log(`\n  Vylos editor starting...\n  Project: ${projectRoot}\n`);

  const editorRoot = resolve(__dirname, '..', 'editor');

  const server = await createServer({
    root: editorRoot,
    plugins: [
      vue(),
      vylosEditorApiPlugin(),
    ],
    server: {
      port: 5174,
      open: true,
    },
  });

  await server.listen();
  server.printUrls();
}
