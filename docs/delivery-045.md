# Delivery 045 · Retire the legacy corpus and trim the repository

**Status: delivered — self-reviewed; awaiting coordinator merge and acceptance.** Base `0fc8b85` (`origin/main`, 2026-11-25). Branch `trae/work`. Implementation commits `551cac0` (workflow rules), `ee74725` (legacy retirement and archive), `d3b6a4f` (renumber to task 045), and integration merges `94316d0` and `4e4b5ce`. Archive tag `archive-pre-hygiene-2026-11-25` was pushed before any deletion.

## Scope

- Removed the frozen JSON corpus (`data/works/`, `data/objects/`, `data/places.json`, `data/sources.json`, `data/media.json`, `data/knowledge-relations.json`, `data/yan-qinli-journey.json`).
- Removed the one-time migration and parity tools: `scripts/lib/dataset.ts`, `scripts/migrate-legacy.ts`, `scripts/knowledge-inventory.ts`, `scripts/knowledge-parity.ts`, the migration digest fixture and the ontology pilot check; removed `knowledge:inventory` and `knowledge:parity`.
- Moved tasks, deliveries, reviews, baseline records, research notes and screenshots 001–039 out of `main`; kept tasks/deliveries 040–042 and their screenshots, plus the README screenshot.
- Added `docs/archive.md` and `docs/agent-workflow.zh-CN.md`; created long-lived branches `trae/work` and `workbuddy/work`; added task 045.

## Commands and outcomes

| Command | Result |
| --- | --- |
| `npm.cmd run check` | Passed: interface current (108 works / 117 objects); data 0 errors / 38 known warnings; 99 catalogue pages; isolation; reproducibility (518 files); board 6 rows; 18 test files / 156 tests; ZIP 571 files; preview build succeeded |
| `npm.cmd run check:release` | Expected rejection: `[release] Gate FAILED. This corpus is not releasable.` Drafts still block formal publication |
| Archive tag | `git push origin archive-pre-hygiene-2026-11-25` succeeded before deletion |
| Long-lived branches | `origin/trae/work` and `origin/workbuddy/work` pushed from `0fc8b85` |

## Local cleanup

- Removed seven stale worktrees: `worktree-040`, `worktree-042`, `worktree-a`, `worktree-b`, `worktree-d`, `direct-pr-verification` and `review-pr29-38d73a6`.
- Deleted 51 merged local branches plus five archived unmerged branches; kept `main`, `trae/work`, `workbuddy/work`, the active `feat/043-unified-library-river` worktree and WorkBuddy's running session.
- Deleted old `.private/tmp` test copies and caches, and the completed `043-live` browser profile. `.private` fell from about 6.2 GB (after the worktree copies) to about 270 MB.
- WorkBuddy currently uses `C:\Users\zhangyang\WorkBuddy\Worktrees\碑帖之间\main-57a0db19` on branch `workbuddy/main-57a0db19`; the new long-lived workspace is `.private/worktrees/workbuddy` on `workbuddy/work`.

## Not done here

- The coordinator decides the merge. This report is a self-review, not an acceptance.
- Task 043 (bronze/slips) and task 044 (unified reader river) were merged into `main` while this branch was open; their task cards, deliveries, screenshots and counts are included. The repository-hygiene task was renumbered from 044 to 045 to avoid the collision.
- WorkBuddy's running session is not interrupted. Its worktree and the active `worktree-043` are retained.
- GitHub clone size will not shrink materially because history is not rewritten.

## Rollback

Restore any removed file from the archive tag:

```powershell
git checkout archive-pre-hygiene-2026-11-25 -- data/works docs/delivery-039.md
```

Do not delete the archive tag or rewrite history.
