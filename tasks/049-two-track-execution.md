# Task 049 | Set the two-track plan and audit the foundation

Base revision: `eccc9b5` (`trae/work`, same as `origin/main`, 2026-11-25).

## Outcome

The project has one written charter for the development and knowledge workstreams, a grounded review of what the current data model can and cannot carry for learning content, a work-page information architecture with testable acceptance criteria, and a public-repository hygiene finding list. The coordinator can approve or reject each proposal without reading the whole corpus.

## Scope

- Add `docs/project-plan.md`: two workstreams, D1–D5 / K1–K6, boundaries, cadence, risks.
- Add `docs/learning-interface.md` (D-001, D-002): interface audit and a proposal for guide sections, topics, paths and media. No schema, compiler or component change.
- Add `docs/work-page-redesign.md` (D-003): information architecture, empty states, acceptance criteria, staged delivery.
- Add `docs/repository-audit.md` (D-004): tracked-file scan, rights drift and maintenance findings.
- Correct `NOTICE.md`: remove the false statement that the interface carries no media records.
- Record the milestone on the iteration board.
- Do not change `knowledge/`, `src/`, `scripts/`, the compiled interface or the release gate. Do not touch the river and design-system edits owned by the concurrent reader-interface task.

## Evidence

- Compiled interface on this revision: 117 works, 126 objects, 184 sources, 46 places, 1 media record; 36 works and 34 objects reviewed; 4 guides, none reviewed.
- `readGuide` in `scripts/lib/knowledge-schema.ts` reads a single `## 导读` section, so a seven-part guide cannot be addressed section by section today.
- `MediaItem.objectId` is required and media renders only in `AtlasTimeline`; there is no image viewer or work-level image.
- `matchesQuery` in `src/domain/library.ts` is a substring search with no script or period facet.
- `NOTICE.md` said the interface carries no media records while `data/index/knowledge-v1.json` contains one.

## Acceptance

- Every new document names the data or code it relies on and separates verified facts from proposals.
- The audit lists severity, evidence (file and line) and a recommendation for each finding; no finding is presented as fixed unless it was fixed in this task.
- The work-page document gives observable acceptance criteria, including 390/768/1440, 200% zoom, keyboard access and the four empty states.
- `npm.cmd run check` passes; `npm.cmd run check:docs` accepts the board row and the evidence links.
- No reader-facing content, generated page or knowledge record changes.

## Handoff

Self-reviewed PR to `main`; the coordinator decides acceptance. The interface proposal needs a separate implementation task before any schema or compiler change. The WorkBuddy knowledge line continues on `workbuddy/work` and is not part of this PR.
