# Task 046 | Record the nine Two Wangs classics batch

Base revision: `ab57852` (`origin/main`, 2026-11-25), the merge commit of PR #53. This is a records-only task: the knowledge records were merged before their task card existed.

## Outcome

A reader of the iteration board can see that the nine Two Wangs classics batch is merged, what it added, which checks it passed and which evidence gaps remain. No author Markdown, compiled interface or generated catalogue page changes.

## Scope

- Add this task card and `docs/delivery-046.md`.
- Add row 046 to `docs/iteration-board.md` immediately after row 045.
- Record the merged batch: nine works, nine witnesses, one person, thirteen sources and one place.
- Do not edit `knowledge/`, `data/index/knowledge-v1.json`, `knowledge/catalogue/` or `knowledge/README.md`.
- Do not change task 045's row, PR #54 (task 047) or PR #55 (task 048).

## Evidence

- PR #53 merged `workbuddy/work` into `main` at `ab57852` on 2026-11-25; its head commit is `6c9c388`.
- The merge added nine work records, nine object records, one person record, thirteen source records and one place record (`git diff --name-status 1a8667e ab57852`).
- The compiled interface reports 117 works / 126 objects / 46 places / 184 sources.
- The PR's `check` job completed with conclusion `success` (Actions run 45528668068, job 138918224304).
- `npm.cmd run check:data` passes with 44 `DATE_WITHOUT_ORIGINAL` warnings and one unused source (`src-beilin-xiao-beilin`).

## Acceptance

- `npm.cmd run check:docs` passes.
- Row 046 starts with `Delivered` and names PR #53 and `ab57852`; acceptance remains the coordinator's decision.
- This task's commit changes no file under `knowledge/`, `data/index/` or the generated catalogue.
- The nine new works and nine witnesses remain drafts; independent review is still outstanding.

## Handoff

Self-reviewed PR from `workbuddy/work` to `main`, based on `ab57852` because PR #54 is still open. The coordinator decides the merge and acceptance. If #54 merges first, synchronize `workbuddy/work` with `origin/main` and resolve the adjacent board rows before merging.
