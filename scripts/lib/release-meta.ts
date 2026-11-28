/**
 * Release metadata checks for a formal edition.
 *
 * The product edition has one author source: the `version` in package.json.
 * The lockfile and CHANGELOG are checked against it here. The compiled
 * knowledge interface keeps its own `beitie-knowledge/1` format version, which
 * is deliberately not tied to the product edition.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** SemVer 2.0.0, without a leading `v`. */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export interface ReleaseMetadataReport {
  ok: boolean;
  version: string | null;
  problems: string[];
}

export function isSemver(value: string): boolean {
  return SEMVER_PATTERN.test(value);
}

export function readPackageVersion(root: string): string {
  const raw = readFileSync(join(root, 'package.json'), 'utf8');
  const manifest = JSON.parse(raw) as { version?: unknown };
  if (typeof manifest.version !== 'string' || manifest.version.trim() === '') {
    throw new Error('package.json must contain a non-empty string "version".');
  }
  return manifest.version;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The CHANGELOG heading for an edition, for example `## v1.4.0 · 1.4 版`. */
export function changelogSectionPattern(version: string): RegExp {
  return new RegExp(`^## v${escapeRegExp(version)}(?:\\s|$)`, 'm');
}

/**
 * Checks the working tree metadata that must agree before a release:
 * SemVer format, package-lock versions, an Unreleased section and a CHANGELOG
 * section for the current package edition. It does not require a Git tag: a
 * normal development branch carries the last released version until the
 * maintainer authorises a new one.
 */
export function checkReleaseMetadata(root: string): ReleaseMetadataReport {
  const problems: string[] = [];
  let version: string | null = null;

  try {
    version = readPackageVersion(root);
    if (!isSemver(version)) {
      problems.push(
        `package.json version "${version}" is not valid SemVer 2.0.0 (expected MAJOR.MINOR.PATCH, without a leading v).`,
      );
    }
  } catch (error) {
    problems.push(`package.json cannot be read: ${(error as Error).message}`);
  }

  if (version) {
    try {
      const lock = JSON.parse(
        readFileSync(join(root, 'package-lock.json'), 'utf8'),
      ) as { version?: unknown; packages?: Record<string, { version?: unknown }> };
      const lockVersion = typeof lock.version === 'string' ? lock.version : null;
      const lockRootVersion =
        lock.packages && typeof lock.packages['']?.version === 'string'
          ? lock.packages[''].version
          : null;

      if (lockVersion !== version) {
        problems.push(
          `package-lock.json version is ${lockVersion ?? 'missing'}, but package.json is ${version}.`,
        );
      }
      if (lockRootVersion !== version) {
        problems.push(
          `package-lock.json packages[""] version is ${lockRootVersion ?? 'missing'}, but package.json is ${version}.`,
        );
      }
    } catch (error) {
      problems.push(`package-lock.json cannot be read: ${(error as Error).message}`);
    }

    try {
      const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
      if (!/^## Unreleased\b/m.test(changelog)) {
        problems.push('CHANGELOG.md has no "## Unreleased" section.');
      }
      if (!changelogSectionPattern(version).test(changelog)) {
        problems.push(
          `CHANGELOG.md has no "## v${version}" section for the package version.`,
        );
      }
    } catch (error) {
      problems.push(`CHANGELOG.md cannot be read: ${(error as Error).message}`);
    }
  }

  return { ok: problems.length === 0, version, problems };
}
