# Task 051 | Publish the 1.1 edition through the release gate

Base revision: `148a106` (`origin/main`, 2026-11-25). Owner approval for a formal 1.1 publication was given in the coordinator session on 2026-11-25.

## Outcome

GitHub Pages serves the 1.1 edition as a verified release build, not a labelled preview. The workflow itself runs the strict gate, so a draft, a broken reference or a rights-less record can no longer reach the public site unnoticed.

## Scope

- `.github/workflows/pages.yml`: rename the workflow to a release; build with `npm run release`; verify the `release` marker and `dist/release-manifest.json` before upload; keep the download-package check.
- `docs/release.md`: record that the Pages workflow now publishes release builds and how a preview is still produced locally.
- `tasks/051-1-1-formal-release.md`, `docs/delivery-051.md`, one board row.
- Show the edition label in release builds: the library colophon and atlas footer name `1.1`, and a regression test fails if the label disappears.
- Do not change knowledge records, the schema, the compiler or reader components beyond that label.

## Evidence

- `npm.cmd run check:release` at `148a106`: gate passed; 117 works / 126 objects / 46 places / 184 sources / 75 events; 4 guides; 0 drafts; 44 `DATE_WITHOUT_ORIGINAL` advisory warnings.
- The release script already deletes `dist/`, runs the strict gate, rebuilds the compiled interface, type-checks, packages the library, builds with `VITE_RELEASE_MODE=1`, writes the manifest and verifies the artifact before exit.
- The Pages workflow pins every action by commit SHA and keeps `contents: read`; only the deploy job receives `pages: write` and `id-token: write`.

## Acceptance

- The workflow run on the merged revision succeeds and its build log shows `[release] OK` and the release manifest counts.
- The uploaded `dist/index.html` contains `content="release"` and no `content="preview"`.
- `dist/release-manifest.json` has `mode: "release"` and `releaseMode: true`.
- The public URL serves the 1.1 label and the knowledge library; the download ZIP is present.
- Rolling back means reverting this PR so Pages rebuilds the previous revision; no `dist/` is committed.

## Handoff

Self-reviewed; the coordinator approved the release. Deployment evidence (Actions run, revision, live checks) is recorded in [delivery 051](../docs/delivery-051.md).
