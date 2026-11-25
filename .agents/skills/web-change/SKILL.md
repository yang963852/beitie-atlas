---
name: web-change
description: Implement a bounded reader-facing change to the Between Steles static site, including knowledge navigation, witness views or map fallback.
---

# Change one web journey

Read the assigned Issue, [project rules](../../../AGENTS.md), [engineering plan](../../../docs/engineering-plan.md) and [design system](../../../docs/design-system.md). Identify the shortest normal reader path that will demonstrate success.

- Follow the existing React, TypeScript and Vite boundaries. [Setup and commands](../../../docs/START-HERE.md) work in a fresh clone without a map key.
- Import only the compiled interface (`data/index/knowledge-v1.json`, exposed through `src/domain/data.ts` and `src/domain/knowledge.ts`). Do not import author Markdown, the retired legacy JSON corpus, or the retired journey JSON. If a field is missing, change the schema and compiler with the record, not the page alone.
- For work or person navigation test a direct URL, refresh, keyboard use and browser Back. Preserve existing object permalinks. A work can be read without witnesses, coordinates or a portrait; a work with witnesses should let the reader select one and see only that witness's events.
- Run `npm run knowledge:compile` after a data change and `npm run check`. For changed layouts inspect 390, 768 and 1440 CSS px and 200% zoom. Exercise missing data, reduced motion, map failure and an absent key when they affect the path.

Hand off a PR with the reader path, actual checks and limitations. Keep local evidence inside the project and name the person who decides the merge.
