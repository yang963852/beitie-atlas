# Delivery 014 | Public Sites overview and an originals map

Base revision `7468f6ae58902f9e4702a9cb0a9e8594fe45266a`. The implementation revision is the commit introducing this report. The task branch also carries the separate first corpus audit from task 013.

- Removed the GitHub Pages deployment workflow and changed the README links to the existing Codex Site. GitHub Actions checks both builds.
- `scripts/build-overview.mjs` stages the HTML and stylesheet in `build/`. The public Sites manifest points there. The React atlas continues to build into `dist/`.
- The public overview maps two documented holding locations and four selected original steles. The holding links point to the institutions. The secondary institution coordinates are explicitly unverified. The schematic uses neither tiles nor the draft JSON corpus.
- The React atlas map now filters to surviving original steles and cliff inscriptions. The map markers, the selected place's objects and the location list share the same filter. Search results and record permalinks keep their existing behavior.

## Verification

| Check | Outcome |
| --- | --- |
| `npm.cmd run check` | Passed, including 98 tests and the atlas preview build. |
| `npm.cmd run build:overview` | Passed. The staging directory contains `index.html` and `styles.css`. The Sites archive carries those files and its hosting manifest. |
| `npm.cmd run check:release` | Rejected all 69 draft work and physical-object records. |
| Edge layout and keyboard checks | At 390, 768 and 1440 CSS pixels, the overview markers and the atlas filter were visible and focusable with no horizontal page overflow. Enter opened the overview marker's holding section. Space toggled the atlas filter and removed the Palace Museum rubbing marker. A 720 CSS-pixel viewport at DPR 2 also passed. Actual browser zoom at 200% was not run. |
| Public Codex Site | Version 2 from Sites source revision `7a6372eec69b29f588336bfd42622452008c7a97` deployed successfully. Anonymous requests returned HTTP 200 for the page bearing the overview marker and both map links, and for the stylesheet. |
| GitHub Pages | The repository's Pages deletion returned HTTP 204. Both the settings endpoint and the former Pages URL then returned HTTP 404. |

[Public overview at 390 CSS pixels](screenshots/014-overview-390.png) · [Atlas map at 1440 CSS pixels](screenshots/014-atlas-1440.png)

The public map locations are representative institution points. The full application still needs independent corpus approval before publication. Live Tianditu behavior on Sites and mainland network access were not tested in this iteration.
