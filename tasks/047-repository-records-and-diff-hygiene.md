# Task 047 | Record the task 045 merge and bound generated diffs

Base revision: `ab57852` (`origin/main`, 2026-11-25). This is the first task of the v2 execution plan; the coordinator asked for the repository records to match the merged history before new work starts.

## Outcome

A reader of the iteration board sees that task 045 was merged in PR #51 at `1a8667e`, and a reviewer running `git diff` no longer receives the whole compiled knowledge interface or every generated catalogue page as text. The records remain inspectable on request.

## Scope

- Update the task 045 row in `docs/iteration-board.md` so it records the merge instead of "awaiting coordinator merge".
- Extend the existing `.gitattributes` (keeping its line-ending rules) with:
  - `data/index/knowledge-v1.json -diff linguist-generated`;
  - `knowledge/catalogue/** linguist-generated`;
  - `knowledge/README.md linguist-generated`.
- Record the diff-hygiene decision in the board's Decisions section.
- Do not change knowledge records, the compiler, the website or the release gate.

## Evidence

- PR #51 merged `trae/work` into `main` at `1a8667e` on 2026-11-25; the board row still says the merge is pending.
- The nine-classics PR #53 added 1,428 lines to `data/index/knowledge-v1.json`; reading that payload as a text diff spends review context on generated content.
- `git diff --text` continues to show the JSON when its content must be inspected.

## Acceptance

- `npm.cmd run check:docs` passes.
- The task 045 row starts with the canonical keyword `Delivered` and names PR #51 and `1a8667e`; acceptance remains the coordinator's separate decision.
- `git diff` against a revision that changes `data/index/knowledge-v1.json` does not print the generated payload; `git diff --text` still does.
- Generated catalogue pages keep local text diffs and are only collapsed by GitHub's `linguist-generated` marker.
- No author Markdown, generated catalogue content or compiled interface bytes change in this PR.

## Handoff

Self-reviewed PR from `trae/work` to `main`. The coordinator decides the merge and whether to mark task 045 accepted. The next task, 048, generates the knowledge status report from the compiled interface.
