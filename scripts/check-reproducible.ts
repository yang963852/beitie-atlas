/**
 * Reproducibility and read-only check for the knowledge compiler.
 *
 *   npm run check:reproducible
 *
 * Copies `knowledge/` into `.private/tmp/`, marks the copy read-only, compiles
 * it twice in separate Node processes, and hashes the source files before and
 * after. The two outputs must be byte-identical and the source copy unchanged.
 * A separate process catches module-level state, ordering and cache effects
 * that two calls in one process would hide.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const tempBase = join(root, '.private', 'tmp');
mkdirSync(tempBase, { recursive: true });
const work = mkdtempSync(join(tempBase, 'knowledge-repro-'));
const copy = join(work, 'knowledge');
const tsxCli = join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const compilerUrl = pathToFileURL(join(root, 'scripts', 'lib', 'knowledge-compiler.ts')).href;

/** Compiles the copied corpus in its own process and returns the exact bytes. */
function compileInChild(): string {
  const code = 'import { compileKnowledge, compiledText } from ' + JSON.stringify(compilerUrl)
    + '; process.stdout.write(compiledText(compileKnowledge(' + JSON.stringify(work) + ')));';
  const result = spawnSync(process.execPath, [tsxCli, '-e', code], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error('Child compilation exited with ' + result.status + ': ' + (result.stderr || ''));
  }
  return result.stdout;
}

function copyDirectory(from: string, to: string) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const source = join(from, name);
    const target = join(to, name);
    if (statSync(source).isDirectory()) copyDirectory(source, target);
    else writeFileSync(target, readFileSync(source));
  }
}

function files(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...files(path));
    else out.push(path);
  }
  return out.sort();
}

function hash(file: string) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function snapshot(dir: string) {
  return new Map(files(dir).map((file) => [relative(dir, file), hash(file)]));
}

let readOnly = true;
copyDirectory(join(root, 'knowledge'), copy);
try {
  for (const file of files(copy)) chmodSync(file, 0o444);
} catch {
  readOnly = false;
}

const before = snapshot(copy);
let first = '';
let second = '';
try {
  first = compileInChild();
  second = compileInChild();
} catch (error) {
  console.error('Reproducibility check FAILED: ' + (error as Error).message);
  process.exit(1);
}
const after = snapshot(copy);

const problems: string[] = [];
if (first !== second) problems.push('Two compilations of the same source produced different bytes.');
if (before.size !== after.size) problems.push('The source file count changed during compilation.');
for (const [file, digest] of before) {
  if (after.get(file) !== digest) problems.push('Source file changed during compilation: ' + file);
}

try {
  for (const file of files(copy)) chmodSync(file, 0o644);
  rmSync(work, { recursive: true, force: true });
} catch {
  problems.push('The temporary source copy could not be removed: ' + work);
}

if (problems.length) {
  console.error('Reproducibility check FAILED (' + problems.length + ' problem(s)):');
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}
console.log(
  'Reproducibility check passed: ' + before.size + ' source files, identical output twice, '
  + (readOnly ? 'read-only copy' : 'copy could not be marked read-only')
  + '.',
);
