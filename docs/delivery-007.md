# Delivery report

Task ID: 007 — Chinese-first interface, blue visual pass, corpus expansion
Date: 2026-11-18
Base revision: `123657e` (task 003 delivered, awaiting independent review)

## Result

The interface now opens in Chinese, the visual language is a light Apple-style
blue system, and the corpus has grown from 2 objects to 12. No framework,
provider, or runtime dependency was added; React 19 + TypeScript + Vite and the
npm lockfile are unchanged.

**Implemented**

- **Chinese first.** All interface copy exists in `src/i18n/zh.ts` and
  `src/i18n/en.ts` behind one `Strings` type, so a missing key is a type error.
  The header carries a `中文 / EN` segmented control; the choice is stored in
  `localStorage` and `<html lang>` follows it. Search, hash routing, and the
  mobile view switch behave identically in both languages.
- **Chinese editorial prose.** Records may carry `summaryZh`, `collection.noteZh`,
  `coordinates.noteZh`, `review.noteZh`, and `notesZh`. Rendering falls back to
  the recorded language when a translation is absent; nothing is translated at
  run time.
- **Blue visual system.** Accent `#0071e3`, frosted sticky header, 18 px panel
  radii, layered shadows, iOS-style segmented controls, a single soft blue field
  behind the header, and blue state for selection and focus only. Draft and
  unverified states keep their own amber colour so a draft never looks approved.
- **Map framing.** `src/map/view.ts` computes the initial and "show all points"
  view from the marker bounds instead of centring on whichever marker came
  first. A visible control re-frames every documented point.
- **Map status panel.** Without a key the panel is an explicit status panel with
  the exact `.env.local` line and the caveat that a browser key is public; it is
  not a pretend map. The place list below stays the keyboard-accessible
  equivalent.
- **Corpus.** 11 works, 12 objects, 8 places, 13 sources, 7 events. Ten new
  objects: 玄秘塔碑, 多宝塔感应碑, 曹全碑, 集王圣教序碑, 皇甫诞碑 (all 西安碑林),
  乙瑛碑, 礼器碑, 史晨碑 (曲阜汉魏碑刻陈列馆), 石门颂 (汉中市博物馆), 张迁碑
  (泰安岱庙). Each cites an institutional or government page; two documented
  moves are recorded as events (礼器碑 1998, 石门颂 1970s).
- **Gaps are stated, not filled.** Every object carries bilingual notes naming
  what the source does not say: dimensions, excavation, accession, display
  status, coordinates. A test enforces that the note lists exist and stay the
  same length in both languages.
- **Chronological order.** Objects sort by production year with undated records
  last, so the list reads as a stele sequence instead of an id list.

**Verified locally**

- `npm run check` passes: type check, data validation, 75 tests, preview build
  (23.3 kB CSS / 331.6 kB JS).
- Layout measured inside a 390 px, 768 px, and 1440 px iframe: at 390 px
  `documentElement.scrollWidth === clientWidth` and no element extends past the
  viewport. The same harness reports `data-mobile-view="detail"` for a shared
  `#/object/...` link.
- Screenshots at all three widths, plus the mobile record view, are in
  `docs/screenshots/007-*.png`.

**Not verified**

- A live Tianditu session. No key exists in this environment, so the map still
  renders its status panel; the tiles, marker popups, and `map--live` sizing
  have not been seen.
- Real browser 200% zoom (the 768 px view is a related but different rendering
  path), screen-reader output, and automated contrast measurement.
- Mainland, overseas, and hosted access. No deployment exists.
- The 张迁碑 holding is taken from a secondary album note, not a museum page.
  It stays unverified and the record says so.

## Changed files

| File | Purpose |
| --- | --- |
| `src/i18n/zh.ts` | New Chinese dictionary, same keys and signatures as English |
| `src/i18n/index.tsx` | Locale provider, storage, `<html lang>`, hooks |
| `src/i18n/en.ts` | Widened type, new keys (language, map setup, fit, precision) |
| `src/App.tsx` | Provider, language switch, header actions, chronological markers |
| `src/components/*.tsx` | Locale-aware copy, badges, status panel, setup disclosure |
| `src/domain/dates.ts` | Chinese date rendering; English stays the default for CLI output |
| `src/domain/data.ts` | Chronological object order |
| `src/domain/types.ts` | Optional Chinese editorial fields |
| `src/map/view.ts` | Bounds-based view calculation |
| `src/map/tianditu.ts` | Uses the computed view; adds `fit()` |
| `src/map/markers.ts` | Locale-aware marker labels |
| `src/map/types.ts` | `fit()` on the adapter boundary |
| `src/styles.css` | Blue Apple-style visual pass, mobile segmented control |
| `data/works/*.json` | Ten new work records |
| `data/objects/*.json` | Ten new object records; Chinese notes on all twelve |
| `data/places.json` | Three new institutions, coordinates deliberately null |
| `data/sources.json` | Nine new sources, all https |
| `tests/*` | Chinese assertions, locale switch, Chinese dates, map view, gap notes |
| `docs/screenshots/007-*.png` | Width evidence |

## Run and inspect

```bash
npm ci
npm run check       # typecheck + data + 75 tests + preview build
npm run dev         # http://localhost:5173
```

No key is required to read the corpus. To light up the base map, copy
`.env.example` to `.env.local`, set `VITE_TIANDITU_KEY`, and restart the dev
server.

## Verification evidence

| Check | Result | Evidence or limitation |
| --- | --- | --- |
| Type check | Passed | `npm run typecheck` inside `npm run check` |
| Data validation | Passed | 11 works / 12 objects / 8 places / 13 sources / 7 events, 0 errors |
| Automated tests | Passed | 75 in 8 files; 2 new corpus invariants, 1 Chinese date suite, 1 map view suite |
| Preview build | Passed | 23.3 kB CSS / 331.6 kB JS |
| 390 px layout | Passed | iframe harness: `scrollWidth=390`, `overflow=no`, `wide=none` |
| 768 px layout | Passed visually | Two columns, record panel below the map |
| 1440 px layout | Passed visually | Three columns, place list fills the column |
| Mobile record view | Passed | Back action visible, `data-mobile-view=detail` |
| Keyboard and focus | Partially verified | Existing Tab order and focus ring preserved; no new pass |
| Real 200% zoom | Not run | No browser zoom session this round |
| Screen reader | Not run | No assistive-technology pass |
| Live map | Not run | No Tianditu key in this environment |
| Mainland access | Not run | No deployment |

## Known issues and decisions

- **Chinese content is a translation, not a new claim.** The ten new records were
  written from the cited pages only. Where a page did not state a dimension, an
  excavation, or a coordinate, the value stays `null` and the gap is named.
- **曹全碑 date conflict.** The museum excerpt reads 中平三年 (186); common
  catalogues read 中平二年 (185). The record stores 185, marks the date
  `disputed`, and shows both readings. Choosing one silently would be worse.
- **皇甫诞碑 year.** The audited entry does not give a carving year, so it is
  `unknown` rather than filled from general knowledge.
- **张迁碑 needs a better source.** A secondary album note is the only source
  found for its 岱庙 holding. It is marked unverified and blocks publication.
- **Three new places have no coordinates.** 曲阜汉魏碑刻陈列馆, 汉中市博物馆, and
  泰安岱庙 are recorded without points, so their objects appear under "records
  without a map point". An unsourced point would be worse than a gap.
- **`http://` government page dropped.** The 国家文物局 report on 汉中市博物馆 is
  served over http only; the record cites the https 中国社会科学网 page instead of
  weakening the https-only source test.
- **Map copy is owner-facing in one place.** The setup disclosure names the
  environment variable on purpose; it is the only way to make the block
  actionable without a runbook round trip.

## Reviewer outcome

For Codex to fill: accepted / changes required / partially verified. Include
actionable findings with reproduction steps and expected behaviour.
