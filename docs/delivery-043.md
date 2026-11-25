# Delivery 043 · One catalogue top and a flowing river

**Status: implemented, checked and self-reviewed; PR pending.** Branch `feat/043-unified-library-river`, base `0fc8b85`.

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
- A timeline card at 1440: 187.19 × 86.39 px, text `石鼓文`.
- Two river frames 1.2 s apart differ; with reduced motion the same two frames are byte-identical.
- No page errors or horizontal overflow at 1440 / 768 / 390; English labels and cards render with the shared nav.

## Verification

| Command | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npx.cmd vitest run tests/atlas-timeline.test.tsx tests/library.test.tsx` | Passed: 2 files / 11 tests |
| `npm.cmd run check` | Passed: interface current; data 0 errors / 38 known warnings; 99 catalogue pages current; isolation and reproducibility (518 files); board 43 rows; 18 test files / 156 tests; ZIP 523 files; preview build succeeded |
| Browser checks | Passed at 390 / 768 / 1440, English locale and reduced motion; no page errors or horizontal overflow |

## Evidence

- [Library 1440](../screenshots/043-library-1440.jpg), [768](../screenshots/043-library-768.jpg), [390](../screenshots/043-library-390.jpg)
- [Historical threads 1440](../screenshots/043-catalogue-1440.jpg), [768](../screenshots/043-catalogue-768.jpg), [390](../screenshots/043-catalogue-390.jpg)
- [River close-up](../screenshots/043-river-1440.jpg)
- [Collection map 1440](../screenshots/043-collections-1440.jpg)
- [Library entry 1440](../screenshots/043-entry-1440.jpg)
- [English library](../screenshots/043-library-en-1440.jpg), [English historical threads](../screenshots/043-catalogue-en-1440.jpg)

## Limitations

- Self-reviewed; no independent visual review was requested.
- Card names are visually clamped to two lines on narrow slips; the full link text remains in the DOM and the reading card shows the full title, date and attribution.
- The English nav stays `Chronology`; only the Chinese label changed as requested.
- Dark mode and a formal release remain out of scope; drafts still block `npm run release`.

## Rollback

Revert the PR. The shared header, library container, card markup/CSS and shader are isolated; the opening scene, map adapter, data and compiler are untouched.
