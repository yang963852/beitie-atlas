/**
 * Release metadata check.
 *
 *   npm run check:version            # package.json, package-lock.json, CHANGELOG
 *   npm run check:tag -- vX.Y.Z      # the same, plus the formal Git tag
 *
 * `check:version` runs in the ordinary quality gate. `check:tag` runs only for
 * an authorised formal release, so a normal development commit never needs a
 * tag. Neither command writes, moves or pushes a tag.
 */

import { checkReleaseMetadata } from './lib/release-meta';
import { checkReleaseTag } from './lib/release-tag';

const root = process.cwd();
const args = process.argv.slice(2);
const tagWithValue = args.find((arg) => arg.startsWith('--tag='));
const tagFlag = args.includes('--tag') || Boolean(tagWithValue);
const tagSeparate = args.includes('--tag') ? args[args.indexOf('--tag') + 1] : undefined;
const tag = tagWithValue ? tagWithValue.slice('--tag='.length) : tagSeparate;

const metadata = checkReleaseMetadata(root);
if (metadata.version) {
  console.log(`[version] package.json edition: ${metadata.version}`);
}
if (!metadata.ok) {
  for (const problem of metadata.problems) console.error(`[version] - ${problem}`);
  console.error('\n[version] FAILED. The edition, lockfile and CHANGELOG do not agree.');
  process.exit(1);
}
console.log('[version] package.json, package-lock.json and CHANGELOG agree.');

if (!tagFlag) process.exit(0);

const report = checkReleaseTag(root, tag);
for (const note of report.notes) console.log(`[version] ${note}`);
if (!report.ok) {
  for (const problem of report.problems) console.error(`[version] - ${problem}`);
  console.error('\n[version] FAILED. The formal tag cannot be verified.');
  process.exit(1);
}
console.log(
  `[version] Tag ${report.tag} is annotated and points to ${report.commit?.slice(0, 12)}.`,
);
