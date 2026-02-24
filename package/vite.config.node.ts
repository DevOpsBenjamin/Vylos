import { defineConfig } from 'vite';
import { resolve } from 'path';
import { version } from './package.json';

export default defineConfig({
    define: {
        'process.env.VYLOS_VERSION': JSON.stringify(version)
    },
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
            entry: {
                'bin/vylos': resolve(__dirname, 'bin/vylos.ts')
            },
            formats: ['es']
        },
        rollupOptions: {
            external: [
                'vite',
                'commander',
                'chalk',
                'fs-extra',
                'path',
                'url',
                'fs',
                '@vitejs/plugin-vue',
                '../../package.json'
            ]
        },
        target: 'node18'
    }
});
