# Delivery 044 · Retire the legacy corpus and trim the repository

**Status: delivered — self-reviewed; awaiting coordinator merge and acceptance.** Base `0fc8b85` (`origin/main`, 2026-11-25). Branch `trae/work`. Implementation commits `551cac0` (workflow rules) and `ee74725` (legacy retirement and archive). Archive tag `archive-pre-hygiene-2026-11-25` was pushed before any deletion.

## Scope

- Removed the frozen JSON corpus (`data/works/`, `data/objects/`, `data/places.json`, `data/sources.json`, `data/media.json`, `data/knowledge-relations.json`, `data/yan-qinli-journey.json`).
- Removed the one-time migration and parity tools: `scripts/lib/dataset.ts`, `scripts/migrate-legacy.ts`, `scripts/knowledge-inventory.ts`, `scripts/knowledge-parity.ts`, the migration digest fixture and the ontology pilot check; removed `knowledge:inventory` and `knowledge:parity`.
- Moved tasks, deliveries, reviews, baseline records, research notes and screenshots 001–039 out of `main`; kept tasks/deliveries 040–042 and their screenshots, plus the README screenshot.
- Added `docs/archive.md` and `docs/agent-workflow.zh-CN.md`; created long-lived branches `trae/work` and `workbuddy/work`; added task 044.

## Commands and outcomes

| Command | Result |
| --- | --- |
| `npm.cmd run check` | Passed: interface current (98 works / 107 objects); data 0 errors / 38 known warnings; 99 catalogue pages; isolation; reproducibility (518 files); board 4 rows; 18 test files / 156 tests; ZIP 523 files; preview build succeeded |
| `npm.cmd run check:release` | Expected rejection: `[release] Gate FAILED. This corpus is not releasable.` Drafts still block formal publication |
| Archive tag | `git push origin archive-pre-hygiene-2026-11-25` succeeded before deletion |
| Long-lived branches | `origin/trae/work` and `origin/workbuddy/work` pushed from `0fc8b85` |

## Not done here

- The coordinator decides the merge. This report is a self-review, not an acceptance.
- Two parallel task-043 workstreams (`tasks/043-bronze-and-slips.md` in the primary checkout and `tasks/043-unified-reader-river.md` in `feat/043-unified-library-river`) are left untouched. They need renumbering or a merge decision before their rows enter the board.
- Local branch/worktree/cache cleanup and the `workbuddy/work` workspace handoff are performed after the merge; WorkBuddy's running session is not interrupted.
- GitHub clone size will not shrink materially because history is not rewritten.

## Rollback

Restore any removed file from the archive tag:

```powershell
git checkout archive-pre-hygiene-2026-11-25 -- data/works docs/delivery-039.md
```

Do not delete the archive tag or rewrite history.
