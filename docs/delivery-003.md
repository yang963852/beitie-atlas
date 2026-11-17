# Delivery report

Task ID: 003 — Refine the visual hierarchy
Date: 2026-11-17
Implementation branch and commit, if any: `task/003-visual-refinement`, based on `d015e1d`; implementation `555ff18`.

## Result

The foundation preview's parchment audit screen has been replaced by a neutral,
map-led interface that follows `docs/design-system.md`. No framework, provider,
or dependency was added; the corpus, domain rules, map adapter, and release gate
are unchanged.

**Implemented**

- Shared tokens for canvas, surface, text, dividers, accent, draft/verified
  states, spacing, radii, focus, and motion. The accent is reserved for actions
  and selection; draft and verified states keep distinct, labelled colours.
- Desktop: compact sticky header, 320 px search/results sidebar, map as the
  primary flexible column, and a 380–440 px readable record panel. Panes have a
  viewport-based height and scroll independently.
- Tablet (768–1199 px): two columns instead of three cramped ones; the record
  panel moves below the map instead of squeezing a third column.
- Mobile (<768 px): explicit List/Map switch, single-pane exploration, and a
  full-width record view with a visible “Back to records” action. Query,
  selection, and the object hash survive switching and Back.
- Progressive disclosure: “Sources (N)” disclosures next to collection and
  event claims, a “Coordinate and precision” disclosure, and a collapsed
  “Developer details” block inside the map fallback. Full citations remain in
  the record bibliography and the map location list.
- Map failure states are reader-facing (“Map unavailable”, “The map could not
  load” with Retry). Provider-key instructions and failure codes moved behind
  “Developer details”; the loading skeleton and retry behaviour are unchanged.
- Empty search results now offer a reset action; the results counter, selected
  state, and section links (with focus movement, without touching the object
  hash) still behave as before.

**Verified locally**

- `npm run check` passes: type check, data validation, 63 tests, preview build.
- Two new tests cover the mobile record flow: a shared `#/object/...` link opens
  the record view, Back returns to the list without clearing the hash, and the
  List/Map switch keeps the selection and filtered results.
- Two existing assertions were updated because reader-facing copy changed:
  “Map pilot” → “Map” and “Map not configured in this build” → “Map
  unavailable”. No functional assertion was weakened or removed.
- Screenshots below were captured from the built preview at exact CSS viewports
  (1440×900, 768×1024, 390×844, and 720×450 as the 200% zoom equivalent). The
  DOM reported `scrollWidth === clientWidth` and no element extending past the
  viewport at all four widths.
- Keyboard Tab order was inspected in Chrome: skip link → section links → search
  → record links → disclosures, each with a 2 px visible outline.

**Not verified**

- A live Tianditu session. No key exists in this environment, so every map
  screenshot shows the fallback state; the `map--live` sizing has not been seen
  with real tiles.
- Real browser zoom at 200% (a 720 px CSS viewport is an equivalent, not the
  same rendering path), screen-reader output, and automated contrast tooling.
- Mainland, overseas, and hosted-network access. No production site exists.

## Changed files

| File | Purpose |
| --- | --- |
| `src/styles.css` | Replaced the parchment stylesheet with tokenised neutral layout, responsive rules, disclosures, focus and reduced-motion handling |
| `src/App.tsx` | Compact header/nav, workspace panes, mobile List/Map switch, record view state, section focus handling, footer build info |
| `src/components/ResultsList.tsx` | Calmer list rows, reset action for empty results |
| `src/components/MapPanel.tsx` | Reader-facing fallback copy, developer-details disclosure, place card, restyled location list |
| `src/components/ObjectDetail.tsx` | New record hierarchy, grouped facts, coordinate disclosure, mobile Back action |
| `src/components/SourceList.tsx` | “Sources (N)” disclosure with a plain variant for the bibliography |
| `src/i18n/en.ts` | Reader-facing copy; provider instructions moved to developer strings |
| `tests/app.test.tsx` | Two copy-driven assertions updated, two mobile-flow tests added |
| `docs/screenshots/003-*.png` | Before/after evidence listed below |
| `docs/iteration-board.md`, `README.md`, `README.zh-CN.md`, `CHANGELOG.md`, `docs/START-HERE.md` | Status and handoff updates |

## Run and inspect

```bash
npm ci
npm run check        # typecheck + data + 63 tests + preview build
npm run preview      # serves dist/ locally
```

Preview address used for the screenshots: `http://localhost:4173/`.
Required non-secret configuration: none. Without a Tianditu key the map shows the
fallback state by design.

On this Windows machine Git over HTTPS needed `-c http.sslBackend=openssl` for
fetch/push because the schannel backend could not resolve certificate revocation.
That is an environment workaround, not a repository setting.

## Verification evidence

Before: `docs/screenshots/002-desktop-1440.png` (the parchment foundation screen delivered in
task 002). After: `docs/screenshots/003-desktop-1440.png` and the responsive views below. The
before view was not re-captured; it is the previous delivery's own evidence at the same width.

| Check | Result | Evidence or limitation |
| --- | --- | --- |
| Type check | Passed | `npm run typecheck` inside `npm run check` |
| Data validation | Passed | `npm run check:data`; corpus untouched |
| Automated tests | Passed | 63 tests in 7 files; 2 added, 2 copy assertions updated |
| Preview build | Passed | `vite build`, 17.7 kB CSS / 278 kB JS |
| Desktop 1440×900 | Passed visually | `docs/screenshots/003-desktop-1440.png`; no horizontal overflow |
| Tablet 768×1024 | Passed visually | `docs/screenshots/003-tablet-768.png`; two columns, record below map |
| Mobile 390×844 | Passed visually | `docs/screenshots/003-mobile-390.png`; List/Map switch visible |
| Mobile record view | Passed visually | `docs/screenshots/003-mobile-390-detail.png`; Back action visible |
| 200% zoom equivalent | Partially verified | `docs/screenshots/003-zoom-200-equivalent.png` at a 720 CSS px viewport; not a real browser zoom run |
| Keyboard and focus | Partially verified | Tab order captured in Chrome, `003-focus-ring.png`; no screen-reader pass |
| Map failure fallback | Passed | Fallback, Retry branch and developer disclosure verified by tests and screenshots; live provider error not reproduced |
| Live map rendering | Not run | No Tianditu key in this environment |
| Mainland desktop/mobile access | Not run | No deployment |
| Overseas access | Not run | No deployment |
| Object identity and source review | Not applicable | No editorial data changed |

## Known issues and decisions

- **Map column in the fallback state.** Without a provider the map box shrinks to
  a status card so the accessible location list gets the room. With a key the map
  fills the column; that live state remains unverified, and the screenshots must
  not be read as a claim about map rendering.
- **Two-pane mounting on mobile.** Both exploration panes stay mounted and are
  hidden with `display: none`, so search text and scroll state survive switching.
  Hidden panes are removed from the accessibility tree by the browser. The map
  adapter itself mounts only while its pane is visible, so the provider never
  measures a zero-height container; that branch is unexercised without a key.
- **Fixed-height desktop panes.** Panes use `100dvh` with independent scrolling.
  On very short viewports the map keeps a 460 px minimum and the page scrolls;
  this is intentional rather than clipping content.
- **Copy changes.** “Map pilot” was developer shorthand; the reader-facing label
  is now “Map”. Provider setup steps remain in `docs/map-setup.md` and inside the
  developer disclosure, so the evidence trail is preserved.
- **No visual review of hover/active states beyond the captured ones**; the
  owner's taste decision is still open, as task 003 states.
- Dark mode, decorative motion, custom icons, and image assets remain out of
  scope for this iteration.

## Reviewer outcome

For Codex to fill: accepted / changes required / partially verified. Include actionable findings with reproduction steps and expected behavior.
