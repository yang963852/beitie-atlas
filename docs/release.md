# Build and release runbook

Task 002 introduced a strict release gate. This page records the formal release command and the evidence it leaves behind. The [atlas workflow](atlas-workflow.md) covers the separately authorized draft preview.

## Two builds, two purposes

| Command | Purpose | Drafts allowed | Artifact |
| --- | --- | --- | --- |
| `npm run build` | Local preview or owner-authorized hosted preview | Yes, clearly labelled | `dist/` marked `preview` in `index.html` |
| `npm run release` | Public interactive atlas | No, a draft or invalid record fails the build | `dist/` marked `release`, with `dist/release-manifest.json` |
| `npm run check:release` | Review the gate without building | No | Nothing written; exit code only |

`npm run check` runs the preview quality checks, including data and knowledge validation, document checks, tests and a preview build. CI gives technical evidence for the source PR. The owner decides merges; under the lightweight workflow, the owner's merge is the editorial approval. No separate sign-off is required.

## Lightweight release

1. Merge the checked change to `main`; the Pages workflow runs `npm run check`, `npm run release` and deploys.
2. Update `CHANGELOG.md` and the `package.json` version.
3. Tag `vX.Y.Z` and push the tag. A GitHub Release is optional.
4. Open the live URL and smoke-test the home page, one work, one object, search and a phone-width layout. Record only what you actually checked.

## What `npm run release` does, in order

1. Deletes the previous `dist/`. A stale preview or older release cannot be reused.
2. Runs strict data validation (`releaseMode: true`), including the public knowledge records. Validate review status, references and evidence across the corpus. Draft material, broken references, missing evidence and invalid coordinates prevent publication.
3. Runs the TypeScript check.
4. Builds with `VITE_RELEASE_MODE=1`. Vite independently runs the strict data gate before it writes
   `<meta name="beitie-build-mode" content="release">`.
5. Writes `dist/release-manifest.json` with the validated counts, Node version, UTC time, and
   the Git revision when available.
6. Verifies the release marker, manifest mode and counts (including library content) against the validated corpus, and checks for a JavaScript bundle in `dist/assets/`.

Any failure prints the reason, deletes `dist/`, and exits non-zero. A failed release therefore
leaves nothing that could be uploaded by mistake.

## Commands and expected outcomes

```bash
npm run check:release   # passes on the current, fully reviewed corpus; fails if a draft or invalid record is introduced
npm run release         # builds and verifies the release artifact; a failed gate removes dist/
npm run build           # succeeds; preview artifact only
npm run preview         # serves the preview build locally
```

The 1.1 edition passed the strict gate and is deployed through the Pages workflow. Its deployment evidence is recorded in delivery 051 in the `archive-milestones-040-051-2026-11-26` tag. Future changes that introduce drafts still block formal publication.

A rejection means a draft or invalid record was introduced. Fix the record; do not mark records
`reviewed` to get a green build. Editorial review is a separate gate.

## Positive-path evidence

The release script's mechanics are covered by `tests/release-gate.test.ts` with a controlled
fixture: a reviewed corpus passes, a draft fails, an invalid reference fails, a preview-marked
artifact fails, and a mismatched manifest fails.

During task 002 the full command was also executed end-to-end in an isolated temporary copy of
the project where the three records were marked reviewed **only in that copy**. That run
produced `content="release"` and a matching manifest with exit code 0. The real corpus was not
modified. See [delivery 002](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/delivery-002.md).

## Verifying a candidate artifact manually

```bash
grep -o '<meta name="beitie-build-mode"[^>]*>' dist/index.html
cat dist/release-manifest.json
```

`content="release"` and a manifest whose `counts` match the reviewed corpus are the minimum
evidence. A missing manifest, a `preview` marker, or a count mismatch means the directory is
not a release artifact.

## CI and deployment

[The Pages workflow](../.github/workflows/pages.yml) publishes a verified release build from checked `main`. Since 2026-11-25 it runs `npm run check`, then `npm run release` with the Pages base path and the browser map key, verifies the `release` marker and `dist/release-manifest.json`, checks the downloadable library ZIP, and uploads `dist/`. A push to `main` therefore cannot publish a draft or an unverified artifact. `npm run build` still produces a preview artifact for local review; it is never uploaded.

The current public edition follows the `version` field in `package.json`; the interface footer and the library colophon render it as the edition label, so no second copy is typed into the docs. For a release, a short note with the deployed revision and the smoke-test result is enough; the full host matrix is optional unless the owner asks for it.

## Rolling back

To roll back, revert the offending change through a PR so Pages rebuilds the checked `main` revision through the same release gate. Use Git revisions as rollback sources; never upload a hand-made `dist/`.
