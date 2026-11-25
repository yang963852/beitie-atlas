# Task 043 · Unify the catalogue entries and set the river in motion

- **Outcome:** 知识库, 历史脉络 and 馆藏地图 now share one masthead and section nav; only the content below the nav differs. 年代长河 is renamed 历史脉络. The timeline cards are compact paper slips showing only the work name, and the sepia river now drifts continuously with moving bands and bank highlights.
- **Base revision:** `0fc8b85` (`main`, 2026-11-25). Branch `feat/043-unified-library-river`.
- **Scope:** New shared `ReaderHeader`; `App.tsx`, `AtlasTimeline.tsx`, `KnowledgeLibrary.tsx`; `knowledge-library.css`, `atlas-timeline.css`; `InkRiver.tsx` shader; the affected timeline test; the design-system note.
- **Core preservation:** No change to the camera, opening scene, map adapter, data, compiler or interface. The river still stops under reduced motion and keeps its static CSS fallback.
- **Non-goals:** Changing the English section label, editorial records, card dates in the reading card, or the map cartography.
- **Evidence:** Shared masthead/nav measurements, 1440 / 768 / 390 screenshots, English screenshots, animation frame comparison, reduced-motion comparison. See [delivery 043](../docs/delivery-043.md).
- **Checks:** `npm.cmd run check`; all tests; no page errors or horizontal overflow; header geometry identical across the three entries.
- **Review:** Implementer self-review; [PR #48](https://github.com/yang963852/beitie-atlas/pull/48). The coordinator decides acceptance and the merge/deployment instruction.
