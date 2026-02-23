#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const tsxLoader = pathToFileURL(require.resolve('tsx')).href;
const cli = resolve(__dirname, '..', 'src', 'index.ts');

const child = spawn(process.execPath, ['--import', tsxLoader, cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
});
child.on('exit', (code) => process.exit(code ?? 0));
