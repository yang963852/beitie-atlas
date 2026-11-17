# Delivery report

Task ID: 002 — Close foundation review findings
Date: 2026-11-17
Implementation branch and commit, if any: `task/002-review-fixes`, based on `2a24ec9`.
Governance import `fe9d70f`; implementation `676d844`; focus assertion `3149a39`.

## Result

R1–R6 from `docs/review-001.md` are implemented. The interface was not redesigned, the corpus
was not expanded, and no record was marked `reviewed`.

**Implemented and verified locally**

- `npm run release` is now the only publishable build. It deletes any previous `dist/`, runs
  the strict data gate before a bundle exists, type-checks, builds with a release marker,
  writes `dist/release-manifest.json`, and verifies the artifact. A failure at any step removes
  `dist/` and exits non-zero. `npm run build` remains a clearly labelled preview build.
- SDK loading retries from a clean state: a failed or timed-out attempt removes its script,
  listeners, and timer, and a late callback cannot settle a newer attempt. Unmounting during
  loading never creates a map.
- Only `collection-institution` and `in-situ` assertions can become current map points.
  `last-known`, `unknown`, missing-place, and point-less records remain readable and labelled;
  none is plotted as a present-day collection marker.
- Search, markers, place rows, counts, and the map popover all derive from one filtered list.
  Section navigation moves focus without touching the object hash; Back and deep links still
  work.
- Coordinate handling no longer claims a datum transformation. The stored WGS84 values pass
  through unchanged, and `docs/map-pilot.md` §3 records the official sources, the epoch issue,
  and the limits.
- `docs/map-setup.md` is a real beginner-facing owner guide; the dead reference is gone and
  unverified console steps are labelled.

**Verified but not live**

- All provider behaviour above was exercised against a mocked SDK. No live Tianditu key exists,
  so no tile, marker, quota, or provider error page has been seen.
- No deployment, mainland test, or overseas test was run.

**Still pending**

- Owner map account and key (optional; see `docs/map-setup.md`).
- Editorial review of the three draft records. Until then `npm run release` must fail.
- A real provider pilot, mainland network tests, and the visual work in task 003.

## Changed files

| Area | Files | Purpose |
| --- | --- | --- |
| Release gate | `scripts/release.ts`, `scripts/lib/release-gate.ts`, `scripts/lib/dataset.ts`, `scripts/check-data.ts` | One strict command; shared disk loader; artifact verification; preview check unchanged in behaviour |
| Build config | `package.json`, `vite.config.ts` | `release` / `check:release` scripts; `beitie-build-mode` meta tag |
| Location rule | `src/domain/collection.ts`, `src/domain/data.ts`, `src/map/markers.ts` | One predicate for current points; partition for the list and popover |
| Map loading | `src/map/tianditu.ts`, `src/map/types.ts` | Clean retry, late-callback guard, injectable loader for tests, honest coordinate pass-through |
| Navigation and search | `src/App.tsx`, `src/components/MapPanel.tsx`, `src/i18n/en.ts` | Filtered markers/popovers; section focus without hash writes; new labels |
| Build mode | `src/domain/build.ts`, `src/domain/data.ts` | Runtime release detection from the artifact meta tag |
| Tests | `tests/map-sdk.test.ts`, `tests/release-gate.test.ts`, `tests/map-markers.test.ts`, `tests/app.test.tsx` | Focused regressions for R1–R4 |
| Documentation | `docs/map-setup.md`, `docs/release.md`, `docs/map-pilot.md`, `README.md` | Owner setup, release runbook, coordinate sources |
| Governance updates | `docs/iteration-board.md`, `CONTRIBUTING.md`, `.github/workflows/check.yml` | Task 002 row and decisions; stale “strict command required” sentence replaced; CI comment points at the runbook. Codex's review, design-system, and task documents are otherwise unchanged |
| Evidence | `docs/screenshots/002-*.png` | 390, 768, 1440 inspection, plus a 720 CSS px approximation of 200% zoom |

## Run and inspect

Exact setup/start commands and preview address:

```bash
npm ci
npm run dev                 # development server
npm run build && npm run preview   # preview build at http://127.0.0.1:4173/
npm run check               # type check + preview data check + 61 tests + preview build
npm run check:release       # strict gate only; exits 1 while drafts exist
npm run release             # the only publishable build; currently exits 1 by design
```

Local preview used for the screenshots: **http://127.0.0.1:4173/** (Vite preview,
127.0.0.1:4173). It serves a preview build, not a release artifact.

Required non-secret configuration:

- None for preview.
- Optional map key: create `.env.local` with `VITE_TIANDITU_KEY=<browser key>`, then rebuild.
  The key is public after bundling. Steps: `docs/map-setup.md`.

## Verification evidence

Environment: Windows, Node v22.22.2, npm 10.9.7, Chrome via Playwright 1.56.0.

| Check | Result: passed / failed / not run | Evidence or limitation |
| --- | --- | --- |
| Type check | passed | `tsc --noEmit`, no diagnostics |
| Data validation | passed | Preview: 1 work, 2 objects, 5 places, 4 sources, 4 events, 0 media, 0 errors. Strict: 0 structural errors and 3 `DRAFT_IN_RELEASE` errors (expected) |
| Production build | passed | Vite 7.3.8: JS 275.82 kB (gzip 86.31 kB), CSS 11.79 kB. Preview artifact carries `content="preview"` |
| Object identity and source review | passed (no data change) | The 6 seed-record tests still pass; no review state, date, coordinate, or source was edited |
| Browser interaction | passed locally | 61 tests in 7 files, including search/map agreement, section focus, Back, and deep-link refresh. Screenshots inspected at 390 / 768 / 1440 |
| Mainland desktop access | not run | No deployment; a localhost preview cannot prove public access |
| Mainland mobile access | not run | Same; only a local 390 px rendering was inspected |
| Overseas access | not run | No deployment |
| Map failure fallback | passed with a mocked SDK / not run live | Error, retry, timeout, concurrency, and unmount are covered by tests. The unconfigured panel was inspected in Chrome. No provider request was possible |

### Finding-by-finding evidence

| Finding | Evidence |
| --- | --- |
| R1 release gate | `npm run release` exited 1 with `DRAFT_IN_RELEASE` for `yan-qinli-bei`, `dpm-rubbing-xin00045406`, `yan-qinli-original-stele`; `dist/` was absent afterwards. `npm run check:release` also exited 1. Unit tests cover a reviewed fixture passing, a draft failing, a broken reference failing, a preview-marked artifact failing, a count mismatch failing, and stale-output removal. The full success path was executed end-to-end in a temporary copy where the three records were marked reviewed **only in that copy**: exit 0, `content="release"`, manifest counts 1/2/5/4/0/4. The real corpus was not modified |
| R2 SDK retry | 5 loader tests (error→retry, timeout→retry, late callback ignored, concurrent callers share one request, no second request when `window.T` exists) and 2 adapter tests (marker click mapping, unmount during load). Mocked SDK only |
| R3 location semantics | 9 tests in `tests/map-markers.test.ts`: current and in-situ produce a marker; last-known, unknown, missing place, and missing coordinates do not; each stays in a labelled group |
| R4 search and navigation | 10 app tests: filtering leaves only the matching place and count; no-result state clears the detail and place rows; section link keeps the hash and moves focus; a section hash cannot erase the selection; Back restores the previous default; deep-link refresh still works |
| R5 coordinate wording | `toProviderPosition` returns the input unchanged; comments, UI copy, and `docs/map-pilot.md` §3 no longer claim a conversion. Sources consulted: national catalogue entry (CGCS2000), official JS API class reference (EPSG:900913 / EPSG:4326), Shenzhen planning bureau explainer (ITRF97 at 2000.0), UNOOSA CTRF2000 template (zero translation/rotation/scale to ITRF1997), and a secondary geodesy review for the epoch order of magnitude. The class page is script-rendered, so its property text came from the official page's search description, not a rendered read |
| R6 setup guide | `docs/map-setup.md` covers account/key type, `.env.local`, rebuild, domain restrictions, what to report, and five explicitly unverified console details. `docs/map-pilot.md` §5 links to it; the UI unconfigured message points there too |

### Visual inspection

- `docs/screenshots/002-desktop-1440.png`: three columns, no clipping; map panel and location
  rows intact.
- `docs/screenshots/002-tablet-768.png`: single column at 768 (records → detail → map), no
  overlap. Three-column-to-sheet layout remains task 003 work.
- `docs/screenshots/002-mobile-390.png`: full page, no horizontal overflow; long Chinese and
  English titles wrap.
- `docs/screenshots/002-zoom-200-equivalent.png`: 720 CSS px wide, the CSS width a 1440 px
  window has at 200% zoom. This is an approximation, not a real browser-zoom run.

## Known issues and decisions

1. **No live map.** No key, no live tiles, no marker placement check. `docs/map-setup.md` lists
   what the owner must do and what to report back. A mocked SDK cannot prove the provider works.
2. **Coordinates remain unverified secondary data.** Both institution points come from Wikidata
   P625 without a cited reference; the epoch is unknown. No datum transformation is applied and
   none is claimed. The marker is indicative. `docs/map-pilot.md` §3 explains why “centimetres”
   would be an unsupported claim.
3. **Release is intentionally blocked.** Three records are drafts. Marking them reviewed to get
   a green build would defeat the gate; editorial review is a separate gate.
4. **A failed release deletes `dist/`.** This is deliberate: it guarantees no stale preview or
   older artifact can be uploaded after a failed attempt. Rollback is by accepted revision, not
   by keeping the old directory.
5. **Preview build vs release build.** `npm run build` is documented as preview-only. CI runs
   preview checks and never publishes. Only `npm run release` produces the marked artifact.
6. **Keyboard and zoom.** Link activation and focus movement are asserted in jsdom, but a
   real keyboard-only traversal and a real 200% browser zoom were not run. Task 003 owns the
   visual/accessibility pass; this limitation is recorded rather than implied passed.
7. **Section links no longer write `#results` / `#map` / `#detail`.** They move focus and
   scroll. The hash stays reserved for `#/object/<id>`. A manually typed section hash is
   ignored by the router, so it cannot clear a selection.
8. **One Codex document was edited, not replaced.** `CONTRIBUTING.md` had a sentence saying a
   strict release command was still required by task 002; it now names `npm run release`. The
   iteration board gained the task 002 row and three decision entries. Nothing was deleted.

## Reviewer outcome

_For Codex to fill: accepted / changes required / partially verified. Include actionable findings
with reproduction steps and expected behaviour._
