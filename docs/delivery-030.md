# Delivery 030 | Yan Qinli provenance map

Base 22780a5. Branch codex/030-provenance-map. Codex self-review; independent editorial review pending. The original stone’s four recorded events remain independent of its rubbing. Modern landmark coordinates provide orientation only. Drum Tower P625 was converted from degrees/minutes/seconds to decimal degrees; the square camera location is transcribed from Commons; the museum uses the existing dataset coordinate. The camera, tower and institution are not event coordinates. No historical itinerary is inferred between stops. Sources inspected 2026-11-19.

Changed: data/yan-qinli-journey.json, JourneyMap, App, MapPanel, ObjectDetail, styles, adapter focus and its types, task, board and this report.

Local self-review: npm.cmd run check passed type, dataset, board, all 124 tests and the preview build. Existing 40 data warnings and the Vite size warning remain. The tile watcher and its regression test now distinguish loaded base tiles from marker icons. Local Chrome loaded the SDK but received no decoded base tiles on the test port. The geographic landmark grid remained readable, with four events, keyboard selection, collection-map return and direct-link refresh. No mainland network or independent editorial review was performed.

Screenshots: [390 px](screenshots/030-390.png), [768 px](screenshots/030-768.png), [1440 px](screenshots/030-1440.png), [native 200% zoom](screenshots/030-zoom.png). No horizontal overflow.
Implementation revision 128ce87574272c75e3aa15ce0cc0e849fe09f85f. [PR #18 and source merge result](https://github.com/yang963852/beitie-atlas/pull/18).
