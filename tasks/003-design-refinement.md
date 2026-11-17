# Task 003 — Refine the visual hierarchy

Start after task 002 is accepted. Read AGENTS.md and docs/design-system.md. This task implements the owner's Apple-inspired direction for the existing application; no full rewrite or new visual framework is needed.

## Deliver

- Shared design tokens for neutral surfaces, type, spacing, borders, controls, and states.
- Map-led desktop layout, readable detail view, and a mobile Map/List/detail flow preserving search and selection.
- Concise visible artifact identity, collection and uncertainty; progressive disclosure for full citations and coordinate/editorial details.
- Simple user-facing map failure/retry states; move implementation instructions and diagnostics out of the reader experience.
- Complete existing search, selection, sources, provenance, sharing, and no-map fallback behavior. Do not sacrifice functionality to reduce visible clutter.

## Acceptance

Compare actual before/after views at 390/768/1440 CSS px. Verify keyboard navigation and visible focus, 200% zoom, contrast, long bilingual names, no results, missing information, and provider failure. All existing functional checks pass; add tests only for changed interaction risks. No phantom map screenshot or fabricated editorial approval.

Write docs/delivery-003.md and update the board. Codex reviews the working UI and evidence; final visual taste is the owner's decision. Keep dark mode, glass effects, custom icons, and animation expansion outside this iteration.
