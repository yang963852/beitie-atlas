# Independent review — task 001

Reviewer: Codex. Date: 2026-11-17. Reviewed commit: `2a24ec9` (implementation `4782855`).

**Outcome: changes required.** The foundation is useful and preserves object identity. Local checks pass; live map behavior, independent editorial approval, and public-network acceptance remain incomplete. The application's visual direction has now been specified separately by the owner.

## Verified in this review

- Reran `npm.cmd run check`: type check, data validation, all 36 tests in five files, and Vite production build passed on Node 24.16.0 / PowerShell 7.6.9.
- Inspected implementation, domain validation, map adapter, record grouping, task delivery, and existing desktop screenshot. The screenshot is WorkBuddy's prior evidence; this review did not conduct a fresh live browser interaction pass.
- Reproduced R1 with both release variables set: `check:data` returned 1 and identified three drafts, while `build` returned 0 and emitted the bundle. Environment variables were removed after the probe; the default preview build was restored.
- No live map key, external deployment, mainland device test, or overseas test was performed. Source references being structurally valid does not certify historical claims.

## Required findings

### R1 — P1: production build bypasses the data release gate

Location: `package.json` scripts (`build`), `src/domain/data.ts` release flag, and `src/App.tsx` validation alert.

Even with both `RELEASE_MODE=1` and `VITE_RELEASE_MODE=1`, `npm run build` succeeds on the known draft records: it runs TypeScript and Vite but not the data validator. Browser validation shows an alert and continues rendering the same corpus. A user following the documented production build can publish drafts despite selecting strict mode.

Provide one explicit cross-platform release command which forces strict validation before emitting a deployable artifact, fails nonzero on drafts or invalid data, and cannot accidentally reuse stale preview output as a release. Keep a distinct preview build allowing drafts. Test both paths and document the only permitted production publishing command.

### R2 — P2: map retry reuses an already failed script

Location: `src/map/tianditu.ts`, lines 87–108.

After a script error, `sdkPromise` is reset but the failed script remains in the DOM. Retry finds it, adds listeners, and skips setting/appending a new script. No fresh network request occurs; the next attempt waits until timeout. This is established by control-flow inspection, not a live provider test.

Clean up failed script nodes, listeners, and timers; make retry genuinely create a fresh attempt and prevent late callbacks from a previous attempt altering the next promise. Test error→retry success, timeout→retry success, concurrent callers, and unmount during load using a mocked SDK. Live provider verification is still separate.

### R3 — P2: last-known locations are grouped as current collections

Location: `src/domain/data.ts`, `getObjectsForPlace` and `groupByPlace` (lines 85–104); `src/map/markers.ts` consumes these groups.

Only `unknown` is excluded, so a record with `locationKind: 'last-known'` and a place ID gets an ordinary collection marker. The current two records do not trigger this, but it violates the model as soon as a last-known object is added. Use a shared explicit predicate for current collection/in-situ markers; keep other objects readable with their correct labels. Test current, last-known, unknown, and missing coordinates.

### R4 — P2: search does not filter the map, and section links erase selection

Location: `src/App.tsx`, lines 40–41 and toolbar links; `src/components/MapPanel.tsx` active-object lookup.

Search filters `ResultsList`, but map markers and `MapPanel` still receive all objects. Searching for the rubbing leaves the stone's institution in the location panel. The map's popover also uses a global unfiltered lookup. Make results, markers, counts, and popovers derive from a consistent selection of records.

The toolbar's `#results`, `#map`, and `#detail` anchors share the same hash used by `#/object/...` routing. Selecting the rubbing then following a section link clears the parsed ID and resets detail to the first object. Keep section navigation from overwriting object state. Add interaction regression tests, including Back and refreshed deep links.

### R5 — P2: identity mapping is described as a verified coordinate conversion

Location: `src/map/tianditu.ts`, lines 50–63; `docs/map-pilot.md`, coordinate explanation.

`toProviderCoordinate` returns the original numbers and labels the frame CGCS2000, while comments describe explicit conversion with centimetric differences. No transformation parameters, epoch, or evidence supports that precision claim. A coarse-display approximation may be acceptable if supported, but must be described as an approximation with its basis and limits. Verify provider requirements, retain original CRS, and document the chosen treatment honestly; do not manufacture a mathematical transform or infer accuracy from decimal places.

### R6 — P2: map-key setup points to a missing section

Location: `docs/map-pilot.md`, section 4.

It directs the beginner to `docs/delivery-001.md` section “开启地图（需要你做一步）”, which does not exist. Supply a real beginner-facing setup page covering account/key type, local configuration, domain restrictions, rebuilding, and what to return for review. Label console steps that still need verification.

## Design follow-up

The supplied screenshot shows dense metadata, repeated source blocks, many small labels, and developer setup instructions in the main map panel. Apply the new `docs/design-system.md` in task 003. Preserve uncertainty and source access while moving technical diagnostics into documentation. This is a new owner direction, not retroactive failure to follow task 001's original visual brief.

## Acceptance after fixes

Deliver R1–R6 in task 002 with targeted evidence and the full check result. Do not mark M0 complete merely because these fixes pass. A real provider map, verified placement basis, and mainland test deployment remain separate outstanding gates.
