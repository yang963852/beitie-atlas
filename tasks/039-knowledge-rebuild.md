# Task 039 · Markdown knowledge base rebuild

- **Outcome:** A reader starts from a work, sees its surviving objects, and follows the selected object's dated events, places and sources. Contributors maintain one Markdown file per stable ID; the website, checks, timeline, map and download package read one versioned interface.
- **Base revision:** `c9aa45a` (`main`, 2026-11-24).
- **Scope:** `knowledge/` author records, compiler and generated interface, five worked examples, work/person reading, full migration, download package, documentation and tests. Old JSON under `data/` is frozen as the migration baseline.
- **Non-goals:** New historical claims without sources; a backend, database or third-party CMS; changing the React/Vite/GitHub Pages boundary; formal publication approval.
- **Cards:** A baseline, B compiler, C five examples, D reading, E migration and download, F switch and delivery. Editable scopes and acceptance cases are in [the execution plan](../docs/knowledge-rebuild.md).
- **Evidence:** [ADR-004](../docs/engineering-plan.md#架构决策记录adr), [legacy inventory](../docs/baseline/inventory-2026-11-24.md), [parity report](../docs/baseline/migration-parity-2026-11-24.md).
- **Checks:** `npm.cmd run check`; `npm.cmd run knowledge:compile`; `npm.cmd run check:isolation`; `npm.cmd run check:release` (expected to reject drafts); browser paths at 390, 768 and 1440 CSS px.
- **Review:** Independent editorial review of the five examples; coordinator decides acceptance and merge.
