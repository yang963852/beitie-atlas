/**
 * Preview data check: `npm run check:data`.
 *
 * Reads the same JSON the application bundles, runs the shared validator, and
 * exits non-zero on any error so a broken record cannot reach a preview build.
 * Drafts are allowed here; `npm run release` is the strict gate.
 */

import { formatReport, validateDataset } from '../src/domain/validate';
import { loadDatasetFromDisk } from './lib/dataset';

const dataset = loadDatasetFromDisk();

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
