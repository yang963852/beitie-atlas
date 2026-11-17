# Maintainer and AI handoff

This repository is the source of truth. You do not need access to the original
chat or WorkBuddy session to contribute. Read this page, README.md, AGENTS.md,
and the iteration board before editing.

## Baseline: v0.1.0-alpha.1

Initial collaborative development snapshot, 2026-11-17. React/TypeScript/Vite,
one work, two distinct physical objects, five places, four sources, four events.
All three work/object records remain draft. No image assets are in the corpus.

The application supports bilingual-name search, linked results/location panels,
object detail, source citations, provenance, hash links, and a no-map fallback.
The Tianditu adapter is covered with mocks; a real key/provider session has not
been verified. This is source ready for collaboration, not an approved public
historical atlas. Publishing source does not bypass the strict website-release gate.

## Setup and commands

Use Node 24 LTS and npm; the latest independent check used Node 24.16.0.
From this directory run `npm ci`, `npm run check`, then `npm run dev`.
On Windows use `npm.cmd` if shell script resolution causes trouble.
No key is necessary to read the corpus. See map-setup.md for optional setup.

`npm run build` builds a preview; `npm run preview` serves it locally.
`npm run check:release` checks publication eligibility without touching output.
`npm run release` builds an approved website artifact only after strict checks.
It is expected to fail on today's three draft records. Never change review
states solely to make a release command succeed. See release.md for rollback.

## Where to make changes

| Goal | Start here | Relevant check |
| --- | --- | --- |
| App layout and selection | src/App.tsx, src/components/, src/styles.css | app.test.tsx and actual browser inspection |
| Look and feel | docs/design-system.md, tasks/003-design-refinement.md | mobile/desktop/zoom/keyboard acceptance |
| Names, dates and histories | data/works/, data/objects/ | check:data, seed-records.test.ts |
| Places and source records | data/places.json, data/sources.json | validate.test.ts, source review |
| Model or validation | src/domain/types.ts, validate.ts | validate/date/record tests |
| Map behavior | src/map/, src/components/MapPanel.tsx | map-sdk and map-markers tests plus live pilot |
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

## Next work and known limitations

Task 002's local fixes passed independent checks; see review-002.md. Next is task
003: Apple-inspired visual refinement. Map activation/network testing and editorial
review are separate tasks. Current UI is still the foundation design. True browser
200% zoom, full keyboard traversal, live maps, mainland/overseas deployment, and
hosted deployment have not been independently verified in this baseline review.
The initial source snapshot's GitHub CI subsequently passed:
https://github.com/yang963852/beitie-atlas/actions/runs/44102927813.

Historical planning and delivery reports remain evidence of earlier states; when
they conflict with current status, follow this handoff and the iteration board.
