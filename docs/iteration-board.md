# Iteration board

Updated: 2026-11-26. This board tracks the active milestone. Independent contributions are coordinated in GitHub Issues and pull requests.

**Archived milestones:** 001–039 are in the annotated tag `archive-pre-hygiene-2026-11-25`; 040–051 and the completed plans, proposals and audit are in `archive-milestones-040-051-2026-11-26`. See [the archive index](archive.md).

| Task | Outcome | State | Exit evidence |
| --- | --- | --- | --- |
| 052 | Slim the repository and archive milestones 040–051 | In progress | See [task 052](../tasks/052-repository-slimming.md) and [delivery 052](delivery-052.md); archive tag `archive-milestones-040-051-2026-11-26` |

## Iteration loop

Ready → in progress → delivered → reviewed → fixing (if necessary) → accepted.

`main` keeps only the active milestone. Each assignment specifies its scope, evidence and observable acceptance. A routine change records verification in the PR. A milestone also has a delivery report while it is active; after acceptance the task card, delivery report and UI screenshots move to an annotated `archive-*` tag and are removed from `main`. A different reviewer or the coordinator decides acceptance.

The state column opens with one canonical keyword — `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted`, `Superseded` — followed by an em dash and any detail. `npm run check:docs` enforces that vocabulary, requires every task file and delivery report in `main` to have a row, and rejects evidence links that do not resolve. Prose after the dash is free text; the keyword is not.

P1: material correctness/release blocker. P2: fix within its assigned iteration. P3: optional polish. Fix demonstrated risks first; do not postpone usable improvements for stylistic perfection. No automatic infinite review loop: new requests enter the backlog unless they affect current acceptance.

Before a new iteration record its base revision; after acceptance record its accepted commit. Do not overwrite evidence from previous rounds. Roll back by selecting a known accepted revision or reverting the specific change, never by deleting unexplained work. Milestone evidence moves out of `main` only after an annotated `archive-*` tag is pushed.

## Decisions

- 2026-11-26: `main` keeps current sources, operating documents and the active milestone only. Accepted task cards, delivery reports, screenshots, research and dated plans move to an annotated `archive-*` tag; UI screenshots live in the PR or issue. See [the archive index](archive.md).
- 2026-11-25: 1.1 版发布。117 部作品、126 件实物、8 位书家、2 篇读帖与 1 条人物关系全部转为已审核，面向读者的草稿/已审核标记与预览草稿提示不再显示；发布门槛与草稿阻断能力保留。
- 2026-11-25: Development and knowledge proceed as two workstreams coordinated through the compiled interface. Active work is described in the current task brief or GitHub Issue; dated plans are archived rather than kept as current guidance. New `knowledge/` directories or fields still require compiler and validator support first.
- 2026-11-25: A work guide stays inside its work Markdown as `guide` plus `## 导读`; it is not a separate file under `knowledge/notes/`. Section-level guides need a compiler change, not an author-side workaround.
- 2026-11-25: Generated review artifacts are marked in `.gitattributes`. The compiled interface `data/index/knowledge-v1.json` is excluded from text diffs, and generated catalogue pages plus `knowledge/README.md` are marked `linguist-generated`; use `git diff --text` when the generated payload itself must be reviewed. Author Markdown remains fully diffable.
- 2026-11-25: The pre-rebuild JSON corpus and its one-time migration tools are retired from `main` and retained in the annotated tag `archive-pre-hygiene-2026-11-25`. The website, checks and release gate read only the compiled Markdown interface.
- 2026-11-25: Local agents use long-lived branches `trae/work` and `workbuddy/work`, each in its own workspace. Each task opens a PR to `main`; the coordinator merges and the branches are synchronized afterwards.
- 2026-11-24: `knowledge/` Markdown is the sole author source; the compiler produces `data/index/knowledge-v1.json`, and the website, checks, timeline, map and download package consume that interface only.
- 2026-11-21: GitHub Pages is the sole website host. The Pages workflow deploys a verified release build from checked `main`; formal publication still requires the strict release gate, editorial approval and deployment verification.
- 2026-11-18: A review by the implementer's own tooling is a self-review. It may clear findings, but acceptance requires an independent reviewer or the owner's decision at merge.
- 2026-11-18: A source is citable when a reader can open the same evidence and see the same sentence: a museum, library, heritage or government page, or a printed catalogue cited by publisher, year and page. An inscription app is a lead, never evidence.
