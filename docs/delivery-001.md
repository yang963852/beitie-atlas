# Delivery report

Task ID: **001-foundation**
Date: **2026-11-17**
Implementation branch and commit: **`task/001-foundation`**, implementation commit **`4782855`**
(baseline planning commit `1e38f14` on `main`). This report is committed immediately after the
implementation commit, so its own hash is not referenced here.

## Result

**Implemented and verified locally**

- A React 19 + TypeScript + Vite 7 application with npm, a committed lockfile, a documented Node
  requirement, and working start/build/check commands.
- Domain types plus one runtime validator shared by the command-line check and the app: work/object
  separation, source references, optional WGS84 coordinates with precision and verification state,
  collection assertions with access dates, uncertain dates, and event-level evidence.
- Two independent draft object records for the Yan Qinli Stele: the original stone and the Palace
  Museum rubbing `新00045406`, with different ids, types, collection assertions, and histories.
- A results list, an object detail view with per-claim sources, hash deep links, and search over
  Chinese titles, English titles, aliases, catalogue numbers, and collection names.
- A Tianditu map adapter behind a small boundary, with loading, unconfigured, and error states, and
  a keyboard-accessible location list that works with no map at all.
- A portable production build with a configurable base path; the sub-path build was produced and
  inspected.

**Verified** (actual commands, 2026-11-17): type check, data validation, 36 automated tests, and the
production build all pass. The unconfigured-map state was checked in a real Chrome window at four
viewport widths. See the table below for what each check does and does not prove.

**Pending, not claimed**

- Live provider rendering: no Tianditu key exists here, so no map tiles or markers were ever drawn.
- Independent editorial review of the two records; both are explicitly `draft`.
- Mainland desktop and mobile access, overseas access, and any deployment.

## Changed files

| Area | Files | Purpose |
| --- | --- | --- |
| Tooling | `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.env.example` | React/Vite/TypeScript setup, pinned versions, base-path handling, test config, example environment file |
| Documentation | `README.md` | Status, real commands, links to the new documents |
| Data | `data/works/yan-qinli-bei.json`, `data/objects/yan-qinli-original-stele.json`, `data/objects/dpm-rubbing-xin00045406.json`, `data/places.json`, `data/sources.json`, `data/media.json` | One work, two draft objects, five places, four sources, no media |
| Domain | `src/domain/types.ts`, `validate.ts`, `dates.ts`, `data.ts`, `search.ts`, `coordinates.ts` | Entity types, shared validation, historical dates without `Date`, dataset loading, search, coordinate formatting |
| Interface | `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/i18n/en.ts`, `src/components/ResultsList.tsx`, `ObjectDetail.tsx`, `SourceList.tsx`, `MapPanel.tsx` | Layout, hash routing, list, detail, citations, map panel |
| Map | `src/map/types.ts`, `config.ts`, `tianditu.ts`, `markers.ts` | Adapter boundary, public key handling, official API 4.0 loader, marker construction |
| Checks | `scripts/check-data.ts`, `tests/setup.ts`, `tests/app.test.tsx`, `tests/dates.test.ts`, `tests/validate.test.ts`, `tests/seed-records.test.ts`, `tests/map-markers.test.ts` | Build-time data gate, component tests, date/validator/marker tests |
| Documents | `docs/map-pilot.md`, `docs/screenshots/local-desktop.png`, `local-mobile.png`, `local-desktop-rubbing.png`, `local-tablet-detail.png` | Provider evaluation, credential model, local visual evidence |

`node_modules/`, `dist/`, and all `.env*` files except `.env.example` are ignored by Git.

## Run and inspect

```bash
cd C:\Users\zhangyang\Desktop\AI_working\碑帖之间
npm install
npm run dev        # development server, prints its own address (Vite default 5173)
npm run check      # type check + data check + tests + production build
npm run build      # type check + production build into dist/
npm run preview    # serve the built site
```

Preview address used for this delivery: **http://127.0.0.1:4173/** (`npm run preview`, HTTP 200 at
delivery time). It is a local server on this machine: it stops when the terminal window is closed,
and it is not reachable from another device or from the public internet.

Deep link example: `http://127.0.0.1:4173/#/object/dpm-rubbing-xin00045406`.

Required non-secret configuration (all optional; `.env.local`, not committed):

| Variable | Meaning |
| --- | --- |
| `VITE_TIANDITU_KEY` | Public Tianditu browser key. Empty by default → the map shows an explanatory panel and no request is made. |
| `VITE_BASE_PATH` | Deployment sub-path, e.g. `/beitie-atlas/`. Default `/`. |
| `VITE_RELEASE_MODE` | `1` makes the in-app validator treat any draft record as an error. |
| `RELEASE_MODE` | `1` does the same for `npm run check:data`. |

Sub-path build:

```bash
# Git Bash converts /beitie-atlas/ into a Windows path; disable that conversion:
MSYS_NO_PATHCONV=1 VITE_BASE_PATH=/beitie-atlas/ npm run build
# PowerShell: $env:VITE_BASE_PATH='/beitie-atlas/'; npm run build
```

Result inspected in `dist/index.html`: assets referenced as `/beitie-atlas/assets/index-*.js|css`.
The default build was then restored (`/assets/...`).

## Verification evidence

| Check | Result | Evidence or limitation |
| --- | --- | --- |
| Type check | **passed** | `npm run typecheck` → `tsc --noEmit`, exit 0, no diagnostics, Node v22.22.2, TypeScript 5.9.3. |
| Data validation | **passed** | `npm run check:data` → `Records: 1 works, 2 objects, 5 places, 4 sources, 4 events, 0 media items. Errors: 0`. No warnings. |
| Production build | **passed** | `vite 7.3.8`, 48 modules, `dist/index.html` 0.60 kB, CSS 11.79 kB (gzip 3.11 kB), JS 273.08 kB (gzip 85.38 kB), built in 1.32 s. Sub-path build produced and inspected separately. |
| Automated tests | **passed** | `npm run test` → 5 files, 36 tests, all passed (dates 9, validation 12, seed records 6, markers/failure mapping 4, interface 5). |
| Object identity and source review | **passed (structural only)** | The stone and the rubbing have different ids, `objectType`, collection place, and collection access date; the rubbing has zero provenance events while the stone has four dated ones. Every collection claim and event carries a source id that resolves. Independent editorial review has **not** happened; both records are marked `draft`. |
| Browser interaction | **passed at component level** | Interface tests cover list rendering, selection, search filtering, hash deep link, and the no-map state. Visual layout checked with headless Chrome at 1440, 1280, 900 and 390 px. Not a full manual acceptance pass, and not a real click-through of the provider map. |
| Map failure fallback | **passed for “no key”; error path untested live** | Real Chrome window shows “Map not configured in this build” with the record list and detail fully usable. Script-error/timeout/SDK-error paths exist with a retry button and are unit-covered only at the failure-mapping level. |
| Live provider map | **not run** | No key. No tiles, markers, attribution label, or quota behaviour have been observed. |
| Mainland desktop access | **not run** | No deployment exists. A localhost screenshot is not evidence for this gate. |
| Mainland mobile access | **not run** | Same. The mobile layout was checked at 390 px locally only. |
| Overseas access | **not run** | No deployment. |

## Known issues and decisions

1. **No map key.** `VITE_TIANDITU_KEY` is empty, so the pilot cannot show a provider-backed map or an
   institution marker yet. This is the single blocking item for the map acceptance criterion, and it
   needs one owner action (see `docs/map-pilot.md` §4). Nothing was invented to work around it.
2. **Coordinates are provisional.** The two institution points come from Wikidata (P625), a
   crowd-sourced secondary source; the Beilin statement carries no reference on Wikidata. They are
   stored with `verification: "unverified"`, `precision: "institution"`, and a visible
   “Unverified — secondary source” label in the UI. The historical places (governor's compound,
   Xincheng, 1948 Beilin) have `coordinates: null` and produce no markers, by design.
3. **One source carries the 1922–1948 sequence.** The four movements come from a single museum web
   article published 2007-08-07. It was read on 2026-11-17 and is not a present-day physical check.
   Intervening custody is left as a gap and the interface says so.
4. **Two different find-place wordings.** The Palace Museum entry says 旧藩廨库基; the museum article
   says 省长公署. Both are preserved; they were not merged into one normalized address.
5. **The rubbing has no history of its own yet.** It has no custody events, no asserted
   `rubbing-of` relation to the stone, and no year beyond the 民国 era label. The catalogue's
   《欧斋藏碑帖目录》 quotation was not turned into provenance.
6. **Draft status is honest, not decorative.** Both objects and the work are `draft`; the banner,
   the badge, and the review note say so. The validator can fail a release build that contains
   drafts (`RELEASE_MODE=1` / `VITE_RELEASE_MODE=1`).
7. **No images.** `data/media.json` is empty; no third-party asset is bundled, so no rights problem
   is introduced. A future image needs license, credit, and rights evidence before it can pass
   validation.
8. **Provider terms still need a release check.** Attribution wording, approval label requirements,
   quota numbers, and whether an individual account needs identity verification were not confirmed;
   see `docs/map-pilot.md` §1. The code keeps the provider's own map labels and does not use
   undocumented tile endpoints.
9. **Frontend environment variables are public.** The Tianditu key is compiled into the bundle. It
   must be domain-restricted and quota-managed; `.env` does not hide it. No secret is stored in this
   repository.
10. **Git Bash path conversion.** `VITE_BASE_PATH=/beitie-atlas/ npm run build` is mangled by MSYS
    into a Windows path. Use `MSYS_NO_PATHCONV=1` or PowerShell, as documented above.
11. **Git identity is tooling-local.** This machine had no Git user configured, so commits use the
    repository-local identity `WorkBuddy (implementation) <workbuddy@localhost>`. The owner can
    rewrite authorship later if desired.
12. **Preview is localhost only.** It proves the build runs in a browser on this machine; it says
    nothing about mainland networks, CDN behaviour, or a real host's base path.

## Gate status (kept separate on purpose)

| Gate | Status |
| --- | --- |
| M0 local engineering (this task, excluding live map) | **complete** — checks above pass |
| M0 live map pilot | **incomplete** — blocked on one owner-held key |
| M0 test deployment + mainland desktop/mobile verification | **not started** |
| Codex review of task 001 | **pending** |

## Reviewer outcome

**Changes required — Codex, 2026-11-17.** Independently reran all local checks: 36 tests,
data validation, type check, and build pass. Review found release-gate bypass, SDK retry,
location semantics/navigation, coordinate-description, and setup-guide issues. See
[independent review](review-001.md) for evidence and [task 002](../tasks/002-review-fixes.md)
for fixes. Live provider and public-network acceptance remain pending. This outcome does
not change the implementer's historical observations above.
