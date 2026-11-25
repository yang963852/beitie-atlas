# Iteration board

Updated: 2026-11-25. This board tracks current milestones. Independent contributions are coordinated in GitHub Issues and pull requests.

**Milestones 001–039** are not listed here. Their task cards, delivery reports, reviews, migration baseline and research records are retained in the annotated tag [archive-pre-hygiene-2026-11-25](https://github.com/yang963852/beitie-atlas/tree/archive-pre-hygiene-2026-11-25). See [the archive index](archive.md).

| Task | Outcome | State | Exit evidence |
| --- | --- | --- | --- |
| 040 | Reading-room styling for the knowledge library | Delivered — self-reviewed; merged in [PR #43](https://github.com/yang963852/beitie-atlas/pull/43) on the coordinator's instruction and preview deployed | Warm paper, Song/Kai typography and ruled catalogue shelves scoped to the library; 390/768/1440 and 200% zoom evidence; live preview at `b896b5a`. See [task 040](../tasks/040-library-reading-style.md) and [delivery 040](delivery-040.md). |
| 041 | Add a chronologically ordered classics selection | Delivered — local checks pass; 11 new records remain drafts; deployment recorded below | 98 works / 107 objects / 38 places / 160 sources; five empty periods reduced to two (Liao, Jin); 390/768/1440 screenshots; see [task 041](../tasks/041-classics-selection.md), [delivery 041](delivery-041.md) and the [selection report](research/classics-selection-2026-11.md). |
| 042 | Extend the reading-room setting to the whole frontend | Delivered — merged in [PR #46](https://github.com/yang963852/beitie-atlas/pull/46) at `3780043` and preview deployed; post-deployment map-pin refinement included | Paper, ink and seal across the atlas, timeline, collection map, reading card, contribution form and opening desk; 3D camera, brush and timing unchanged; live preview checked at 1440; 390/768/1440 and 200% evidence; see [task 042](../tasks/042-reading-room-project.md) and [delivery 042](delivery-042.md). |
| 043 | Add bronze inscriptions and bamboo slips | Delivered — merged in [PR #49](https://github.com/yang963852/beitie-atlas/pull/49) at `19d3550` and preview deployed; 10 new records remain drafts | 108 works / 117 objects / 45 places / 171 sources; five bronze inscriptions and five slip manuscripts; `bronze-vessel` object type; 156 tests; live preview shows 108 works and the bronze page. See [task 043](../tasks/043-bronze-and-slips.md), [delivery 043](delivery-043.md) and the [selection report](research/bronze-and-slips-2026-11.md). |
| 044 | Unify the catalogue entries and set the river in motion | Delivered — merged in [PR #48](https://github.com/yang963852/beitie-atlas/pull/48) at `9cce99e` and preview deployed; live checked | One masthead and section nav for 知识库, 历史脉络 and 馆藏地图; 年代长河 renamed 历史脉络; 108 name-only paper slips; continuously flowing sepia river with reduced-motion and fallback; header geometry, card size and animation frames verified locally and on the live preview; see [task 044](../tasks/044-unified-reader-river.md) and [delivery 044](delivery-044.md). |
| 045 | Retire the legacy corpus and trim the repository | Delivered — self-reviewed; awaiting coordinator merge and acceptance | Archive tag `archive-pre-hygiene-2026-11-25` pushed; legacy JSON and migration tools removed; 001–039 evidence moved out of `main`; `trae/work` and `workbuddy/work` created. See [task 045](../tasks/045-repository-hygiene.md) and [delivery 045](delivery-045.md). |
| 046 | Record the nine Two Wangs classics batch | Delivered — merged in [PR #53](https://github.com/yang963852/beitie-atlas/pull/53) at `ab57852`; coordinator acceptance pending | 117 works / 126 objects / 46 places / 184 sources; nine new works and nine witnesses (drafts), one 王献之 person record, thirteen sources and one place; PR CI check succeeded; 44 `DATE_WITHOUT_ORIGINAL` warnings and one unused source remain. See [task 046](../tasks/046-two-wangs-classics.md) and [delivery 046](delivery-046.md). |

## Iteration loop

Ready → in progress → delivered → reviewed → fixing (if necessary) → accepted.

Each assignment specifies its scope, evidence and observable acceptance. A routine change records verification in the PR. A milestone also has a delivery report here. A different reviewer or the coordinator decides acceptance. Record local engineering, editorial approval, live provider behavior and observed public reachability separately.

The state column opens with one canonical keyword — `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted`, `Superseded` — followed by an em dash and any detail. `npm run check:docs` enforces that vocabulary, requires every task file and delivery report to have a row, and rejects evidence links that do not resolve. Prose after the dash is free text; the keyword is not.

P1: material correctness/release blocker. P2: fix within its assigned iteration. P3: optional polish. Fix demonstrated risks first; do not postpone usable improvements for stylistic perfection. No automatic infinite review loop: new requests enter the backlog unless they affect current acceptance.

Before a new iteration record its base revision; after acceptance record its accepted commit. Do not overwrite evidence from previous rounds. Roll back by selecting a known accepted revision or reverting the specific change, never by deleting unexplained work. Milestone evidence may be retired from `main` only after an annotated `archive-*` tag is pushed.

## Decisions

- 2026-11-25: The pre-rebuild JSON corpus and its one-time migration tools are retired from `main` and retained in the annotated tag `archive-pre-hygiene-2026-11-25`. The website, checks and release gate read only the compiled Markdown interface.
- 2026-11-25: Local agents use long-lived branches `trae/work` and `workbuddy/work`, each in its own workspace. Each task opens a PR to `main`; the coordinator merges and the branches are synchronized afterwards. See [the local agent workflow](agent-workflow.zh-CN.md).
- 2026-11-24: `knowledge/` Markdown is the sole author source; the compiler produces `data/index/knowledge-v1.json`, and the website, checks, timeline, map and download package consume that interface only.
- 2026-11-21: GitHub Pages is the sole website host. The Pages workflow deploys a labelled preview from checked `main`; formal publication still requires the strict release gate, editorial approval and deployment verification.
- 2026-11-18: A review by the implementer's own tooling is a self-review. It may clear findings, but acceptance requires an independent reviewer or the owner's decision at merge.
- 2026-11-18: A source is citable when a reader can open the same evidence and see the same sentence: a museum, library, heritage or government page, or a printed catalogue cited by publisher, year and page. An inscription app is a lead, never evidence.
