# Iteration board

Updated: 2026-11-17. One active implementation task at a time.

| Task | Outcome | State | Exit evidence |
| --- | --- | --- | --- |
| 001 | Foundation preview | Changes required; local checks pass | See review-001.md; live map and public-network verification pending |
| 002 | Close review defects and establish release gate | Delivered 2026-11-17 — awaiting review | 61 tests in 7 files; `npm run release` rejects 3 drafts and removes `dist/`; isolated reviewed-copy run exits 0 with a verified release artifact; `docs/delivery-002.md` |
| 003 | Apple-inspired visual hierarchy and usability | Queued after 002 | Responsive screenshots, keyboard/zoom checks, no loss of core functions |
| 004 | Real map and network pilot | Pending owner key and test host | Actual provider markers, recovery, attribution, mainland desktop/mobile results |
| 005 | Three reviewed physical objects | Queued | Sources reviewed, coordinate basis checked, missing data handled |
| 006 | First public corpus and release | Queued | Rights, contribution docs, strict release checks, host tests, rollback revision |

## Iteration loop

Ready → in progress → delivered → reviewed → fixing (if necessary) → accepted.

Each task specifies goal, allowed scope, exclusions, input evidence, and observable acceptance. The implementer writes a delivery report; Codex writes the independent outcome. Record blocked portions separately and continue independent work. Local engineering, editorial approval, live provider behavior, and public network access are four distinct gates.

P1: material correctness/release blocker. P2: fix within its assigned iteration. P3: optional polish. Fix demonstrated risks first; do not postpone usable improvements for stylistic perfection. No automatic infinite review loop: new requests enter the backlog unless they affect current acceptance.

Before a new iteration record its base revision; after acceptance record its accepted commit. Do not overwrite evidence from previous rounds. Roll back by selecting a known accepted revision or reverting the specific change, never by deleting unexplained work.

## Decisions

- 2026-11-17: English implementation, Chinese original titles; mainland-first; steles plus selected rubbings.
- 2026-11-17: Owner requests Apple-inspired simplicity. Adopt design-system.md; implementation in task 003.
- 2026-11-17: Keep existing framework and npm; use lightweight rules and CI rather than adding formatting/lint frameworks during review.
- 2026-11-17: PowerShell 7 supported. Reviewer ran in PowerShell 7.6.9 provided by the Codex runtime; this does not verify the owner's separately installed executable.
- 2026-11-17: Publishing command is `npm run release`; `npm run build` stays preview-only. Release artifacts carry a `beitie-build-mode=release` meta tag and a counts manifest, and a failed release deletes `dist/`.
- 2026-11-17: Current map points require a `collection-institution` or `in-situ` assertion. `last-known` and `unknown` records remain readable but are never plotted as current markers.
- 2026-11-17: No datum transformation is applied to coordinates. The stored WGS84 values pass through unchanged; `docs/map-pilot.md` §3 records what official sources establish and what remains unresolved.
