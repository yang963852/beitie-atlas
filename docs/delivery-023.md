# Delivery 023 | Canonical calligraphy coverage

- Base: `e7863f46fbda5edd900f2af67925919c4a668904`; branch: `codex/023-canonical-inscriptions`. The commit containing this report is the delivery revision.
- Added two work records and three physical records: the Palace Museum's original drum set and early Ming rubbing album, and one National Museum fragment of 熹平石经. The set and album have distinct catalogue numbers. The drum date remains disputed; the Han fragment gets no invented exact year.
- Four institutional source citations in `data/sources.json`; no new coordinates, image files, or licence claims. Secondary coordinate verification remains unchanged. Updated `tests/app.test.tsx` for the new first period and to verify that the originals filter shows the drums but hides the album.
- [Coverage matrix](canonical-coverage.md) reconciles the owner's list against existing records and records priority gaps and out-of-model formats.
- Preview checks and the strict rejection of 18 drafts were verified locally. No UI source changed in this batch; no browser, live map, or Site deployment checks were run. Editorial review remains pending.
