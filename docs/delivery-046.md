# Delivery 046 · Record the nine Two Wangs classics batch

**Status: delivered — records only; merged in [PR #53](https://github.com/yang963852/beitie-atlas/pull/53) at `ab57852`; coordinator acceptance pending.** Base `ab57852` (`origin/main`, 2026-11-25). Branch `workbuddy/work`. This task adds no knowledge content.

## Merged batch

- PR #53 merged `workbuddy/work` into `main` on 2026-11-25 at `ab57852`; the feature commit is `6c9c388`.
- Nine work records: 东山松帖, 寒切帖, 黄庭经, 乐毅论, 平安何如奉橘三帖, 上虞帖, 行穰帖, 鸭头丸帖, 远宦帖.
- Nine object records, one per work; one person record (王献之); thirteen source records; one place record (Princeton University Art Museum).
- All nine works and nine witnesses are `review.state: draft`. The person record is also a draft.

## Corpus counts

| Measure | Value |
| --- | --- |
| Works | 117 |
| Objects | 126 |
| Places | 46 |
| Sources | 184 |
| Provenance events | 75 |
| Work guides | 4 |
| People articles | 8 |
| Reading notes | 2 |
| Documented relationships | 1 |
| Media records | 1 |

## Checks

| Command or run | Result |
| --- | --- |
| PR #53 `check` job | Success; Actions run 45528668068, job 138918224304 |
| `npm.cmd run check:data` | Passed; 0 errors; 44 `DATE_WITHOUT_ORIGINAL` warnings; 1 `UNUSED_SOURCE` (`src-beilin-xiao-beilin`) |
| `npm.cmd run check:docs` | Passed with row 046 added |

## Limitations

- The nine works and nine witnesses remain drafts; independent editorial review has not been completed.
- 44 `DATE_WITHOUT_ORIGINAL` warnings and one unused source remain in the corpus. They are warnings, not release blockers, and are not addressed by this records-only task.
- The batch added no work guide (导读); the library falls back to each record's background sentence for these works.
- PR #54 (task 047) is still open and edits the adjacent task 045 row in `docs/iteration-board.md`. If it merges first, this branch must be synchronized with `origin/main` and the two rows resolved before the 046 PR merges.

## Not changed

- No file under `knowledge/` was edited: no work, object, person, place, source, note, catalogue page or library index.
- `data/index/knowledge-v1.json` is unchanged by this task.
- Task 045's row, PR #54 and PR #55 are untouched.

## Rollback

Revert the records commit for task 046. The PR #53 records and the compiled interface stay as merged; no archive tag is involved.
