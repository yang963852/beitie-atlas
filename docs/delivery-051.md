# Delivery 051 | Publish the 1.1 edition

Date: 2026-11-25. Task: [051](../tasks/051-1-1-formal-release.md).

## Changed

- `pages.yml` builds with `npm run release`, verifies the `release` marker and the manifest, and keeps the library-ZIP check before upload.
- `release.md` describes the new deployment mode.
- Board row 051.

## Source revisions

- Content release: PR #57 merged at `bbc2ecb`.
- Two-track plan, audit and river: PR #58 merged at `148a106`.
- Release workflow: this PR (revision recorded on merge).

## Owner approval

The coordinator approved merging and formally publishing the 1.1 edition on 2026-11-25, after the knowledge workstream's final review. The corpus contains no drafts at the approved revision.

## Commands

| Command | Outcome |
| --- | --- |
| `npm.cmd run check:release` (local, `148a106`) | Gate passed; 117 works / 126 objects / 46 places / 184 sources / 75 events; 4 guides; 0 drafts; 44 advisory date warnings. |
| `npm.cmd run check` (local, `148a106`) | Passed (CI-equivalent checks and build). |

## Deployment evidence

- Actions run: pending.
- Deployed revision: pending.
- Public URL: https://yang963852.github.io/beitie-atlas/
- Live checks: pending.

## Limitations

- Structural and rights checks only; no independent scholarly re-reading of every entry.
- Mainland reachability, live map tiles and provider attribution are separate checks and are not proven by this deployment.
- The draft Liqi Bei guide remains on `review/k-003-guide` pending practitioner review.
