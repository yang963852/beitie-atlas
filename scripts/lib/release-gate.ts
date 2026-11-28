/**
 * Release-gate mechanics, kept free of process exits so they can be tested.
 *
 * The rule: a publishable artifact exists only if the strict data validation
 * passed first, the build wrote a release-mode marker, and the manifest matches
 * the records that were validated. Anything else must leave no `dist/`.
 */

import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ValidationReport } from '../../src/domain/validate';
import { compileKnowledge } from './knowledge-compiler';
import { readPackageVersion } from './release-meta';

export const OUTPUT_DIR = 'dist';
export const MANIFEST_FILE = 'release-manifest.json';
export const BUILD_MODE_META = 'beitie-build-mode';

export interface ReleaseManifest {
  formatVersion: 1;
  mode: 'release';
  releaseMode: true;
  appVersion: string;
  generatedAt: string;
  node: string;
  sourceRevision: string | null;
  counts: CorpusReport['counts'];
}

type CorpusReport = ValidationReport & { counts: ReturnType<typeof compileKnowledge>['knowledge']['counts'] };

export function checkCorpus(root: string, releaseMode: boolean): CorpusReport {
  const compiled = compileKnowledge(root, { releaseMode });
  const { knowledge } = compiled;
  const report = compiled.validation;
  return {
    ...report,
    ok: report.ok && compiled.issues.length === 0,
    errors: compiled.issues,
    counts: knowledge.counts,
  };
}

export function runReleaseGate(root: string = process.cwd()): CorpusReport {
  return checkCorpus(root, true);
}

/** Removes any previous output. Returns true when something was deleted. */
export function clearOutput(root: string = process.cwd()): boolean {
  const dir = join(root, OUTPUT_DIR);
  if (!existsSync(dir)) return false;
  rmSync(dir, { recursive: true, force: true });
  return true;
}

export function writeReleaseManifest(
  root: string,
  report: CorpusReport,
  sourceRevision: string | null,
): ReleaseManifest {
  const manifest: ReleaseManifest = {
    formatVersion: 1,
    mode: 'release',
    releaseMode: true,
    appVersion: readPackageVersion(root),
    generatedAt: new Date().toISOString(),
    node: process.version,
    sourceRevision,
    counts: report.counts,
  };
  writeFileSync(
    join(root, OUTPUT_DIR, MANIFEST_FILE),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  return manifest;
}

export interface ArtifactCheck {
  ok: boolean;
  problems: string[];
}

/**
 * Confirms that `dist/` is the artifact the gate approved: release marker in
 * the HTML, a manifest whose counts match the validated corpus, and a script
 * bundle to serve.
 */
export function verifyReleaseArtifact(
  root: string,
  expectedCounts: CorpusReport['counts'],
): ArtifactCheck {
  const problems: string[] = [];
  const dist = join(root, OUTPUT_DIR);
  const indexFile = join(dist, 'index.html');

  if (!existsSync(indexFile)) {
    problems.push('dist/index.html is missing.');
  } else {
    const html = readFileSync(indexFile, 'utf8');
    if (!/<meta[^>]+name="beitie-build-mode"[^>]+content="release"/i.test(html)) {
      problems.push('dist/index.html does not carry the release build marker.');
    }
    if (/<meta[^>]+name="beitie-build-mode"[^>]+content="preview"/i.test(html)) {
      problems.push('dist/index.html is marked as a preview build.');
    }
  }

  const manifestFile = join(dist, MANIFEST_FILE);
  if (!existsSync(manifestFile)) {
    problems.push(`dist/${MANIFEST_FILE} is missing.`);
  } else {
    try {
      const manifest = JSON.parse(readFileSync(manifestFile, 'utf8')) as Partial<ReleaseManifest>;
      if (manifest.mode !== 'release' || manifest.releaseMode !== true) {
        problems.push('The release manifest does not describe a release build.');
      }
      let packageVersion: string | null = null;
      try {
        packageVersion = readPackageVersion(root);
      } catch (error) {
        problems.push(`package.json cannot be read for version verification: ${(error as Error).message}`);
      }
      if (packageVersion && manifest.appVersion !== packageVersion) {
        problems.push(
          `The release manifest records edition ${manifest.appVersion ?? 'missing'}, `
          + `but package.json says ${packageVersion}.`,
        );
      }
      const countKeys = Object.keys(expectedCounts) as Array<keyof CorpusReport['counts']>;
      const mismatched = countKeys.filter(
        (key) => !manifest.counts || manifest.counts[key] !== expectedCounts[key],
      );
      if (mismatched.length > 0) {
        problems.push(
          `The release manifest counts do not match the validated records (${mismatched.join(', ')}).`,
        );
      }
    } catch {
      problems.push(`dist/${MANIFEST_FILE} is not valid JSON.`);
    }
  }

  const assetsDir = join(dist, 'assets');
  const hasScript =
    existsSync(assetsDir) && readdirSync(assetsDir).some((file) => file.endsWith('.js'));
  if (!hasScript) problems.push('No JavaScript bundle was emitted into dist/assets.');

  return { ok: problems.length === 0, problems };
}
