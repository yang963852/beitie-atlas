# Delivery 042 · Reading-room setting across the frontend

**Status: delivered and deployed as the labelled preview. Merged in [PR #46](https://github.com/yang963852/beitie-atlas/pull/46) at `3780043`.** Branch `feat/reading-room-project`, base `1d08a33`, implementation `706ea38`. A post-deployment refinement shifts the provider's default blue map pin to the seal hue; it is included in this follow-up.

## Scope

| Area | Change |
| --- | --- |
| Global tokens | Paper canvas and lifted leaves, ink tiers, vermilion seal accent, 2–4 px corners, thin rules, paper grain, Song reading text and Kai captions. |
| Topbar and navigation | Seal beside the site title, double rule, text-led navigation with a seal-coloured underline; the mobile row shows the three main routes and the section jumps stay on desktop. |
| Record list | Catalogue rows with Chinese numerals (Arabic in English), dynasty headings with a seal diamond and rule, a seal inset on the selected row. |
| Map | Double-rule map plate, paper grid, seal square markers, paper location strip and popovers. The basemap provider keeps its own cartography. |
| Detail leaf | Book-leaf padding, seal top rule, centred section marks, ruled facts, Song headings, Kai captions, justified Chinese prose, seal timeline diamonds and hanging source entries. |
| Timeline and collections | Printed-catalogue masthead, ruled period headings, paper slips with seal dates, a sepia ink river, paper controls and a double-rule reading card. |
| Transmission and contribution | Paper cards and grid, seal active stage, paper form fields and a flat vermilion primary action. |
| Opening desk | Warmer fog and felt, brown frame and cuff, filmic tone mapping, a vignette and laid-paper grain, plus bookplate links with a seal. Camera, brush, hand, ink spread and timing untouched. |

`docs/design-system.md` now records the unified palette, the components and the opening's core boundary.

## Three.js core boundary

Changed only: renderer tone mapping and exposure, scene background/fog colour, hemisphere and sun colours, frame/ivory/bamboo/felt/cuff colours, and the shader's ink colours. Unchanged: camera path, geometry, materials' structure, brush and hand rig, interaction, wash sequence, lazy loading, reduced-motion branch, canvas sizing and pixel-ratio cap.

## Verification

| Command | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npx.cmd vitest run` | Passed: 18 files / 156 tests |
| `npm.cmd run check` | Passed locally: interface current; data 0 errors / 38 known warnings; 99 catalogue pages current; isolation and reproducibility (518 files) passed; board 42 rows; 18 test files / 156 tests; ZIP 523 files; preview build succeeded. PR check [run 45512813952](https://github.com/yang963852/beitie-atlas/actions/runs/45512813952) passed. |
| Browser checks | Passed: 390 / 768 / 1440 and the zoom equivalent, English and reduced motion; no page errors or horizontal overflow |

Exercised: cold load of a shared object URL, sticky topbar and timeline masthead, mobile list/map/detail switch, keyboard focus on results and witness buttons, search and empty state, missing map key fallback, reading dialog and contribution form. Contrast samples: captions 4.55:1, seal dates 6.93:1, body copy above 7:1.

## Evidence

- Opening: [1440](../screenshots/042-opening-1440.jpg), [390](../screenshots/042-opening-390.jpg), [reduced motion](../screenshots/042-opening-reduced-1440.jpg)
- Timeline: [1440](../screenshots/042-timeline-1440.jpg), [768](../screenshots/042-timeline-768.jpg), [390](../screenshots/042-timeline-390.jpg)
- Workspace: [1440](../screenshots/042-workspace-1440.jpg), [768](../screenshots/042-workspace-768.jpg), [390](../screenshots/042-workspace-390.jpg), [English](../screenshots/042-workspace-en-1440.jpg)
- Collection map: [1440](../screenshots/042-collections-1440.jpg)
- Reading card: [1440](../screenshots/042-folio-1440.jpg)
- Contribution: [1440](../screenshots/042-contribute-1440.jpg)
- Zoom equivalent: [720 CSS px at 2×](../screenshots/042-zoom-720.jpg)
- Library regression: [1440](../screenshots/042-library-1440.jpg)
- Live preview at `3780043`: [opening](../screenshots/042-live-opening-1440.jpg), [chronology](../screenshots/042-live-timeline-1440.jpg), [workspace with the Tianditu basemap](../screenshots/042-live-workspace-1440.jpg). The workspace capture still shows the provider's blue pin; [seal pin preview](../screenshots/042-map-marker-seal.jpg) shows the CSS filter that ships with this follow-up.

## Limitations

- Self-reviewed; no independent visual review was requested.
- 200% zoom was simulated with a 720 CSS px viewport at 2× device pixel ratio, not operated in a real 200% browser session.
- Windows system serif/Kai fallbacks were captured; macOS and Linux use their own local fallbacks.
- The provider's basemap cartography keeps its own palette. Only the SDK's default marker image is hue-shifted to the seal accent; water, roads and labels are unchanged.
- No formal release: drafts still block `npm run release`.

## Merge and deployment

- PR #46 passed the Preview quality checks ([run 45512813952](https://github.com/yang963852/beitie-atlas/actions/runs/45512813952)) and merged on 2026-11-24T23:48:25Z at `3780043d9f405165ebd512070e820972705486a6`, on the coordinator's instruction.
- The post-merge Preview quality checks ([run 45513025087](https://github.com/yang963852/beitie-atlas/actions/runs/45513025087)) and Publish GitHub Pages preview ([run 45513025084](https://github.com/yang963852/beitie-atlas/actions/runs/45513025084)) succeeded.
- The [public preview](https://yang963852.github.io/beitie-atlas/) returns HTTP 200 and is marked `beitie-build-mode=preview`. The opening canvas renders at 1440, the chronology shows the new masthead and slips, and `#/object/yan-qinli-original-stele` shows the paper workspace with the live Tianditu basemap. `--accent` resolves to `#8f2f22`, the body resolves to the Song/Palatino stack, and neither page shows horizontal overflow or page errors.
- The live map's default blue pin was out of palette. A CSS filter on `.tdt-marker-icon` shifts the pin to the seal hue; it was previewed on the live map and is included in this follow-up. The basemap itself is untouched.
- Reachability was observed from this execution environment. Mainland public-network access and a formal release were not tested; drafts still block `npm run release`.

## Rollback

Revert the PR. The change is confined to styles, the scene's colour/lighting values, the InkRiver shader colours, three decorative seal spans, the theme colour and documentation; the layout, data and map adapter are unchanged.
