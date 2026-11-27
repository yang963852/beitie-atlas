/**
 * Migrate the author Markdown corpus from author-schema v1 to v2.
 *
 *   npm run knowledge:migrate                rewrite knowledge/**\/*.md in place
 *   npm run knowledge:migrate -- --dry-run   list the files that would change
 *   npm run knowledge:migrate -- --check     exit 1 while any file still needs it
 *
 * The transform is idempotent: a second run reports nothing to do.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { migrateSource } from './lib/knowledge-migrate';

const dryRun = process.argv.includes('--dry-run');
const check = process.argv.includes('--check');
const root = process.cwd();
const start = join(root, 'knowledge');

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) found.push(full);
  }
  return found;
}

const files = walk(start).sort();
let pending = 0;
let failed = 0;

for (const file of files) {
  const path = relative(root, file).split(sep).join('/');
  const result = migrateSource(readFileSync(file, 'utf8'), path);
  if (result.errors.length > 0) {
    failed += 1;
    for (const message of result.errors) console.error('error: ' + message);
    continue;
  }
  if (!result.changed) continue;
  pending += 1;
  if (dryRun || check) {
    console.log('would migrate: ' + path);
    continue;
  }
  writeFileSync(file, result.text, 'utf8');
  console.log('migrated: ' + path);
}

const verb = dryRun || check ? 'pending' : 'migrated';
console.log('');
console.log(files.length + ' file(s) scanned, ' + pending + ' ' + verb + ', ' + failed + ' failed.');
if (failed > 0) process.exit(2);
if (check && pending > 0) process.exit(1);
