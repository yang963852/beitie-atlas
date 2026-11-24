/**
 * The only permitted production publishing command: `npm run release`.
 *
 * Order matters. The previous output is deleted first, the strict data gate runs
 * before any bundle exists, and the emitted artifact is verified afterwards. A
 * failure at any step leaves no `dist/` that could be uploaded by mistake.
 *
 * `npm run check:release` runs the same gate without touching `dist/`; it is for
 * review evidence, never for publishing.
 *
 * Cross-platform by design: it spawns Node directly on local package files
 * instead of relying on shell environment-variable syntax or `.cmd` shims.
 */

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { formatReport } from '../src/domain/validate';
import { writeCompiledKnowledge } from './lib/knowledge-compiler';
import {
  clearOutput,
  runReleaseGate,
  verifyReleaseArtifact,
  writeReleaseManifest,
} from './lib/release-gate';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');

function runNodeScript(
  label: string,
  relativeScript: string,
  args: string[],
  extraEnv: Record<string, string> = {},
): number {
  console.log(`\n[release] ${label}`);
  const result = spawnSync(process.execPath, [join(root, relativeScript), ...args], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  if (result.error) {
    console.error(`[release] Could not start ${relativeScript}: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

function readSourceRevision(): string | null {
  try {
    const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
    if (result.status === 0 && typeof result.stdout === 'string' && result.stdout.trim()) {
      return result.stdout.trim();
    }
  } catch {
    /* A source archive without Git is still buildable; the revision stays unrecorded. */
  }
  return null;
}

function abort(reason: string): never {
  clearOutput(root);
  console.error(`\n[release] FAILED — ${reason}`);
  console.error('[release] dist/ was removed, so there is no artifact to publish by mistake.');
  process.exit(1);
}

console.log(`[release] Node ${process.version}`);
console.log('[release] Strict mode: draft records and invalid data are build errors.');

if (checkOnly) {
  const report = runReleaseGate(root);
  console.log(formatReport(report));
  if (!report.ok) {
    console.error('\n[release] Gate FAILED. This corpus is not releasable.');
    process.exit(1);
  }
  console.log('\n[release] Gate passed.');
  process.exit(0);
}

const removed = clearOutput(root);
console.log(
  removed
    ? '[release] Removed the previous dist/ before validating. Nothing stale can be published.'
    : '[release] No previous dist/ was present.',
);

const report = runReleaseGate(root);
console.log('\n[release] Strict data gate');
console.log(formatReport(report));
if (!report.ok) abort('the corpus contains draft or invalid records.');

writeCompiledKnowledge(root);

if (runNodeScript('Type check', 'node_modules/typescript/bin/tsc', ['--noEmit']) !== 0) {
  abort('the type check failed.');
}

if (runNodeScript('Knowledge download package', 'node_modules/tsx/dist/cli.mjs', ['scripts/knowledge-package.ts']) !== 0) {
  abort('the knowledge download package could not be built.');
}

if (
  runNodeScript('Production build', 'node_modules/vite/bin/vite.js', ['build'], {
    VITE_RELEASE_MODE: '1',
  }) !== 0
) {
  abort('the production build failed.');
}

try {
  writeReleaseManifest(root, report, readSourceRevision());
} catch (error) {
  abort(`the release manifest could not be written: ${(error as Error).message}`);
}

const artifact = verifyReleaseArtifact(root, report.counts);
if (!artifact.ok) {
  for (const problem of artifact.problems) console.error(`[release]   - ${problem}`);
  abort('the emitted artifact failed verification.');
}

console.log('\n[release] OK. This dist/ is the publishable artifact.');
console.log(
  `[release] ${report.counts.works} work(s), ${report.counts.objects} object(s), ` +
    `${report.counts.places} place(s), ${report.counts.sources} source(s), ` +
    `${report.counts.events} event(s).`,
);
console.log('[release] Manifest: dist/release-manifest.json');
