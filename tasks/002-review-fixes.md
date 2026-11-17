# Task 002 — Close foundation review findings

Role: WorkBuddy/DeepSeek implements; Codex independently reviews. Communicate with the owner in Chinese.

Read `AGENTS.md`, `CONTRIBUTING.md`, `docs/review-001.md`, `docs/engineering-plan.md`, and `docs/iteration-board.md` first. Inspect current changes; preserve Codex's newly added governance documents. Do not discard them or overwrite prior delivery evidence.

## Goal

Fix R1–R6 in review-001.md while preserving the existing foundation. Do not redesign the interface or expand the corpus in this task.

## Required outcomes

1. A documented cross-platform strict release command rejects drafts/invalid data before producing a publishable release. Preview builds still work. Failed release attempts must not leave a stale artifact eligible for publication. Do not relabel records reviewed merely to get a green release build.
2. SDK retry actually creates a fresh loading attempt, with bounded cleanup of timers/listeners/script nodes and safe concurrency/late callbacks.
3. Current map markers exclude last-known/unknown location claims while all records remain accessible in the list.
4. Search results, map points/counts, and popover records agree. Section navigation preserves the selected object, including the rubbing, and does not break deep links or browser Back.
5. Coordinate handling accurately describes what is implemented; provide primary-source rationale for any approximation. Remove unsupported centimetric/accuracy assertions. Retain original coordinate provenance.
6. A real owner-facing map setup guide replaces the dead section reference. The owner should be able to tell which account action is needed without understanding code. Do not request secrets in chat.

## Verification

Add focused regression tests for R1–R4. Run `npm.cmd run check`. Demonstrate strict release rejection using the existing drafts, plus a positive release-gate test using a separate controlled fixture (never falsely approve production data). Exercise section navigation/search/deep-link behavior. Report mocked and live provider checks separately. Record any official provider sources consulted for R5/R6 and uncertainty.

Update the board to delivered and write `docs/delivery-002.md` with the exact revision, changed files, actual outcomes, outstanding map-account requirements, and run instructions. Keep prior reports intact. No public deployment, new backend, dependency overhaul, or visual restyling is needed to finish this task.
