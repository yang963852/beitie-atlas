# Delivery 052 | Slim the repository and archive milestones 040–051

Date: 2026-11-26. Task: [052](../tasks/052-repository-slimming.md). Branch: `trae/work`. Base: `c2eaa62`.

## Result

`main` now keeps only current author sources, code, checks, operating documents and milestone 052. Tasks 040–051, their delivery reports, 53 acceptance screenshots, two batch research reports and seven completed plan, ledger, proposal or audit documents are in the annotated tag `archive-milestones-040-051-2026-11-26`. The still-binding source rules and seven-part guide standard were moved into `docs/CONTRIBUTE.zh-CN.md`.

## Changed files

- `AGENTS.md`: active-milestone policy, screenshot policy and updated plan links.
- `docs/archive.md`: new archive tag, contents and restore commands.
- `docs/iteration-board.md`: current milestone only.
- `docs/CONTRIBUTE.zh-CN.md`: six source rules and seven-part guide standard.
- `README.md`, `README.en.md`: current project content only; removed the stale 039 screenshot and coordination rows.
- `docs/START-HERE.md`: current documents, archive ranges and a reuse section.
- `docs/release.md`, `docs/agent-workflow.zh-CN.md`, `docs/map-setup.md`, `docs/engineering-plan.md`: stale release text, stale task status and personal paths fixed.
- `templates/delivery-report.md`, `.agents/skills/review-change/SKILL.md`, `CHANGELOG.md`, `knowledge/_templates/work.md`: policy and link updates.
- `package.json`: Node engine raised to `>=24.0.0`.
- Removed: 12 task cards, 10 delivery reports, 53 screenshots, 2 research reports and 7 completed documents.

## Commands and outcomes

| Command | Result |
| --- | --- |
| `git merge origin/main --ff-only` | Fast-forward `4114244..c2eaa62` |
| `git tag -a archive-milestones-040-051-2026-11-26` and `git push origin` | Tag present on origin at `ee93d96` |
| `git ls-remote --tags origin archive-milestones-040-051-2026-11-26` | `ee93d96b434f138b0d94f781cc3f51cf909a309e` |
| `npm run check` | Passed |
| `gh pr merge 61 --merge` | Merged as `44dba21` at 2026-11-26T00:43:30Z |
| Pages release workflow | Run `45730768543`, completed successfully in 1m11s |
| Live release marker | `beitie-build-mode` = `release` |
| Live manifest | `mode=release`; 117 works, 126 objects, 46 places, 184 sources, 75 events |

## Verification evidence

| Check | Result: passed / failed / not run | Evidence or limitation |
| --- | --- | --- |
| Type check | Passed | `tsc --noEmit` |
| Data validation | Passed | 117 works, 126 objects, 46 places, 184 sources, 75 events; 0 errors, 44 date warnings |
| Interface | Passed | Compiled interface current: 117 works, 126 objects |
| Isolation | Passed | The web reads only the compiled interface |
| Reproducibility | Passed | 608 source files, identical output twice, read-only copy |
| Board check | Passed | 1 row; task 052 and delivery 052 recorded |
| Knowledge status | Passed | 117 works, 44 date warnings, 0 uncited sources |
| Unit tests | Passed | 19 files, 163 tests |
| Library package | Passed | 613 files, 607.9 KiB |
| Production build | Passed | Vite built `dist/`; existing chunk-size warning only |

## Known issues and decisions

- Removing files from `main` does not reduce the Git pack size; history is preserved. A smaller clone needs a separate clean template repository or a shallow clone.
- Links in older Issues or PRs that point to removed local files may fail; `docs/archive.md` gives the tag and the restore command.
- Archived plans and proposals are frozen. Restore them from the tag before resuming that work.
- The 1.1 site behaviour, knowledge data and release gate are unchanged.

## Reviewer outcome

Self-review by TRAE. [PR #61](https://github.com/yang963852/beitie-atlas/pull/61) was merged by coordinator instruction on 2026-11-26 and the Pages release was verified live. Coordinator acceptance remains pending.
