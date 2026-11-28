# Build, version and release runbook

This page is the authoritative description of how the project is versioned, checked and published. Other documents state the rule in one sentence and link here; they do not repeat the procedure.

The [atlas workflow](atlas-workflow.md) covers editorial review. [AGENTS.md](../AGENTS.md) is the binding contract for contributors and agents.

## Version policy

Formal editions use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`, without a leading `v` in `package.json`.

| Part | Use it for | Do not use it for |
| --- | --- | --- |
| `MAJOR` | An incompatible change to a published interface, data format or migration contract that readers, contributors or reusers must act on | A large visual redesign, a bigger corpus or a milestone feeling |
| `MINOR` | A backward-compatible feature, a new section or reading capability, a compatible data field, an important reading improvement, or an edition that publishes a substantial body of knowledge | Routine corrections that fit a patch |
| `PATCH` | A backward-compatible defect fix, a mobile-layout fix, a broken link, a factual correction, a translation correction or a stability improvement | A new capability or a breaking format change |

Routine knowledge additions, source work, documentation, test maintenance and internal refactoring do not each need a version. They merge continuously and the maintainer decides when they form an edition. Do not treat a rising version number as a measure of progress.

## One author source for the edition

The `version` field in [`package.json`](../package.json) is the only hand-maintained product edition.

- `npm version X.Y.Z --no-git-tag-version` updates `package.json` and `package-lock.json` together. Do not edit the lockfile by hand.
- The website reads the package version at build time (`vite.config.ts`), so the footer and the reading-room colophon do not carry a second typed number.
- `npm run knowledge:package` writes the same edition into the downloadable ZIP manifest as `appVersion`.
- `npm run release` writes it into `dist/release-manifest.json` as `appVersion`.
- `npm run check:version` rejects a malformed version, a lockfile out of step with `package.json`, a missing Unreleased section or a missing CHANGELOG section for the current edition.

`data/index/knowledge-v1.json` is a different kind of version. Its `beitie-knowledge/1` format version describes the compiled data interface. It is not the product edition and is not synchronised with it.

Do not edit a generated file to make a version check pass.

## Continuous deployment and formal release

| | Continuous deployment | Formal release |
| --- | --- | --- |
| Trigger | A checked change merges to `main` | The maintainer decides that the accumulated work forms an edition |
| Version bump | No | Yes, in `package.json` and `package-lock.json` |
| CHANGELOG | Optional; the release owner may collect entries later | A dated edition section is required |
| Git tag | No | An annotated `vX.Y.Z` tag on the release merge commit |
| GitHub Release | No | Required, created from the same tag |
| Artifact | The Pages workflow builds and verifies `dist/` | The same verified build, recorded with `appVersion` and `sourceRevision` |
| Reader-facing evidence | The footer shows the edition and the current build revision | The tag, GitHub Release, manifest and deployed revision agree |

The deployed site can contain changes made after the latest formal edition. The interface therefore shows both values, for example the edition followed by `build` and the short revision. The build-details panel states that the deployment may be newer than the edition. This is deliberately a build stamp, not a second versioning system.

Older tags kept for history do not all have GitHub Releases. This policy applies to editions published from now on; historical tags and releases are not rewritten.

## Checks and commands

| Command | Purpose | When it runs |
| --- | --- | --- |
| `npm run check` | Compiles knowledge, checks types, data, interface, catalogue, status, isolation, reproducibility, release metadata and docs, runs tests, packages the ZIP and emits a preview build | Every pull request, task branch and `main` push |
| `npm run check:release` | Runs the strict data gate and release metadata without writing `dist/` | Pull requests and the Pages workflow |
| `npm run check:version` | Checks SemVer format, the lockfile, the Unreleased section and the CHANGELOG section | Inside `npm run check`; run it directly when editing release metadata |
| `npm run check:tag -- vX.Y.Z` | Checks an annotated tag against its own commit, package edition, CHANGELOG and `main` ancestry | After tagging, and automatically on a `v*` tag push |
| `npm run check:reproducible` | Compiles the same input twice and compares the output | When the compiler or interface changes |
| `npm run build` | Preview artifact; drafts are allowed and clearly marked | Local review; never uploaded |
| `npm run release` | Formal release artifact with the strict gate and `dist/release-manifest.json` | Pages deployment and local release verification |

`npm run check:release` does not require a Git tag. A normal development commit keeps the last released version until the maintainer authorises a new one, so ordinary CI never fails for a missing tag. Tag verification is a separate, opt-in check.

## What `npm run release` does, in order

1. Deletes the previous `dist/`. A stale preview or older release cannot be reused.
2. Checks release metadata: SemVer, `package-lock.json`, the Unreleased section and the CHANGELOG section for the package edition.
3. Requires a Git checkout with a commit and a clean tracked working tree. The manifest must name the revision that was actually built; an uncommitted change would make that record false. Use `npm run build` for an uncommitted preview.
4. Runs strict data validation (`releaseMode: true`). Draft records, broken references, missing evidence and invalid coordinates fail the release.
5. Compiles the knowledge interface and runs the TypeScript check.
6. Builds the downloadable knowledge-library ZIP.
7. Builds with `VITE_RELEASE_MODE=1`. Vite independently runs the strict gate before it writes `<meta name="beitie-build-mode" content="release">`.
8. Writes `dist/release-manifest.json` with the edition, validated counts, Node version, UTC time and the Git revision.
9. Verifies the release marker, the manifest mode, edition and counts, and the presence of a JavaScript bundle in `dist/assets/`.

Any failure prints the reason, deletes `dist/`, and exits non-zero. A failed release leaves nothing that could be uploaded by mistake.

## Release phases

### 1. Prepare

The maintainer decides:

- the target version and whether it is a major, minor or patch edition;
- the scope: which merged work the edition records;
- that the relevant pull requests are merged or deliberately excluded;
- that no blocking issue remains open.

An agent may prepare the candidate, but only the maintainer chooses the version and authorises the release.

### 2. Build the candidate

Work in a separate clone or working tree, on a short-lived branch from current `origin/main`.

```bash
git fetch origin
git switch -c task/NNN-release-X-Y-Z origin/main
npm version X.Y.Z --no-git-tag-version
```

Then:

1. Move the relevant Unreleased entries into a new `## vX.Y.Z` section and leave an empty Unreleased section.
2. Write the edition for readers: what changed, what they can now do, and which knowledge was added. Do not paste commit titles.
3. Run `npm run check`, `npm run check:release` and `npm run check:version`.
4. Commit the candidate, then run `npm run release` on the clean commit if the artifact needs local verification.
5. Open one pull request. It contains only the version, lockfile, CHANGELOG and any release-specific evidence. Do not tag, publish a GitHub Release or merge the pull request.

### 3. Review

The reviewer checks:

- the version matches the agreed scope and the SemVer rules;
- the CHANGELOG describes the actual changes and does not invent history;
- `npm run check` and `npm run check:release` are green;
- `npm run check:version` agrees with the lockfile and CHANGELOG;
- `dist/release-manifest.json`, if built, records the edition, counts and a source revision;
- no unrelated architecture, dependency or interface change is bundled in.

Self-review is sufficient under the lightweight workflow. The maintainer decides the merge.

### 4. Publish

After the maintainer merges the release pull request:

1. Merge, and record the merge commit on `main`.
2. Wait for the Pages workflow for that commit to succeed. A failed deployment is not a published edition.
3. Update the local `main` and create an annotated tag on the merge commit:

   ```bash
   git switch main
   git pull --ff-only
   git tag -a vX.Y.Z -m "vX.Y.Z"
   npm run check:tag -- vX.Y.Z
   git push origin vX.Y.Z
   ```

   If other work merged before tagging, tag the recorded release merge commit rather than a later commit.

4. Create the GitHub Release from the same tag. Use the CHANGELOG section as the notes and attach nothing that the release command did not produce.
5. The tag push runs the quality workflow, including `npm run check:tag`. Confirm it passes.
6. Keep the deployment workflow evidence: the run, the commit, the edition and the verified ZIP.

Do not create a GitHub Release from a branch, a different commit or a moved tag.

### 5. Verify after publication

Record only what was actually checked:

- the live site loads and the footer shows the intended edition and build revision;
- the revision in the footer matches the deployed commit;
- the home page, one work, one object, search and a phone-width layout work;
- the download link returns a ZIP whose `manifest.json` carries the same `appVersion` and a source revision;
- `gh release view vX.Y.Z --json tagName,targetCommitish,url` names the same tag and commit;
- the Pages run and the tag-check run are green;
- no issue needs immediate correction.

A local preview does not prove public mainland access. A mocked map does not prove the live basemap works. Report those as unverified rather than claiming them.

## Artifact and manifest

`dist/release-manifest.json` carries:

```json
{
  "formatVersion": 1,
  "mode": "release",
  "releaseMode": true,
  "appVersion": "X.Y.Z",
  "generatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
  "node": "v24.x.x",
  "sourceRevision": "<40-character Git commit>",
  "counts": { "works": 0, "objects": 0, "places": 0, "sources": 0, "events": 0 }
}
```

The downloadable library manifest carries the same `appVersion`, plus `formatVersion: "beitie-knowledge/1"`, `sourceRevision`, `sourceDate`, the schema version and the corpus counts. The interface format version and the product edition remain separate.

Minimum manual checks:

```bash
grep -o '<meta name="beitie-build-mode"[^>]*>' dist/index.html
cat dist/release-manifest.json
python -c "import json,zipfile; print(json.loads(zipfile.ZipFile('dist/download/beitie-knowledge.zip').read('manifest.json')))"
```

`content="release"`, a manifest whose `appVersion` matches `package.json`, and counts that match the validated corpus are the minimum evidence. A missing manifest, a `preview` marker, a count mismatch or an edition mismatch means the directory is not a release artifact.

## CI and deployment

[The Pages workflow](../.github/workflows/pages.yml) publishes a verified release build from checked `main`. On a push to `main` it runs `npm run check`, then `npm run release`, verifies the release marker, the manifest edition and counts, checks the downloadable ZIP's `appVersion` and `sourceRevision`, and uploads `dist/`. A push to `main` therefore cannot publish a draft or an unverified artifact.

[The quality workflow](../.github/workflows/check.yml) checks pull requests and task branches without requiring a tag. A `v*` tag push additionally runs `npm run check:tag`, so a formal tag is verified against its own commit.

GitHub Pages is the sole website host. A local `dist/` is never uploaded by hand.

## Rolling back and handling incidents

### A Pages deployment fails

1. Read the failed run log before rerunning.
2. Reproduce the failure at the same commit with `npm run check`, then `npm run check:release`, then `npm run release`.
3. Fix the cause in a pull request and let Pages rebuild checked `main`. Do not upload a local `dist/` and do not weaken a check to make the run green.

### A released edition contains an error

Published editions are immutable. Do not delete or move the tag, rewrite history or force-push `main`.

1. Fix the source or code in a normal pull request.
2. If the fix completes the same edition's intent and was never correct in public, publish a new `PATCH` edition with its own CHANGELOG entry and tag.
3. If the error is editorial, keep the correction record in the changed entry and its sources; a new edition is not required for every erratum unless the maintainer decides it is.

### Knowledge needs an erratum

Edit the authored Markdown with evidence, run `npm run knowledge:compile` and `npm run knowledge:generate`, and submit the source change. Record the correction in the next edition's CHANGELOG. Never edit `knowledge/catalogue/`, `knowledge/README.md` or a manifest by hand.

### The artifact and its version disagree

1. Do not publish the artifact.
2. Delete `dist/` and rerun `npm run release` from the intended clean commit.
3. Compare `appVersion`, `sourceRevision` and counts with `package.json`, the CHANGELOG and the validated corpus.
4. If the mismatch persists, stop and report which value came from which command. Do not patch the manifest.

### Restore a stable state

Revert the offending commit through a pull request (`git revert <commit>`), then let Pages rebuild checked `main`. Do not reset or force-push a shared branch. If the revert removes a formal edition's fix, publish a new patch edition rather than editing the old tag.

### Tag rules

- A published tag is immutable. Never delete, move, force-push or reuse it.
- If a tag is wrong, leave it in place, state the problem in the GitHub Release, and publish a new `PATCH` edition with a new tag.
- A tag must be annotated, must point to the release merge commit on `main`, and must match the package edition and CHANGELOG section at that commit.
- Do not tag another contributor's unmerged branch, a local build or a hand-made artifact.

### Working beside other agents

Use a separate clone or working tree per task. The release candidate owns `package.json`, `package-lock.json` and `CHANGELOG.md`; announce that ownership before editing. Do not merge unrelated work into the release branch merely to make it current. Do not tag or publish on another agent's behalf. A concurrent author should keep writing knowledge and ordinary code while the release candidate is reviewed.

## Roles

**Maintainer**

- decides whether and when to release;
- chooses the version and scope;
- approves the merge and the formal publication;
- decides how an incident is handled.

**Release owner (maintainer or delegated agent)**

- prepares the version, lockfile and CHANGELOG;
- runs the checks and the release artifact;
- opens the release pull request;
- reports commands actually run and anything unverified;
- stops before tagging, publishing a GitHub Release or merging.

**Reviewer**

- checks the candidate against the agreed scope;
- verifies the edition, CHANGELOG and evidence;
- identifies risks and asks for a fix in the same pull request.

No agent decides a formal release on its own.

## Positive-path evidence

The release script's mechanics are covered by [`tests/release-gate.test.ts`](../tests/release-gate.test.ts) with a controlled fixture: a reviewed corpus passes, a draft fails, an invalid reference fails, a preview-marked artifact fails, a mismatched manifest fails and a mismatched edition fails.

The metadata and tag checks are covered by [`tests/release-meta.test.ts`](../tests/release-meta.test.ts): a valid SemVer edition passes, a malformed version, stale lockfile or missing CHANGELOG section fails, an annotated tag passes, and a lightweight, mismatched or missing tag fails.
