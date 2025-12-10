import { Command } from 'commander';
import { createServer } from 'vite';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import { vylosShadowingPlugin } from '../src/node/shadow-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Injected by Vite define
const version = process.env.VYLOS_VERSION || '0.0.0';

const program = new Command();

program
    .name('vylos')
    .description('Vylos VN Framework CLI')
    .version(version);

program
    .command('dev')
    .description('Start the development server')
    .action(async () => {
        console.log('Starting Vylos Dev Server...');

        const userRoot = process.cwd();
        // Assuming this is running from dist/bin/vylos.js
        // frameworkRoot should be ../..
        const frameworkRoot = resolve(__dirname, '../..');

        try {
            const server = await createServer({
                root: userRoot,
                plugins: [
                    vylosShadowingPlugin(userRoot, frameworkRoot),
                    vue()
                ],
                server: {
                    port: 3000
                }
            });

            await server.listen();
            server.printUrls();
        } catch (e) {
            console.error('Failed to start server:', e);
            process.exit(1);
        }
    });

program.parse();
