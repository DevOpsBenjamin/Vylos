#!/usr/bin/env node
import { resolve } from 'path';

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
}

async function main() {
  switch (command) {
    case 'dev': {
      const noOpen = args.includes('--no-open');
      const projectRoot = resolve(args.find((a, i) => i > 0 && !a.startsWith('--')) ?? process.cwd());
      const { dev } = await import('./commands/dev');
      await dev(projectRoot, { open: !noOpen });
      break;
    }

    case 'build': {
      const base = parseFlag('--base') ?? process.env.VYLOS_BASE;
      const projectArg = args.find((a, i) => i > 0 && a !== '--' && !a.startsWith('--') && args[i - 1] !== '--base');
      const projectRoot = resolve(projectArg ?? process.cwd());
      const { build } = await import('./commands/build');
      await build(projectRoot, base);
      break;
    }

    case 'editor': {
      const projectRoot = resolve(args[1] ?? process.cwd());
      const { editor } = await import('./commands/editor');
      await editor(projectRoot);
      break;
    }

    case 'verify': {
      const projectRoot = resolve(args[1] ?? process.cwd());
      const { verify } = await import('./commands/verify');
      await verify(projectRoot);
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
    vylos dev [project-dir] [--no-open]  Start dev server
    vylos build [project-dir]            Build for production
    vylos build [project-dir] --base /p/ Build with custom base path
    vylos editor [project-dir]           Open visual editor
    vylos verify [project-dir]           Type-check project
    vylos create <name>                  Create new project
`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
