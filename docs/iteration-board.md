# Iteration board

Updated: 2026-11-27. This board tracks the active milestone. Independent contributions are coordinated in GitHub Issues and pull requests.

**Archived milestones:** 001–039 are in the annotated tag `archive-pre-hygiene-2026-11-25`; 040–051 and the completed plans, proposals and audit are in `archive-milestones-040-051-2026-11-26`. Agent-named coordination records are in `archive-agent-records-2026-11-27`. See [the archive index](archive.md).

| Task | Outcome | State | Exit evidence |
| --- | --- | --- | --- |
| 052 | Slim the repository and archive milestones 040–051 | Delivered — merged in [PR #61](https://github.com/yang963852/beitie-atlas/pull/61) at `44dba21`; Pages release run `45730768543`; self-reviewed; no separate acceptance required | See [task 052](https://github.com/yang963852/beitie-atlas/blob/archive-agent-records-2026-11-27/tasks/052-repository-slimming.md) and [delivery 052](https://github.com/yang963852/beitie-atlas/blob/archive-agent-records-2026-11-27/docs/delivery-052.md); [archive index](archive.md) |
| 053 | Add 10 core work guides | Delivered — merged in [PR #64](https://github.com/yang963852/beitie-atlas/pull/64) at `01d11bf`; 10 guides verified; self-reviewed; no separate acceptance required | See [task 053](https://github.com/yang963852/beitie-atlas/blob/archive-agent-records-2026-11-27/tasks/053-core-work-guides.md) and [knowledge buildout](knowledge-buildout.md) |

## Working mode

The owner decides merges; self-review is sufficient. Routine work needs only a PR with the change, checks and known gaps. CI green plus the owner's merge is the gate.

A release updates `CHANGELOG.md`, tags `vX.Y.Z` and lets Pages publish. A release note is optional. The board is optional; if a task card or delivery report exists, `npm run check:docs` checks its row and links. A row state opens with `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted` or `Superseded`.

P1 blocks a release; P2 is fixed in the next pass; P3 is optional. Fix demonstrated risks first. Do not overwrite evidence from previous rounds; roll back by reverting the specific change.

## Decisions

- 2026-11-27: Historical records that named a local agent moved to the annotated tag `archive-agent-records-2026-11-27`: tasks 052/053, delivery 052, the ontology pilot input and the original Duobao reading-note credit. `main` keeps the current guidance without those names; [the archive index](archive.md) gives the restore paths.
- 2026-11-27: The compiled interface leaves version control. `data/index/knowledge-v1.json` is rebuilt by `npm run knowledge:build`, and the `dev`, `build`, `check`, `typecheck` and `test` entry points run that build themselves, so a fork no longer carries one generated file that conflicts on every content change. `knowledge/catalogue/` and `knowledge/README.md` stay tracked: they are the GitHub reading surface and the target of the repository's navigation links, and `check:knowledge` still fails on drift.
- 2026-11-27: The public repository carries a tool-independent agent contract. `AGENTS.md` states the binding rules and the documents to read per task; it names no local agent, branch or machine path. Agent prompts, private skills and local workspace instructions live outside version control. This supersedes the 2026-11-25 long-lived per-agent branch decision: each task uses its own short-lived branch opened from current `main`, and concurrent tasks use separate clones or working trees.
- 2026-11-26: Lightweight solo-owner workflow. The owner's merge is the acceptance; self-review is sufficient. Routine work needs no delivery report, board row, screenshot set or archive tag. A release is a `CHANGELOG.md` entry plus a `vX.Y.Z` tag; `npm run release` remains the automated data gate. Evidence rules and automated checks remain. This supersedes the 2026-11-18 independent-review decision and the archive-after-acceptance rule below.
- 2026-11-26: `main` keeps current sources, operating documents and the active milestone only. Accepted task cards, delivery reports, screenshots, research and dated plans move to an annotated `archive-*` tag; UI screenshots live in the PR or issue. Optional under the lightweight workflow.
- 2026-11-25: 1.1 版发布。117 部作品、126 件实物、8 位书家、2 篇读帖与 1 条人物关系全部转为已审核，面向读者的草稿/已审核标记与预览草稿提示不再显示；发布门槛与草稿阻断能力保留。
- 2026-11-25: Development and knowledge proceed as two workstreams coordinated through the compiled interface. Active work is described in the current task brief or GitHub Issue; dated plans are archived rather than kept as current guidance. New `knowledge/` directories or fields still require compiler and validator support first.
- 2026-11-25: A work guide stays inside its work Markdown as `guide` plus `## 导读`; it is not a separate file under `knowledge/notes/`. Section-level guides need a compiler change, not an author-side workaround.
- 2026-11-25: Generated review artifacts are marked in `.gitattributes`. The compiled interface `data/index/knowledge-v1.json` is excluded from text diffs, and generated catalogue pages plus `knowledge/README.md` are marked `linguist-generated`; use `git diff --text` when the generated payload itself must be reviewed. Author Markdown remains fully diffable.
- 2026-11-25: The pre-rebuild JSON corpus and its one-time migration tools are retired from `main` and retained in the annotated tag `archive-pre-hygiene-2026-11-25`. The website, checks and release gate read only the compiled Markdown interface.
- 2026-11-25: Local agents used long-lived per-agent branches, each in its own workspace. Superseded 2026-11-27: each task uses one short-lived `task/NNN-slug` branch from current `main`, deleted after merge; concurrent tasks use separate clones or working trees. See [project rules](../AGENTS.md).
- 2026-11-24: `knowledge/` Markdown is the sole author source; the compiler produces `data/index/knowledge-v1.json`, and the website, checks, timeline, map and download package consume that interface only.
- 2026-11-21: GitHub Pages is the sole website host. The Pages workflow deploys a verified release build from checked `main`; formal publication still requires the strict release gate, editorial approval and deployment verification.
- 2026-11-18: A review by the implementer's own tooling is a self-review. Superseded 2026-11-26: self-review is sufficient; the owner's merge is the acceptance.
- 2026-11-18: A source is citable when a reader can open the same evidence and see the same sentence: a museum, library, heritage or government page, or a printed catalogue cited by publisher, year and page. An inscription app is a lead, never evidence.
