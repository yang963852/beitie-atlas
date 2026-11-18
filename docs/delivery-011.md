# Delivery 011 | Chronological atlas and owner preview

Base revision `123657e089d73318e91671f0e6706b5a2e0e48a8` with the retained task 004 and 007–010 worktree deliveries. Implemented and deployed revision `a6af29c7b4b167f99ab04b8f7bc1ec518b405180`. Integration branch `codex/011-atlas-sites`. Independent review is pending.

## Changes

- `data/works/`, `data/objects/`, and `data/sources.json` add 11 works, 12 objects and 12 collection sources. The corpus totals 33 works, 36 objects, 46 sources and 20 events. The period sequence now has 12 groups. Zhang Menglong's stone and Ming rubbing have separate records and custody histories.
- `data/places.json` and `data/sources.json` add two source-cited secondary coordinates for Jinci and Dai Temple. Four points represent 22 objects. All points remain unverified and represent holdings or complexes at institution scale. Fourteen records remain in the list without points.
- `App.tsx`, `MapPanel.tsx`, `LocationOverview.tsx`, `ObjectDetail.tsx`, `ResultsList.tsx`, the locale dictionaries and styles link records to their holding, retain keyboard focus on mobile, keep filtered results and details aligned, and show both original and English titles. The coordinate overview handles missing or failed basemap setup.
- `vite.config.ts` validates data before emitting any release-labelled build. Owner-only Sites uses the preview label and ships without a map key.
- `AGENTS.md`, `docs/atlas-workflow.md`, `docs/release.md`, the iteration board, README files, and `.openai/hosting.json` record the GitHub and Sites workflow.

## Verification

| Check | Outcome |
| --- | --- |
| `npm.cmd run check` | TypeScript, data validation, 96 tests and preview build passed. |
| `npm.cmd run check:release` | Expected exit 1, with 69 draft-only findings. |
| Build with `VITE_RELEASE_MODE=1` | Rejected all 69 draft work and object records before emitting release output. |
| Edge at 390, 768, and 1440 CSS px | Inspected the coordinate view and record layout at each width. Screenshots were captured in the task chat. No horizontal page overflow. |
| Mobile keyboard and share links | Enter moved focus into the detail. Return moved it back to the same row. A keyboard-selected Jinci point opened its Tang object, and its link restored the detail after refresh. |

Fresh 200% browser zoom, a live provider outage, HTTPS Tianditu on the eventual hosted origin, mainland public/mobile networks, and independent source/rights review remain unverified. No images were added to the corpus. Dates, attribution, exhibit status and precise storage locations omitted by the cited catalogue remain unknown.

Representative institutional sources include [Mount Yi Inscription](https://www.beilin-museum.com/index.php?a=index&aid=2620&c=View&m=home), [Northern Stair Stone](https://hwbk.qfwbw.cn/xihan/2017-01-10/3289.html), [Stele of the Heavenly Omen](https://www.dpm.org.cn/collection/impres/234552.html) and [Zhang Menglong's Ming rubbing](https://www.dpm.org.cn/collection/impres/228416.html).

## Delivery destinations

- The [GitHub task branch](https://github.com/yang963852/beitie-atlas/tree/codex/011-atlas-sites) contains the implementation and handoff. Task-branch pushes run the preview CI workflow.
- The [owner-only Codex Sites preview](https://beitie-atlas.partedlute2.chatgpt.site) deployed version 1 successfully from the implementation revision above. The package contained the preview marker and no local map key. Sites ID `appgprj_6afd01e39c948191ac352db900496f1b`, deployment `appgdep_6afd05b6549c8191ac647f6681230b8f`. Hosted browser inspection timed out and a direct request without a signed-in session returned HTTP 403. The share-link test passed locally.
