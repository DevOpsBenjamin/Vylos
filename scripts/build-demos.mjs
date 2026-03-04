/**
 * Build all demo projects with correct base paths for GitHub Pages.
 * Uses VYLOS_BASE env var to avoid MSYS path conversion on Windows Git Bash.
 */
import { execSync } from 'child_process';

const projects = ['1-basic', '2-advanced', '3-phone'];

for (const name of projects) {
  const base = `/vylos/${name}/`;
  console.log(`\nBuilding ${name} with base ${base}...\n`);

  execSync(`pnpm --filter ${name} exec vylos build`, {
    stdio: 'inherit',
    env: { ...process.env, VYLOS_BASE: base },
  });
}
