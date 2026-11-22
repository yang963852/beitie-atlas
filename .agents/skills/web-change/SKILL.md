---
name: web-change
description: Implement a bounded reader-facing change to the Between Steles static site, including knowledge navigation, witness views or map fallback.
---

# Change one web journey

Read the assigned Issue, [project rules](../../../AGENTS.md), [engineering plan](../../../docs/engineering-plan.md) and [design system](../../../docs/design-system.md). Identify the shortest normal reader path that will demonstrate success.

- Follow the existing React, TypeScript and Vite boundaries. [Setup and commands](../../../docs/START-HERE.md) work in a fresh clone without a map key.
- Identify the editable source. Keep authored library prose in Markdown. A data-contract change may affect browser loading, CLI validation, generated article projections, the strict publication gate and artifact counts. Inspect each relevant consumer.
- For work or person navigation test a direct URL, refresh, keyboard use and browser Back. Preserve existing object permalinks. A work can be read without witnesses, coordinates or a portrait.
- Run `npm run check`. For changed layouts inspect 390, 768 and 1440 CSS px and 200% zoom. Exercise missing data, reduced motion, map failure and an absent key when they affect the path.

Hand off a PR with the reader path, actual checks and limitations. Keep local evidence inside the project and name the person who decides the merge.
