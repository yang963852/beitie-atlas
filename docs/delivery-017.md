# Delivery 017 | Close the review's defects and codify synchronization

Base revision `b85c0f47569ab67c2cbfdecdfe1a3c30ebfd03c8`. The commit introducing this report identifies the implementation revision. Task record: [task 017](../tasks/017-defect-fixes-and-governance.md).

Scope was the four verified defects and five workflow gaps from the 2026-11-18 technical review, plus the project rules that had no written form. The public host stays Codex Sites by owner decision; nothing here migrates it, and the reachability measurement is recorded as a limitation below.

## Defects

| # | Defect | Change | Regression test |
| --- | --- | --- | --- |
| D1 | Editorial `notes` on 22 work records and 4 place records were rendered by no view; none carried `notesZh` | `ObjectDetail` now shows object, work and place notes in one editorial section; each note carries its real `lang`, so a Chinese reader sees a note marked as English rather than silently unlabelled English | `app.test.tsx`: "shows work-level and place-level editorial notes and marks their language" |
| D2 | Nothing checked that `notesZh` lines up with `notes` | `validateDataset` gains `checkNotes`: a present-but-misaligned translation is an error (`NOTES_LOCALE_LENGTH`), a missing translation counts once and produces one aggregated warning (`NOTES_NOT_TRANSLATED`) | `validate.test.ts`: three cases (misaligned, aligned, backlog reported once) |
| D3 | `index.html` declared `lang="en"` while the interface opens in Chinese | Declared `zh-Hans`; the locale switcher still updates `documentElement.lang` at runtime | Covered by the existing locale test; the static attribute is checked by reading `index.html` |
| D4 | `getValidationReport()` re-validated all 69 records on every render | Memoised next to the dataset cache | `validate.test.ts`: "walks the bundled corpus once and reuses that report" |

`Work.notesZh` was also added to the type. The field was absent, which is why the UI could not even ask for a translation; the validator treats it as optional and reports the backlog instead of failing.

## Workflow

- `scripts/check-board.mjs` (`npm run check:docs`, part of `npm run check`): every `tasks/NNN-*.md` and `docs/delivery-NNN.md` needs a board row, every state must open with `Queued` / `In progress` / `Changes required` / `Delivered` / `Accepted` / `Superseded`, evidence links must resolve, task numbers must be unique. Board rows were normalised to that vocabulary and 014/016 now record who accepted them.
- `check.yml`: concurrency with cancellation, a 20-minute timeout, `node-version-file: .nvmrc` instead of a duplicated version string, both actions pinned to commits (`checkout` `11d5960`, `setup-node` `49933ea`), `persist-credentials: false`, a whitespace/conflict-marker check against the base revision, and an informational run of the strict gate.
- `site-artifact.yml` (manual `workflow_dispatch`): builds the exact directory the Sites upload consumes, in `preview` or `release` mode, verifies the `beitie-build-mode` marker (plus the release manifest in release mode), writes a summary with revision and artifact name, and keeps the artifact for 30 days. It deliberately does not upload: there is no Site credential in CI, and adding one would place write access to the public site inside a workflow file.
- `dependabot.yml`: weekly npm updates grouped by ecosystem (React together, test-and-build together), monthly action updates.
- `AGENTS.md`: new "GitHub synchronization" section (push before reporting complete, `main` must match `origin/main`, no force-push, report blocked pushes exactly); a review-versus-acceptance rule (a review by the implementer's own tooling is a self-review); the bilingual-pair rule; the `lang` rule; a ban on hard-coding test counts in reader-facing documents.
- `CONTRIBUTING.md` and the pull-request template gained the same synchronization requirement.

## Verification

| Check | Outcome |
| --- | --- |
| `npm.cmd run check` | Passed: type check, data check with zero errors, board check (17 rows), 103 tests, preview build. |
| `node scripts/check-board.mjs` before normalising the board | Failed with 16 problems (missing rows, non-canonical states, an evidence column with no reference) — the check proves it can catch the drift it was written for. |
| `npm.cmd run check:release` | Rejected all 69 draft work and object records, as before. |
| YAML syntax of the three workflow/config files | Parsed with the `yaml` CLI; all three valid. Not executed on GitHub in this task — the first run happens on the push. |
| Layout and keyboard | Detail view inspected at 390, 720 (200% zoom equivalent at DPR 2) and 1440 CSS pixels with the live Tianditu basemap: the editorial section lists object notes in Chinese followed by the three English work notes, wraps without horizontal overflow, and the existing heading and disclosure structure is unchanged. Evidence: [1440](screenshots/017-notes-1440.png) · [720](screenshots/017-notes-720.png) · [390](screenshots/017-notes-390.png). Keyboard behaviour was not re-walked in this task because no control or focus order changed. |

## Limitations and open items

- **Mainland reachability is unchanged and unresolved.** `https://beitie-atlas.partedlute2.chatgpt.site/` returned HTTP 403 with a Cloudflare block page from a mainland network during the review (IPv4, IPv6, and three user agents). The owner decided on 2026-11-18 to keep Codex Sites as the public host, so this is recorded as a known limitation, not fixed here.
- The 22 work records and 4 place records still have English-only notes. They are now visible and marked, and the validator reports them as one warning (26 records); translating them is editorial work, not an engineering one.
- CI changes are unexercised until the branch is pushed. The whitespace step falls back to the working tree when no base revision is comparable.
- The site artifact workflow stops at the artifact boundary. The Sites upload and its version number remain owner actions.
- No corpus claim was added, changed, or marked reviewed.
