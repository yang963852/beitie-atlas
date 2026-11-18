# Build and release runbook

Task 002 introduced a strict release gate. This page records the formal release command and the evidence it leaves behind. The [atlas workflow](atlas-workflow.md) covers the separately authorized draft preview.

## Two builds, two purposes

| Command | Purpose | Drafts allowed | Artifact |
| --- | --- | --- | --- |
| `npm run build` | Local preview or owner-authorized hosted preview | Yes, clearly labelled | `dist/` marked `preview` in `index.html` |
| `npm run release` | Public interactive atlas | No, a draft or invalid record fails the build | `dist/` marked `release`, with `dist/release-manifest.json` |
| `npm run check:release` | Review the gate without building | No | Nothing written; exit code only |

`npm run check` (CI) runs type check, the preview data check, tests, and a preview build. It
does **not** approve publication and does not deploy.

## What `npm run release` does, in order

1. Deletes the previous `dist/`. A stale preview or older release cannot be reused.
2. Runs strict data validation (`releaseMode: true`). Every work/object must be `reviewed`;
   broken references, missing evidence, and invalid coordinates are errors.
3. Runs the TypeScript check.
4. Builds with `VITE_RELEASE_MODE=1`. Vite independently runs the strict data gate before it writes
   `<meta name="beitie-build-mode" content="release">`.
5. Writes `dist/release-manifest.json` with the validated counts, Node version, UTC time, and
   the Git revision when available.
6. Verifies the artifact: release marker present, preview marker absent, manifest mode and
   object count matching the validated corpus, and a JavaScript bundle in `dist/assets/`.

Any failure prints the reason, deletes `dist/`, and exits non-zero. A failed release therefore
leaves nothing that could be uploaded by mistake.

## Commands and expected outcomes

```bash
npm run check:release   # exits 1 while the corpus contains drafts
npm run release         # exits 1 at step 2; dist/ is removed
npm run build           # succeeds; preview artifact only
npm run preview         # serves the preview build locally
```

The founding second edition passed the strict gate and was deployed in [delivery 021](delivery-021.md).
Future changes that introduce drafts will still block formal publication.

The rejection is the correct behaviour while the records are drafts. Do not mark records
`reviewed` to get a green build; editorial review is a separate gate.

## Positive-path evidence

The release script's mechanics are covered by `tests/release-gate.test.ts` with a controlled
fixture: a reviewed corpus passes, a draft fails, an invalid reference fails, a preview-marked
artifact fails, and a mismatched manifest fails.

During task 002 the full command was also executed end-to-end in an isolated temporary copy of
the project where the three records were marked reviewed **only in that copy**. That run
produced `content="release"` and a matching manifest with exit code 0. The real corpus was not
modified. See `docs/delivery-002.md`.

## Verifying a candidate artifact manually

```bash
grep -o '<meta name="beitie-build-mode"[^>]*>' dist/index.html
cat dist/release-manifest.json
```

`content="release"` and a manifest whose `counts` match the reviewed corpus are the minimum
evidence. A missing manifest, a `preview` marker, or a count mismatch means the directory is
not a release artifact.

## CI and deployment

`.github/workflows/check.yml` runs preview checks only. It has no deployment step and no
secrets. Formal publication of the interactive atlas requires a release artifact produced by `npm run release` and a separate
host/mainland-network decision recorded in `docs/iteration-board.md`.

## Rolling back

Roll back by choosing a previously accepted Git revision and rebuilding it with
`npm run release`; do not hand-edit `dist/` and do not delete unexplained work. Because the
release command removes the output before building, a half-finished deployment directory is
never a rollback source.
