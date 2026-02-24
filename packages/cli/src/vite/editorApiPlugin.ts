import type { Plugin } from 'vite';

/**
 * REST API stubs for a future visual editor.
 * Currently only sets up the middleware — no UI.
 */
export function vylosEditorApiPlugin(): Plugin {
  return {
    name: 'vylos-editor-api',
    apply: 'serve', // dev only

    configureServer(server) {
      // GET /api/state — current engine state (placeholder)
      server.middlewares.use('/api/state', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'editor-api-stub', message: 'Not implemented yet' }));
      });

      // GET /api/files — list project files (placeholder)
      server.middlewares.use('/api/files', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'editor-api-stub', files: [] }));
      });

      // GET /api/assets — list project assets (placeholder)
      server.middlewares.use('/api/assets', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'editor-api-stub', assets: [] }));
      });
    },
  };
}
