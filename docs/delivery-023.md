# Delivery 023 | Canonical calligraphy coverage

- Base: `e7863f46fbda5edd900f2af67925919c4a668904`; branch: `codex/023-canonical-inscriptions`. The commit containing this report is the delivery revision.
- Added two work records and three physical records: the Palace Museum's original drum set and early Ming rubbing album, and one National Museum fragment of 熹平石经. The set and album have distinct catalogue numbers. The drum date remains disputed; the Han fragment gets no invented exact year.
- Four institutional source citations in `data/sources.json`; no new coordinates, image files, or licence claims. Secondary coordinate verification remains unchanged. Updated `tests/app.test.tsx` for the new first period and to verify that the originals filter shows the drums but hides the album.
- [Coverage matrix](canonical-coverage.md) reconciles the owner's list against existing records and records priority gaps and out-of-model formats.
- Preview checks and the strict rejection of 18 drafts were verified locally. No UI source changed in this batch; no browser, live map, or Site deployment checks were run. Editorial review remains pending.

## Owner-authorized trial deployment

- On 2026-11-18 the owner authorized merging the draft batch and deploying it for feedback, not approving the drafts for formal release. The task branch `234f209e5b93a41265c0263f39358c8a3ee998fc` was fast-forwarded into `main`. Preview-copy follow-up `6bcfd1f04e860eb24038646c26486d86a6bc9833` clarifies that only some records are drafts.
- On the follow-up, type, data, board, and 120 test checks passed. Local Vite builds hit a Windows esbuild temporary-file cleanup error; the isolated Sites checkout with the identical tracked tree built successfully. Its artifact carried the preview marker and no release manifest.
- Sites source `651494b91ed4d329b6965a90475d97654eb26761` was deployed successfully as version **6** to the [existing public URL](https://beitie-atlas.partedlute2.chatgpt.site/), with 45 works and 50 objects. Audience unchanged. Rollback: Sites version **5** (founding second edition). Browser rendering and mainland network reachability were not reverified.
