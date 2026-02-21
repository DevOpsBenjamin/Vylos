import { defineConfig, type UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export interface VylosViteOptions {
  projectRoot: string;
  mode: 'development' | 'production';
}

/** Create shared Vite config for Vylos projects */
export function createViteConfig(options: VylosViteOptions): UserConfig {
  const { projectRoot, mode } = options;

  return defineConfig({
    root: projectRoot,
    mode,
    plugins: [
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@project': projectRoot,
        '@vylos': resolve(projectRoot, 'node_modules/@vylos/core/src'),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: resolve(projectRoot, 'dist'),
      emptyOutDir: true,
    },
  });
}
