# Maintainer and AI handoff

This repository is the source of truth. You do not need access to the original
chat or WorkBuddy session to contribute. Read this page, the [Chinese README](../README.md)
or [English README](../README.en.md), [AGENTS.md](../AGENTS.md), and the
[iteration board](iteration-board.md) before editing.

## Current handoff, 2026-11-18

The public catalogue is running as a labelled trial on [Codex Sites v9](https://beitie-atlas.partedlute2.chatgpt.site/) and [GitHub Pages](https://yang963852.github.io/beitie-atlas/). It covers 71 works and 77 physical witnesses. See [delivery 027](delivery-027.md) for the publication, provenance additions, and rollback point. The last owner-approved formal edition is **Sites v5**, tag [v0.1.0-alpha.2](https://github.com/yang963852/beitie-atlas/tree/v0.1.0-alpha.2), with 37 works and 40 witnesses. Its manifest and approval are recorded in [delivery 021](delivery-021.md).

Start with the [draft-by-draft editorial review](editorial-review-025.md) and [reader verification and dependency checks](delivery-025.md). The current catalogue includes 22 places, four with coordinates. Readers can search in Chinese or English, open a physical witness directly, and use the place list when the basemap is unavailable.

## Setup and commands

Use Node 24 LTS and npm; the latest independent check used Node 24.16.0.
From this directory run `npm ci`, `npm run check`, then `npm run dev`.
On Windows use `npm.cmd` if shell script resolution causes trouble.
No key is necessary to read the corpus. See map-setup.md for optional setup.

`npm run build` builds a preview; `npm run preview` serves it locally.
`npm run check:release` checks publication eligibility without touching output.
`npm run check:map-key` probes the Tianditu key once (geocoding, not tiles), prints a masked
key, and classifies the answer as usable, invalid, or inconclusive; it reads `.env.local`.
`npm run release` builds an approved website artifact only after strict checks.
It is expected to fail on today's draft records. Never change review
states solely to make a release command succeed. See release.md for rollback.

## Where to make changes

| Goal | Start here | Relevant check |
| --- | --- | --- |
| App layout and selection | src/App.tsx, src/components/, src/styles.css | app.test.tsx and actual browser inspection |
| Interface copy or another language | src/i18n/en.ts, src/i18n/zh.ts, src/i18n/index.tsx | typecheck (both dictionaries share `Strings`) |
| Look and feel | docs/design-system.md, docs/delivery-003.md | mobile/desktop/zoom/keyboard acceptance |
| Names, dates and histories | data/works/, data/objects/ | check:data, seed-records.test.ts |
| Places and source records | data/places.json, data/sources.json | validate.test.ts, source review |
| Model or validation | src/domain/types.ts, validate.ts | validate/date/record tests |
| Map choice | docs/map-options.md: six basemaps, keys, datum, compliance | provider terms review |
| Map behavior | src/map/, src/components/MapPanel.tsx | map-sdk, map-view and map-markers tests plus live pilot |
| Publishing | scripts/release.ts, scripts/lib/, docs/release.md | release-gate.test.ts, check:release |

## Adding a physical object

1. Find primary sources and identify the actual physical object, not just a work title.
2. Add/reuse a source ID with publication/access dates and a locator.
3. Add/reuse its work record; create a distinct object record with a stable ID.
4. Add a collection assertion and independent provenance events. Keep missing
   dates/places null and preserve uncertain or conflicting claims.
5. Add a place only with justified resolution. Preserve coordinate provenance;
   unverified coordinates remain labeled. Last-known places are not current markers.
6. Keep review state draft until independent evidence review; run data checks.
7. Submit the change with sources, limitations and a reproduction/preview path.

## Collaboration without special tools

Anyone may clone/download this source and follow these instructions. For GitHub
collaboration, fork, create a small branch, make the change, run checks, and submit
a pull request. Owner invitations can grant direct access later; no collaborator
permissions have been assigned automatically. GitHub Issues can hold source
corrections and feature requests. Never post keys in issues or screenshots.

Implementers may be humans, Codex, WorkBuddy or another AI. Read the same rules,
change one bounded task, and provide real evidence. No agent name is an access
requirement. The owner can explicitly assign implementation to Codex.

## Historical baseline

The alpha.1 development snapshot and subsequent draft expansions preceded the first approved public edition. The 36-witness preview was authorized in task 015. Use the [iteration board](iteration-board.md) for the chronology, the [atlas workflow](atlas-workflow.md) for evidence requirements, and the [release runbook](release.md) for publication.
