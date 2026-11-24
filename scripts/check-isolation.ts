/**
 * Enforce the one-way boundary between author sources and the web.
 *
 *   npm run check:isolation
 *
 * The browser may import the compiled interface. It may not import an author
 * Markdown file, a legacy JSON corpus file, or the special journey JSON. The
 * compiler may use pure domain rules, but not UI, i18n or map code.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readCompiledKnowledge } from './lib/knowledge-compiler';

const root = process.cwd();
const problems: string[] = [];

function walk(dir: string, extension: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path, extension));
    else if (extension.test(name)) out.push(path);
  }
  return out;
}

const forbiddenInWeb = [
  /knowledge\//,
  /data\/(?:works|objects|places|sources|media|knowledge-relations|yan-qinli-journey)/,
];
const forbiddenInCompiler = [
  /src\/(?:components|i18n|App|styles|map)(?:[/.]|$)/,
  /virtual:beitie-knowledge/,
];

for (const file of walk(join(root, 'src'), /\.(?:ts|tsx|css)$/)) {
  const text = readFileSync(file, 'utf8');
  const specifiers = [...text.matchAll(/(?:from\s+|import\s*(?:\(|(?=['"]))|import\.meta\.glob\s*\(\s*\[?)\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  for (const specifier of specifiers) {
    for (const pattern of forbiddenInWeb) {
      if (pattern.test(specifier)) {
        problems.push(relative(root, file) + ': the web imports ' + specifier + '; consume data/index/knowledge-v1.json instead.');
      }
    }
  }
}

const compilerFiles = [
  'scripts/lib/knowledge-schema.ts',
  'scripts/lib/knowledge-compiler.ts',
  'scripts/lib/knowledge-plugin.ts',
  'scripts/lib/catalogue.ts',
  'scripts/migrate-legacy.ts',
  'scripts/knowledge-compile.ts',
  'scripts/knowledge-catalogue.ts',
  'scripts/knowledge-parity.ts',
  'scripts/knowledge-package.ts',
  'scripts/check-reproducible.ts',
];
for (const file of compilerFiles) {
  let text = '';
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  for (const pattern of forbiddenInCompiler) {
    const specifiers = [...text.matchAll(/(?:from\s+|import\s*(?:\(|(?=['"]))|import\.meta\.glob\s*\(\s*\[?)\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
    if (specifiers.some((specifier) => pattern.test(specifier))) {
      problems.push(file + ': the compiler must not import UI code: ' + pattern);
    }
  }
}

try {
  const compiled = readCompiledKnowledge(root);
  if (compiled.formatVersion !== 'beitie-knowledge/1') problems.push('The compiled interface has an unexpected formatVersion.');
  if (compiled.schemaVersion !== 1) problems.push('The compiled interface has an unexpected schemaVersion.');
} catch (error) {
  problems.push('The compiled interface cannot be read: ' + (error as Error).message);
}

if (problems.length) {
  console.error('Isolation check FAILED (' + problems.length + ' problem(s)):');
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}
console.log('Isolation check passed: the web reads the compiled interface; the compiler avoids UI code.');
