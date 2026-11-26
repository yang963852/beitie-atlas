# Task 052 · Slim the repository and archive milestones 040–051

**Status:** In progress
**Owner:** TRAE
**Base:** `c2eaa62`

## Reader outcome

A newcomer opening a fresh clone sees only the current author sources, code, checks, operating documents and the active milestone. Dated milestones and plans remain retrievable from one annotated tag.

## Scope

- Create and push `archive-milestones-040-051-2026-11-26` at the current `main` revision.
- Remove tasks 040–051, their delivery reports, acceptance screenshots, batch research, and the completed plan, ledger, proposal and audit documents from `main`.
- Keep the current operating documents listed in `docs/START-HERE.md` and this milestone's delivery report.
- Fold the still-binding source rules and seven-part guide standard from `knowledge-plan.md` into `docs/CONTRIBUTE.zh-CN.md`.
- Fix the stale release, workflow and audit statements touched by the move.
- Record the long-term rule in `AGENTS.md`: `main` keeps only the active milestone; accepted records move to an archive tag; UI screenshots live in the PR/issue.

## Do not change

- `knowledge/` records, `src/`, the compiler, the release gate, or the live site's behaviour.
- Git history. Do not rewrite history, delete tags, or force-push.

## Evidence

- Archive tag present on `origin`.
- Before and after tracked-file counts.
- `npm run check` and `check:docs` results.
- A grep result showing no kept document links to a removed local file.

## Acceptance

- `docs/` contains only current operating documents plus this milestone's delivery report; `tasks/` contains only this task.
- README and START-HERE describe the project and link only current documents.
- The archive tag can restore any removed record.

## Stop

Open a PR to `main`. The coordinator decides acceptance and merge.
