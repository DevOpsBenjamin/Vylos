import { resolve, dirname } from 'path';
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

export async function create(name: string, targetDir?: string) {
  const dest = resolve(targetDir ?? process.cwd(), name);

  if (existsSync(dest)) {
    console.error(`  Directory already exists: ${dest}`);
    process.exit(1);
  }

  // Templates are shipped with @vylos/cli
  const cliRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const templateDir = resolve(cliRoot, 'templates');

  if (!existsSync(templateDir)) {
    console.error(`  Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  console.log(`\n  Creating Vylos project: ${name}\n`);

  mkdirSync(dest, { recursive: true });
  cpSync(templateDir, dest, { recursive: true });

  // Replace project name in package.json
  const pkgPath = resolve(dest, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = readFileSync(pkgPath, 'utf-8');
    writeFileSync(pkgPath, pkg.replace('"my-vylos-game"', `"${name}"`));
  }

  console.log(`  Project created at: ${dest}`);
  console.log(`\n  Next steps:`);
  console.log(`    cd ${name}`);
  console.log(`    pnpm install`);
  console.log(`    pnpm dev\n`);
}
