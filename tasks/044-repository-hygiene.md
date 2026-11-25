# Task 044 | Retire the legacy corpus and trim the repository

Base revision: `0fc8b85` (`origin/main`, 2026-11-25). Owner instruction: remove the unusable parts, keep `main` current, and keep the three local agents out of each other's workspaces.

## Outcome

A contributor can open the repository and see only the current Markdown knowledge base, the current website sources, the current rules and the recent milestone records. The pre-rebuild JSON corpus, its one-time migration tools and milestone evidence 001–039 remain recoverable from the annotated tag `archive-pre-hygiene-2026-11-25`.

## Scope

- Retire `data/works/`, `data/objects/`, `data/places.json`, `data/sources.json`, `data/media.json`, `data/knowledge-relations.json`, `data/yan-qinli-journey.json`.
- Retire `scripts/lib/dataset.ts`, `scripts/migrate-legacy.ts`, `scripts/knowledge-inventory.ts`, `scripts/knowledge-parity.ts`, the migration digest fixture and the ontology pilot check.
- Remove the `knowledge:inventory` and `knowledge:parity` npm commands.
- Delete task cards, delivery reports, reviews, baseline records, research notes and screenshots for tasks 001–039 from `main`; keep them in the archive tag.
- Keep tasks 040–042, their deliveries and screenshots, `research/classics-selection-2026-11.md`, and the README screenshot.
- Add `docs/archive.md`, `docs/agent-workflow.zh-CN.md` and `tasks/044-repository-hygiene.md`.
- Create the long-lived branches `trae/work` and `workbuddy/work`; `main` remains the only deployment branch.

## Evidence

- Delivery 039 records 0 unexplained parity differences between the frozen JSON and the compiled Markdown corpus.
- `check:data`, the release gate and the website already read `data/index/knowledge-v1.json`; the legacy JSON was only read by the one-time migration tools.
- `git log` and the archive tag preserve the removed files; no history is rewritten.

## Acceptance

- `npm.cmd run check` passes.
- `npm.cmd run check:release` still rejects the draft corpus; the gate is not weakened.
- No retained Markdown links to removed files; `npm run check:docs` passes with rows 040–042 and 044.
- `data/` contains only `data/index/knowledge-v1.json`.
- Remote branches are `main`, `trae/work`, `workbuddy/work` and the open dependency PR branch; the archive tag is pushed.
- The owner reviews the PR; the implementer does not merge.

## Handoff

Self-reviewed PR from `trae/work` to `main`. The coordinator merges, then synchronizes the long-lived branches. WorkBuddy's current session worktree is not touched by this task.
