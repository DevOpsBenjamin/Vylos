import type { Plugin } from 'vite';
import { resolve, relative, dirname, basename } from 'path';
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';

const VIRTUAL_PREFIX = 'vylos:texts/';
const RESOLVED_PREFIX = '\0vylos:texts/';

/**
 * Vite plugin that merges per-language text files into virtual modules.
 *
 * Given: locations/cafe/texts/talk_barista/en.ts + fr.ts
 * Produces virtual module: vylos:texts/cafe/talk_barista
 * Which exports: { greeting: { en: "Hello!", fr: "Salut!" }, ... }
 *
 * Also generates .d.ts files for IntelliSense.
 */
export function vylosI18nPlugin(projectRoot: string): Plugin {
  const textModules = new Map<string, string[]>(); // moduleId → list of lang file paths

  function scanTextDirs() {
    textModules.clear();
    const dirs = [
      { base: resolve(projectRoot, 'locations'), prefix: '' },
      { base: resolve(projectRoot, 'global', 'texts'), prefix: 'global/' },
    ];

    for (const { base, prefix } of dirs) {
      if (!existsSync(base)) continue;

      if (prefix === 'global/') {
        // global/texts/<scope>/<lang>.ts
        for (const scope of safeDirRead(base)) {
          const scopeDir = resolve(base, scope);
          const langs = safeDirRead(scopeDir).filter(f => f.endsWith('.ts'));
          if (langs.length > 0) {
            textModules.set(`global/${scope}`, langs.map(l => resolve(scopeDir, l)));
          }
        }
      } else {
        // locations/<loc>/texts/<scope>/<lang>.ts
        for (const loc of safeDirRead(base)) {
          const textsDir = resolve(base, loc, 'texts');
          if (!existsSync(textsDir)) continue;
          for (const scope of safeDirRead(textsDir)) {
            const scopeDir = resolve(textsDir, scope);
            const langs = safeDirRead(scopeDir).filter(f => f.endsWith('.ts'));
            if (langs.length > 0) {
              textModules.set(`${loc}/${scope}`, langs.map(l => resolve(scopeDir, l)));
            }
          }
        }
      }
    }
  }

  return {
    name: 'vylos-i18n',

    buildStart() {
      scanTextDirs();
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return RESOLVED_PREFIX + id.slice(VIRTUAL_PREFIX.length);
      }
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return;

      const moduleId = id.slice(RESOLVED_PREFIX.length);
      const langFiles = textModules.get(moduleId);

      if (!langFiles) {
        return `export default {};`;
      }

      // Generate code that imports all lang files and merges them
      const imports: string[] = [];
      const langs: string[] = [];

      for (const filePath of langFiles) {
        const lang = basename(filePath, '.ts');
        const varName = `_${lang}`;
        imports.push(`import ${varName} from '${filePath.replace(/\\/g, '/')}';`);
        langs.push(lang);
      }

      const mergeCode = `
${imports.join('\n')}

const _texts = {};
const _langs = { ${langs.map(l => `${l}: _${l}`).join(', ')} };

for (const [lang, entries] of Object.entries(_langs)) {
  for (const [key, value] of Object.entries(entries)) {
    if (!_texts[key]) _texts[key] = {};
    _texts[key][lang] = value;
  }
}

export default _texts;
`;
      return mergeCode;
    },

    handleHotUpdate({ file }) {
      // If a text file changed, trigger rescan
      const rel = relative(projectRoot, file).replace(/\\/g, '/');
      if (rel.includes('/texts/') && file.endsWith('.ts')) {
        scanTextDirs();
      }
    },
  };
}

function safeDirRead(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() || d.isFile())
      .map(d => d.name);
  } catch {
    return [];
  }
}
