#!/usr/bin/env node
import { resolve } from 'path';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'dev': {
      const projectRoot = resolve(args[1] ?? process.cwd());
      const { dev } = await import('./commands/dev');
      await dev(projectRoot);
      break;
    }

    case 'build': {
      const projectRoot = resolve(args[1] ?? process.cwd());
      const { build } = await import('./commands/build');
      await build(projectRoot);
      break;
    }

    case 'editor': {
      const projectRoot = resolve(args[1] ?? process.cwd());
      const { editor } = await import('./commands/editor');
      await editor(projectRoot);
      break;
    }

    case 'create': {
      const name = args[1];
      if (!name) {
        console.error('  Usage: vylos create <project-name>');
        process.exit(1);
      }
      const { create } = await import('./commands/create');
      await create(name, args[2]);
      break;
    }

    default:
      console.log(`
  Vylos — Visual Novel Engine

  Usage:
    vylos dev [project-dir]     Start dev server
    vylos build [project-dir]   Build for production
    vylos editor [project-dir]  Open visual editor
    vylos create <name>         Create new project
`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
