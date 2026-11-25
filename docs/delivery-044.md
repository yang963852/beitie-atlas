# Delivery 044 · One catalogue top and a flowing river

**Status: delivered and deployed as the labelled preview. Merged in [PR #48](https://github.com/yang963852/beitie-atlas/pull/48) at `9cce99e`.** Branch `feat/043-unified-library-river`, base `19d3550` (work began at `0fc8b85`).

## Scope

| Area | Change |
| --- | --- |
| Shared top | New `ReaderHeader` supplies the same masthead and three-link nav to 知识库, 历史脉络 and 馆藏地图. Active state follows the entry; the brand returns to the opening. |
| Library | The library's private sticky header, path row and status row are gone. The catalogue title is now left-aligned in the same container and at the same scale as 碑帖时间轴, with the counts lede, selected readings, tabs and search below. Entry pages keep the centred reading leaf and gain a compact back link. |
| Label | 年代长河 becomes 历史脉络 in the app nav and the shared reader nav. |
| Cards | Paper slips now show only the work name. Desktop cards measure about 187 × 86 px instead of the previous tall cards; the banks shrink from 22 rem to 15 rem. The full title stays in the link text; the reading card keeps date and attribution. |
| River | The shader now has a slow meander, drifting longitudinal bands, moving ripple highlights and a pale bank rim. It animates while visible and stops under reduced motion. A CSS drifting fallback covers no-WebGL. |
| Tests | The timeline test now checks the last two card titles instead of the dates that left the card. |

## Measured result

- Masthead height 61.375 px and section nav height 50.531 px on all three entries at 1440; both start at the same y.
- Active labels: 知识库, 历史脉络, 馆藏地图.
- The timeline now renders 108 cards; the first is 大盂鼎 after the bronze and slip records merged. The library lede reports 108 works.
- A timeline card at 1440: 187.19 × 86.39 px, text `石鼓文` before the merge and the same slip size for `大盂鼎` after it.
- Two river frames 1.2 s apart differ; with reduced motion the same two frames are byte-identical.
- No page errors or horizontal overflow at 1440 / 768 / 390; English labels and cards render with the shared nav.

## Verification

| Command | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npx.cmd vitest run tests/atlas-timeline.test.tsx tests/library.test.tsx` | Passed: 2 files / 11 tests |
| `npm.cmd run check` | Passed after merging task 043: interface current; data 0 errors / 38 known warnings; 109 catalogue pages current; isolation and reproducibility (566 source files); board 44 rows; 18 test files / 156 tests; ZIP 571 files; preview build succeeded. |
| Browser checks | Passed at 390 / 768 / 1440, English locale and reduced motion; no page errors or horizontal overflow |

## Evidence

- [Library 1440](../screenshots/044-library-1440.jpg), [768](../screenshots/044-library-768.jpg), [390](../screenshots/044-library-390.jpg)
- [Historical threads 1440](../screenshots/044-catalogue-1440.jpg), [768](../screenshots/044-catalogue-768.jpg), [390](../screenshots/044-catalogue-390.jpg)
- [River close-up](../screenshots/044-river-1440.jpg)
- [Collection map 1440](../screenshots/044-collections-1440.jpg)
- [Library entry 1440](../screenshots/044-entry-1440.jpg)
- [English library](../screenshots/044-library-en-1440.jpg), [English historical threads](../screenshots/044-catalogue-en-1440.jpg)
- Live preview at `9cce99e`: [library](../screenshots/044-live-library-1440.jpg), [historical threads](../screenshots/044-live-catalogue-1440.jpg)

## Limitations

- Self-reviewed; no independent visual review was requested.
- Card names are visually clamped to two lines on narrow slips; the full link text remains in the DOM and the reading card shows the full title, date and attribution.
- The English nav stays `Chronology`; only the Chinese label changed as requested.
- Dark mode and a formal release remain out of scope; drafts still block `npm run release`.

## Merge and deployment

- PR #48 passed the Preview quality checks ([run 45518553172](https://github.com/yang963852/beitie-atlas/actions/runs/45518553172)) and merged on 2026-11-25T00:31:20Z at `9cce99e82a0c85d0645ccbfdfb102d73ccc19a57`, on the coordinator's instruction, after merging [PR #49](https://github.com/yang963852/beitie-atlas/pull/49) (task 043) and its deploy record.
- The post-merge Preview quality checks ([run 45518711509](https://github.com/yang963852/beitie-atlas/actions/runs/45518711509)) and Publish GitHub Pages preview ([run 45518711551](https://github.com/yang963852/beitie-atlas/actions/runs/45518711551)) succeeded.
- The [public preview](https://yang963852.github.io/beitie-atlas/) returns HTTP 200. Live measurements: library h1 `作品与书家`, active `知识库`, lede `共 108 部作品 · 7 位书家 · 2 篇读帖笔记，依时代编次`; masthead 61.375 px and nav 50.531 px; 108 timeline cards with `大盂鼎` first; card 187.19 × 86.39 px; river frames 1.2 s apart differ; collection map active `馆藏地图`; the map pin filter resolves to `hue-rotate(150deg) saturate(1.35) brightness(0.95)`; no page errors or horizontal overflow.
- Reachability was observed from this execution environment. Mainland public-network access and a formal release were not tested; drafts still block `npm run release`.

## Rollback

Revert the PR. The shared header, library container, card markup/CSS and shader are isolated; the opening scene, map adapter, data and compiler are untouched.
