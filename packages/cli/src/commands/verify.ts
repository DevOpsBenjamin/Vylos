import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';

export async function verify(projectRoot: string) {
  console.log(`\n  Vylos verify\n  Project: ${projectRoot}\n`);

  const tsconfig = resolve(projectRoot, 'tsconfig.json');
  if (!existsSync(tsconfig)) {
    console.error(`  Error: No tsconfig.json found at ${projectRoot}`);
    process.exit(1);
  }

  try {
    execSync('vue-tsc --noEmit', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    console.log('\n  Verification passed — no type errors found.\n');
  } catch {
    console.error('\n  Verification failed — type errors found above.\n');
    process.exit(1);
  }
}
