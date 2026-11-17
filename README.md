# 碑帖之间 · Between Steles

An open-source atlas of Chinese calligraphic inscriptions and selected rubbings: what survives, where it is documented today, and how its history connects places.

**Status: local foundation, 2026-11-17. Task 001 is implemented and checked on one local Windows machine. It is not deployed, not reviewed by Codex, and not verified on mainland public networks.**

The Chinese project name is final. `Between Steles` is a working English title and `beitie-atlas` is the proposed GitHub repository name; name availability has not been checked.

## Confirmed direction

- Start with stone inscriptions and a small number of individually identified rubbings.
- Prioritize readers in mainland China while supporting an international audience.
- Use English for implementation, documentation, and the initial interface. Preserve Chinese original titles, aliases, inscriptions, and source references.
- The owner sets priorities. Codex designs and reviews. DeepSeek in WorkBuddy implements bounded tasks.
- Start with three real object records, then grow toward about ten works and twelve to fifteen physical objects when evidence supports them.

## Start here

- [可行性与协作方案](docs/可行性与协作方案.md): the owner's Chinese guide.
- [Engineering plan](docs/engineering-plan.md): scope, data model, architecture, and acceptance gates.
- [Source audit](docs/source-audit.md): researched sources, supported claims, and known gaps.
- [WorkBuddy task 001](tasks/001-foundation.md): first implementation brief, ready to copy into WorkBuddy.
- [Map pilot](docs/map-pilot.md): provider evaluation, credential model, and the remaining test plan.
- [Delivery report 001](docs/delivery-001.md): what was built, how it was checked, and what is still open.
- [Delivery report template](templates/delivery-report.md): the evidence required for review.

## Essential distinctions

A **work** is a named inscription or calligraphic composition. An **object** is a particular stone, rubbing, copy, or fragment. Locations and provenance belong to objects, not indiscriminately to a work title.

“Current location” means a source-supported collection or in-situ location, with a source access date. It does not mean live tracking, a verified storage room, or a guarantee that the object is on public display.

## Development and publication

The core is React 19, TypeScript, Vite 7, npm, and reviewed local JSON records. Node 22.22.2
was used for the recorded checks; `package.json` requires `>=22.12.0`. No runtime backend,
accounts, write API, or runtime AI generation is involved.

```bash
npm install          # once, from the project folder
npm run dev          # development server (prints its own address)
npm run check        # type check + data validation + tests + production build
npm run build        # type check + production build into dist/
npm run preview      # serve the built site locally
```

The map is optional and needs a public Tianditu browser key at build time. Without one the
site shows an explanatory panel and remains fully readable. A browser key is public after
building; `.env` cannot hide it. GitHub source hosting and public website hosting are separate
decisions, and the map provider plus host must pass a mainland-network pilot before they are
finalized. Mainland public access has not been tested.

## Open-source direction

The project is intended for public reuse. The recommended policy is MIT for independently written application code, a separate policy for original editorial data, and item-specific rights for third-party images. These licenses must be recorded before the first public release; this planning package does not grant rights to referenced third-party material.

Inspired by [jiangshan-map](https://github.com/DeanChensj/jiangshan-map). That repository uses [GPL-3.0](https://github.com/DeanChensj/jiangshan-map/blob/main/LICENSE). This project currently references its interaction ideas and does not include copied source code, maps, or artwork.
