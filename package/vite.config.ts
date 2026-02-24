import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { version } from './package.json';

export default defineConfig({
    define: {
        'process.env.VYLOS_VERSION': JSON.stringify(version)
    },
    plugins: [
        vue(),
        dts({
            rollupTypes: true,
            exclude: ['bin/**', 'src/node/**']
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Vylos',
            fileName: (format) => `vylos.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'pinia', 'vue-router', 'vue-i18n'],
            output: {
                globals: {
                    vue: 'Vue',
                    pinia: 'Pinia',
                    'vue-router': 'VueRouter',
                    'vue-i18n': 'VueI18n'
                }
            }
        }
    }
});
