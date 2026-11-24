# Task 042 · Extend the reading-room setting to the whole frontend

- **Outcome:** The atlas, chronology, collection map, reading card, transmission page, contribution form, error and empty states and the opening desk now share the knowledge library's paper, ink and vermilion-seal language. The opening 3D scene keeps its camera path, brush, hand, ink spread and timing; only its colour, lighting, tone mapping and page chrome are refined.
- **Base revision:** `1d08a33` (`main`, 2026-11-25, after the task 041 classics selection).
- **Scope:** Global tokens and the atlas reading-room layer in `src/styles.css`; `atlas-timeline.css`; `opening-desk.css`; colour, fog, light and tone-mapping values in `classroom-scene.ts`, `classroom-hand.ts`, `classroom-textures.ts`; the InkRiver shader colours; the seal marks in `App.tsx`, `AtlasTimeline.tsx` and `OpeningDesk.tsx`; `index.html` theme colour.
- **Core preservation:** No change to the camera path, scene graph, geometry, brush or hand animation, ink-spread timing, reduced-motion branch, map provider adapter, data boundary, compiler, interface or editorial records.
- **Non-goals:** Dark mode, downloaded fonts, new dependencies, post-processing passes, changing the Tianditu SDK marker icon, or inventing decorative seals with editorial wording.
- **Evidence:** 1440 / 768 / 390 screenshots for the opening, timeline, workspace, collections, folio, contribution and library; a 720 CSS px / 2× zoom equivalent; English locale; reduced-motion opening. See [delivery 042](../docs/delivery-042.md).
- **Checks:** `npm.cmd run check`; all 156 tests; no page errors; no horizontal overflow; keyboard focus, search empty state, sticky masthead and missing-map-key fallback exercised.
- **Review:** Implementer self-review; [PR #46](https://github.com/yang963852/beitie-atlas/pull/46). Merged on the coordinator's instruction and deployed as the labelled preview at `3780043`.
