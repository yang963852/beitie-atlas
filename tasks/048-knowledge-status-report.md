# Task 048 | Generate a knowledge status report

Base revision: `ab57852` (`origin/main`, 2026-11-25). This branch is stacked on task 047's records-only PR #54; the coordinator merges #54 first, then this task.

## Outcome

A contributor or agent can open `docs/knowledge-status.md` and see, for every work, its review state, guide, linked people, source count, object count, place-coordinate coverage and date gaps. Planning the next content batch no longer requires scanning 117 records or the generated catalogue. `npm run knowledge:status --json` returns the same data as JSON.

## Scope

- Add `scripts/lib/knowledge-status.ts`: build the report from `compileKnowledge()` output and `validation.warnings`, reusing the compiler and validator instead of defining new rules.
- Add `scripts/knowledge-status.ts`: write the page, support `--check` and `--json`.
- Add `knowledge:status` and `check:status` npm scripts and include the check in `npm run check`.
- Generate `docs/knowledge-status.md`; the file starts with a generated marker and must not be hand-edited.
- Add focused tests for coverage, date-warning mapping, uncited sources, attribution counts and deterministic rendering.
- Do not change author Markdown, the compiled interface, the release gate or the website.

## Evidence

- The corpus now has 117 works and 126 objects; 173 records are still drafts and only 4 works have a guide.
- The validator reports 44 `DATE_WITHOUT_ORIGINAL` warnings and one uncited source. A separate count of "sources not cited by a work record" is not the release-gate rule; this page uses the validator's warnings as the single definition.
- The compiled interface is about 700 KB; reading it whole is not a planning method.

## Acceptance

- `npm.cmd run knowledge:status` writes the page; `npm.cmd run check:status` passes on a fresh generation and fails when the page is stale.
- The report covers every compiled work; the object counts sum to the compiled object total.
- The date-gap total equals the validator's `DATE_WITHOUT_ORIGINAL` warnings, and every such warning maps to a work.
- Uncited sources and unused places come from validator warnings, not a parallel citation scan.
- `npm.cmd run check` passes, including the new status check and the tests.
- The generated page carries the marker and is deterministic: two generations from the same corpus are byte-identical.

## Handoff

Self-reviewed stacked PR from `feat/048-knowledge-status` to `main`. The coordinator merges PR #54 first, then this PR, and synchronizes `trae/work`. The next content task (050) uses the page as its queue.
