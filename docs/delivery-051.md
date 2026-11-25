# Delivery 051 | Publish the 1.1 edition

Date: 2026-11-25. Task: [051](../tasks/051-1-1-formal-release.md).

## Changed

- `pages.yml` builds with `npm run release`, verifies the `release` marker and the manifest, and keeps the library-ZIP check before upload.
- `release.md` describes the new deployment mode.
- The library colophon and the atlas footer name the edition (`1.1` / `Edition 1.1`) in release builds; the preview-only feedback link no longer carries the only edition label.
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

- Actions run: [45545929372](https://github.com/yang963852/beitie-atlas/actions/runs/45545929372), build and deploy jobs succeeded.
- Deployed revision: `5fd86618b486b443576beb59e4006f8b2c74924f`.
- Manifest: `mode: release`, `releaseMode: true`, generated `2026-11-25T04:19:41Z`, Node `v24.22.3`; counts 117 works / 126 objects / 46 places / 184 sources / 1 media / 75 events / 4 work articles / 8 people / 2 notes / 1 relation.
- Public URL: https://yang963852.github.io/beitie-atlas/
- Live checks on 2026-11-25: `/index.html` returns `build-mode: release` and `lang="zh-Hans"`; `/release-manifest.json` matches the counts above; `/download/beitie-knowledge.zip` returns 200 (about 619 KB).
- Browser check of `#/library`: 117 works, 8 calligraphers, 2 notes, no 草稿/已审核 labels. The edition label was missing in release mode because it was attached to the preview-only feedback link; this revision shows `1.1` in the library colophon and the atlas footer, and a regression test covers it.

## Limitations

- Structural and rights checks only; no independent scholarly re-reading of every entry.
- Mainland reachability, live map tiles and provider attribution are separate checks and are not proven by this deployment.
- The draft Liqi Bei guide remains on `review/k-003-guide` pending practitioner review.
