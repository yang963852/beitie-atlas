# Delivery 020 | Artifact input handling and basemap recovery

- Date: 2026-11-18.
- Branch: `codex/020-artifact-and-basemap-followup`.
- Base: `58816a4b3365905085f70112e89543a5cb7cf3c7`; implementation: `0d1ddd9b042317ae23c4d0af70ae0750fefedb71`. The following documentation-only commit is the delivery branch head.
- Outcome: implementer self-check only. Independent review or owner acceptance at merge remains pending.

## Changes

- `.github/workflows/site-artifact.yml`: treat the dispatch input as data, normalize the validated path, and supply it to both builds. Build summaries now describe the tracked `dist/` manifest.
- `src/map/tiles.ts` and `src/components/MapPanel.tsx`: give the basemap four seconds after SDK mount; ignore marker and annotation images; restore the map when a vector basemap tile arrives. Recognition uses the national Tianditu tile hosts and vector WMTS path documented in the [Tianditu source reference](https://heilongjiang.tianditu.gov.cn/iportal/iClient/forJavaScript/docs/openlayers/ol.source.Tianditu.html).
- `tests/map-tiles.test.ts` and `tests/map-panel.test.tsx`: cover partial failure, slow SDK mount, delayed recovery, non-tile images, and cleanup. The task brief, iteration board and this report record the handoff.

## Verification and limits

- `npm.cmd run check`: 112 tests passed; type, data, board and preview builds passed. The existing warning about 26 untranslated notes remains.
- Executed the workflow's path resolution step in Git Bash: three valid paths normalized and four malformed inputs rejected without output.
- Built with `VITE_BASE_PATH=/beitie-atlas/`; the emitted HTML referenced the expected JS and CSS paths and retained its preview marker.
- `npm.cmd run check:release`: exit 1, rejecting all 77 drafts as intended. No successful release artifact was built; the live workflow was not dispatched.
- No corpus or source changes. Map behavior was verified with a stub; live tile rendering, browser screenshots at the prescribed sizes and zoom, and mainland reachability were not checked. No Site upload or version change.
