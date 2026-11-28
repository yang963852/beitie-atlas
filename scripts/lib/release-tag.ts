/**
 * Verifies a formal release tag against its own commit.
 *
 * A tag is a release record, so it must be an annotated `vX.Y.Z` tag whose
 * commit carries that same package version and a matching CHANGELOG section.
 * The tag must also be on `main` (or `origin/main`). The working tree may have
 * moved on; the check reads package.json and CHANGELOG.md from the tag itself.
 */

import { spawnSync } from 'node:child_process';
import { changelogSectionPattern, isSemver } from './release-meta';

export interface ReleaseTagReport {
  ok: boolean;
  tag: string | null;
  commit: string | null;
  problems: string[];
  notes: string[];
}

interface GitResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function git(root: string, args: string[]): GitResult {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.error) {
    return { ok: false, stdout: '', stderr: result.error.message };
  }
  return {
    ok: result.status === 0,
    stdout: typeof result.stdout === 'string' ? result.stdout.trim() : '',
    stderr: typeof result.stderr === 'string' ? result.stderr.trim() : '',
  };
}

function mainRef(root: string): string | null {
  for (const ref of ['refs/remotes/origin/main', 'refs/heads/main']) {
    if (git(root, ['rev-parse', '--verify', '--quiet', ref]).ok) return ref;
  }
  return null;
}

/**
 * Checks `tagName`, or the exact tag on HEAD when no name is given.
 * It never creates, moves or pushes a tag.
 */
export function checkReleaseTag(root: string, tagName?: string): ReleaseTagReport {
  const problems: string[] = [];
  const notes: string[] = [];
  let tag: string | null = tagName?.trim() || null;

  if (!tag) {
    const described = git(root, ['describe', '--tags', '--exact-match', 'HEAD']);
    if (described.ok && described.stdout) {
      tag = described.stdout;
    } else {
      problems.push(
        'HEAD is not tagged. Name the formal tag: npm run check:tag -- vX.Y.Z',
      );
    }
  }

  if (!tag) return { ok: false, tag: null, commit: null, problems, notes };

  const tagVersion = tag.startsWith('v') ? tag.slice(1) : tag;
  if (!tag.startsWith('v') || !isSemver(tagVersion)) {
    problems.push(
      `Tag "${tag}" is not a vMAJOR.MINOR.PATCH release tag.`,
    );
  }

  if (!git(root, ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`]).ok) {
    problems.push(`Tag "${tag}" does not exist locally.`);
    return { ok: false, tag, commit: null, problems, notes };
  }

  const objectType = git(root, ['cat-file', '-t', `refs/tags/${tag}`]);
  if (!objectType.ok || objectType.stdout !== 'tag') {
    problems.push(
      `Tag "${tag}" is not an annotated tag. Use git tag -a so the release record carries an author and date.`,
    );
  }

  const commitResult = git(root, ['rev-list', '-n', '1', `refs/tags/${tag}`]);
  const commit = commitResult.ok && commitResult.stdout ? commitResult.stdout : null;
  if (!commit) problems.push(`Tag "${tag}" does not resolve to a commit.`);

  const packageAtTag = git(root, ['show', `${tag}:package.json`]);
  if (!packageAtTag.ok) {
    problems.push(`Tag "${tag}" does not contain package.json.`);
  } else {
    try {
      const manifest = JSON.parse(packageAtTag.stdout) as { version?: unknown };
      const taggedVersion = typeof manifest.version === 'string' ? manifest.version : null;
      if (!taggedVersion) {
        problems.push(`package.json at tag "${tag}" has no string version.`);
      } else if (taggedVersion !== tagVersion) {
        problems.push(
          `Tag "${tag}" names version ${tagVersion}, but package.json at the tag says ${taggedVersion}.`,
        );
      }
    } catch (error) {
      problems.push(
        `package.json at tag "${tag}" is not valid JSON: ${(error as Error).message}`,
      );
    }
  }

  const changelogAtTag = git(root, ['show', `${tag}:CHANGELOG.md`]);
  if (!changelogAtTag.ok) {
    problems.push(`Tag "${tag}" does not contain CHANGELOG.md.`);
  } else if (!changelogSectionPattern(tagVersion).test(changelogAtTag.stdout)) {
    problems.push(`CHANGELOG.md at tag "${tag}" has no "## v${tagVersion}" section.`);
  }

  if (commit) {
    const main = mainRef(root);
    if (!main) {
      notes.push('No local main or origin/main ref was found; tag ancestry was not checked.');
    } else if (!git(root, ['merge-base', '--is-ancestor', commit, main]).ok) {
      problems.push(`Tag "${tag}" is not an ancestor of ${main.replace('refs/remotes/', '').replace('refs/heads/', '')}.`);
    }
  }

  const subject = git(root, ['for-each-ref', '--format=%(contents:subject)', `refs/tags/${tag}`]);
  if (subject.ok && subject.stdout) notes.push(`Tag message: ${subject.stdout}`);

  return { ok: problems.length === 0, tag, commit, problems, notes };
}
