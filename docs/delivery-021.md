# Delivery 021 | Founding second edition

- Base: `be13d332692c601f12b59590f7ab0971dc735ae2`. Branch: `codex/021-founding-second-edition`.
- Editorial approval: on 2026-11-18 the owner confirmed publication of all 37 works and 40 physical objects, explicitly including the four additions after the 36-object preview. This is the owner's approval, not an independent audit performed by the implementer.
- Every work and object review now records that decision in both languages. Existing evidence notes are retained as pre-approval notes. No factual claim, source, coordinate, rights statement, or uncertainty changed.
- Local source checks: `npm.cmd run check` passed 112 tests, type checking, data and board checks, and preview build. `npm.cmd run check:release` passed with zero errors and the existing untranslated-notes warning.
- Release source: GitHub `2d378324afa74b7f3385af1981a5a866be6e97e8` (`v0.1.0-alpha.2`); Sites `df2a33a675ddff76eba52d27862524afac3a3dbd` with the identical tracked tree.
- `npm run release` (via its TSX entry point) passed in the Sites checkout. The archived manifest names that Sites source and records 37 works, 40 objects, 19 places, 62 sources, 25 events, and no media. The archive contains the static output and hosting manifest, not the source checkout, credentials, or environment files.
- Codex Sites reported successful production deployment of version **5** to the [existing public URL](https://beitie-atlas.partedlute2.chatgpt.site/) with no audience change. Rollback: version **4**, source `90477486297f33eea44277180b15fee8c149996a`.
- Tianditu returned a PNG tile (200) with the production referrer and refused the unrelated control origin (403) under the same request conditions. Browser tile rendering was not verified.
- The post-deployment HTTPS probe received Cloudflare 403 on both the home page and the release manifest; this does not establish a global outage. The mainland reachability limit and decision to retain this host are documented in [delivery 017](delivery-017.md). Mainland desktop/mobile access was not verified in this release.
