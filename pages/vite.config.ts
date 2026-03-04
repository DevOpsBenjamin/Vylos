import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

/** Serve built project dists under /vylos/<project>/ during dev */
function serveProjectDists(): Plugin {
  const projects = ['1-basic', '2-advanced', '3-phone'];
  const projectsDir = resolve(__dirname, '../projects');

  return {
    name: 'serve-project-dists',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        for (const name of projects) {
          const prefix = `/vylos/${name}/`;
          if (req.url.startsWith(prefix)) {
            const filePath = req.url.slice(prefix.length) || 'index.html';
            const fullPath = resolve(projectsDir, name, 'dist', filePath);

            if (existsSync(fullPath)) {
              const ext = fullPath.split('.').pop();
              const mimeTypes: Record<string, string> = {
                html: 'text/html',
                js: 'application/javascript',
                css: 'text/css',
                png: 'image/png',
                jpg: 'image/jpeg',
                svg: 'image/svg+xml',
                json: 'application/json',
              };
              res.setHeader('Content-Type', mimeTypes[ext ?? ''] ?? 'application/octet-stream');
              res.end(readFileSync(fullPath));
              return;
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: '/vylos/',
  plugins: [vue(), tailwindcss(), viteSingleFile(), serveProjectDists()],
});
