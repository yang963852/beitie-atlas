# Task 022 | A quiet reading column, inspectable map points, and a way to contribute

Base revision: `c692476`.

Owner direction, 2026-11-18:

1. The left column carries too much. List the objects by period, top to bottom, with only the name and the documented place on each row. The rest belongs in the right-hand record.
2. The map exists to show where things are. Every point must be clickable and must reveal which objects are held there, whether a surviving stone or a rubbing.
3. The corpus is too thin. Search further institutional sources, and provide a place where a reader can submit written information.

Allowed scope: the record list, the map panel's point card and its keyboard equivalent, the record detail's use of already-recorded work text, a contribution form that composes text and hands it to an external channel, and additional sourced records. No coordinate may be added without a citable point; no backend, account system, or browser storage is introduced. A submission is a lead, never a published claim.

Acceptance: period-ordered rows show one title and one place; clicking a map point (live basemap or schematic) lists every object at that place with its object type, and each entry opens the record; recorded work background is visible in the detail; the contribution form produces a complete, copyable text and opens the project's public issue page; new records pass `npm run check:data` with institutional or government sources.

Excluded: changing review states, publishing, adding coordinates, changing the host, or translating the existing corpus wholesale.
