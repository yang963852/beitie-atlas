/**
 * Command-line data check: `npm run check:data`.
 *
 * Reads the same JSON the application bundles, runs the shared validator, and
 * exits non-zero on any error so a broken record cannot reach a build.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatReport, validateDataset } from '../src/domain/validate';

const root = process.cwd();

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
}

function readRecordDirectory(relativeDir: string): unknown[] {
  const directory = join(root, relativeDir);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => readJson(join(relativeDir, file)));
}

function readCollection(relativePath: string): unknown[] {
  const parsed = readJson(relativePath);
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as { items?: unknown }).items)) {
    throw new Error(`${relativePath} must contain an "items" array.`);
  }
  return (parsed as { items: unknown[] }).items;
}

const dataset = {
  works: readRecordDirectory('data/works'),
  objects: readRecordDirectory('data/objects'),
  places: readCollection('data/places.json'),
  sources: readCollection('data/sources.json'),
  media: readCollection('data/media.json'),
};

const releaseMode = process.env.RELEASE_MODE === '1' || process.env.VITE_RELEASE_MODE === '1';
const report = validateDataset(dataset, { releaseMode });

console.log(`Node ${process.version}`);
console.log(`Release mode: ${releaseMode ? 'yes (drafts are errors)' : 'no (drafts allowed)'}`);
console.log(formatReport(report));

if (dataset.works.length === 0 || dataset.objects.length === 0) {
  console.error('\nData validation FAILED: no works or objects were found in data/.');
  process.exit(1);
}

if (!report.ok) {
  console.error('\nData validation FAILED.');
  process.exit(1);
}

console.log('\nData validation passed.');
