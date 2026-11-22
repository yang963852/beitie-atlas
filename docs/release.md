# Build and release runbook

Task 002 introduced a strict release gate. This page records the formal release command and the evidence it leaves behind. The [atlas workflow](atlas-workflow.md) covers the separately authorized draft preview.

## Two builds, two purposes

| Command | Purpose | Drafts allowed | Artifact |
| --- | --- | --- | --- |
| `npm run build` | Local preview or owner-authorized hosted preview | Yes, clearly labelled | `dist/` marked `preview` in `index.html` |
| `npm run release` | Public interactive atlas | No, a draft or invalid record fails the build | `dist/` marked `release`, with `dist/release-manifest.json` |
| `npm run check:release` | Review the gate without building | No | Nothing written; exit code only |

`npm run check` runs the preview quality checks, including data and knowledge validation, document checks, tests and a preview build. CI gives technical evidence for the source PR. The coordinator decides merges. Editorial approval for a formal release applies to an exact corpus revision, including the knowledge library.

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

[The Pages workflow](../.github/workflows/pages.yml) automatically deploys the labelled preview from checked `main`. GitHub Pages is the sole website host. The first internal beta is publicly reachable under the label **内部测试第一版**. It carries preview markers and may include editorial drafts. Record the deployed revision and Actions run plus observed host or network results. Use the [beta feedback form](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) for reader reports.

For formal publication, obtain editorial approval of the exact source revision and update the Pages workflow in that release task. Have the workflow build with `npm run release` and the Pages base path, verify the release marker and manifest, and deploy the resulting `dist/`. Account for the preview trigger in the same task so a push cannot silently replace the formal edition with a preview. Record the Actions run, full source SHA, manifest and public URL. Verify the hosted permalink, actual map tiles and attribution when configured, and mainland reachability as separate checks.

## Rolling back

To roll back the current preview, revert the offending change through a PR so Pages deploys the checked `main` revision. A formal release rollback rebuilds a previously approved revision with `npm run release` and verifies its artifact before publishing it through Pages. Use Git revisions as rollback sources.
