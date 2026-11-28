import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkReleaseMetadata } from '../scripts/lib/release-meta';
import { checkReleaseTag } from '../scripts/lib/release-tag';

const created: string[] = [];

function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'beitie-version-'));
  created.push(root);
  return root;
}

function removeTree(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) removeTree(path);
    else chmodSync(path, 0o666);
  }
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

afterEach(() => {
  while (created.length > 0) {
    const root = created.pop();
    if (root) removeTree(root);
  }
});

function writeProject(root: string, version = '1.4.0'): void {
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'beitie-version-fixture', version }, null, 2) + '\n',
  );
  writeFileSync(
    join(root, 'package-lock.json'),
    JSON.stringify({
      name: 'beitie-version-fixture',
      version,
      lockfileVersion: 3,
      packages: { '': { name: 'beitie-version-fixture', version } },
    }, null, 2) + '\n',
  );
  writeFileSync(
    join(root, 'CHANGELOG.md'),
    `# Changelog\n\n## Unreleased · 未发布\n\n## v${version} · 测试版\n\nFixture edition.\n`,
  );
}

function git(root: string, args: string[]): string {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
      GIT_COMMITTER_NAME: 'Fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
    },
  });
  expect(result.status, result.stderr).toBe(0);
  return typeof result.stdout === 'string' ? result.stdout.trim() : '';
}

function initRepository(root: string): void {
  git(root, ['init', '--quiet']);
  git(root, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'fixture']);
}

describe('release metadata', () => {
  it('accepts a SemVer edition with a matching lockfile and CHANGELOG section', () => {
    const root = tempRoot();
    writeProject(root);

    const report = checkReleaseMetadata(root);

    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.version).toBe('1.4.0');
  });

  it('rejects a version that is not SemVer', () => {
    const root = tempRoot();
    writeProject(root, '1.4');

    const report = checkReleaseMetadata(root);

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('SemVer 2.0.0');
  });

  it('rejects a lockfile that was not updated with package.json', () => {
    const root = tempRoot();
    writeProject(root, '1.4.0');
    writeFileSync(
      join(root, 'package-lock.json'),
      JSON.stringify({ name: 'beitie-version-fixture', version: '1.3.0', packages: { '': { version: '1.3.0' } } }),
    );

    const report = checkReleaseMetadata(root);

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('package-lock.json version is 1.3.0');
  });

  it('requires an Unreleased section and a section for the current edition', () => {
    const root = tempRoot();
    writeProject(root, '1.4.0');
    writeFileSync(join(root, 'CHANGELOG.md'), '# Changelog\n\n## v1.3.0\n\nOld edition.\n');

    const report = checkReleaseMetadata(root);

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('## Unreleased');
    expect(report.problems.join(' ')).toContain('## v1.4.0');
  });
});

describe('release tag', () => {
  it('accepts an annotated tag whose commit carries the same edition and CHANGELOG section', () => {
    const root = tempRoot();
    writeProject(root);
    initRepository(root);
    git(root, ['tag', '-a', 'v1.4.0', '-m', 'v1.4.0 · 1.4 版']);

    const report = checkReleaseTag(root, 'v1.4.0');

    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.tag).toBe('v1.4.0');
    expect(report.commit).toMatch(/^[0-9a-f]{40}$/);
  }, 20_000);

  it('rejects a lightweight tag', () => {
    const root = tempRoot();
    writeProject(root);
    initRepository(root);
    git(root, ['tag', 'v1.4.0']);

    const report = checkReleaseTag(root, 'v1.4.0');

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('not an annotated tag');
  }, 20_000);

  it('rejects a tag whose name does not match the tagged package version', () => {
    const root = tempRoot();
    writeProject(root);
    initRepository(root);
    git(root, ['tag', '-a', 'v1.4.1', '-m', 'wrong edition']);

    const report = checkReleaseTag(root, 'v1.4.1');

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('package.json at the tag says 1.4.0');
  }, 20_000);

  it('rejects a tag that does not exist', () => {
    const root = tempRoot();
    writeProject(root);
    initRepository(root);

    const report = checkReleaseTag(root, 'v9.9.9');

    expect(report.ok).toBe(false);
    expect(report.problems.join(' ')).toContain('does not exist locally');
  }, 20_000);
});
