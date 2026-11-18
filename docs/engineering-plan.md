# Engineering plan

Version: 0.1, 2026-11-17. Owner-approved scope: steles first, selected rubbings; mainland China first; English-first implementation.

## Product contract

Visitors can identify a surviving physical object, find its documented collection or in-situ location, read its creation and provenance history, and inspect the evidence. The site does not promise exhaustive coverage, live location, or present-day exhibition availability.

The first complete slice uses three genuine object records. The first release targets approximately ten works and twelve to fifteen objects, contingent on source quality. Non-stone calligraphy is a future extension, not a requirement to finish version 0.1.

## Architecture

```mermaid
flowchart LR
  A[Sources and owner materials] --> B[Reviewed works, objects, places and events]
  B --> C[Data validation and build]
  C --> D[Static web application]
  D --> E[Map adapter]
  D --> F[List, details, timeline and source links]
  E --> G[Selected map provider]
```

- Use React + TypeScript + Vite, npm, a committed lockfile, and a documented supported Node version.
- Keep editorial data in versioned JSON files; no user accounts, business database, runtime AI generation, or write API in v0.1.
- Place provider integration behind a small map component boundary: points, selection, focus, and optional schematic event connections. Do not design a generic GIS framework.
- M0 first evaluates the official Tianditu integration and its current account conditions. AMap is the fallback candidate. Leaflet stable is suitable if the selected licensed tile integration supports it; do not assume that changing a tile URL makes every provider interchangeable.
- Pin tested stable versions. The Leaflet documentation homepage currently describes a beta; explicitly use stable documentation if selecting Leaflet.
- Keep language strings in `src/i18n/en.ts`. Preserve Chinese titles and aliases in data. English UI is not a network-compatibility measure.
- Use ordinary React state initially. Avoid premature state frameworks, CMSs, microservices, and search servers.
- Preserve canonical records independently of map vendors. A credential proxy, if required by the selected provider, is a separately documented deployment component, not an unnoticed expansion into a full backend.

Suggested implementation layout, to be created by WorkBuddy:

```text
src/components/       map, results, detail, timeline, source citation
src/domain/           types, validation, search, temporal helpers
src/map/              one selected provider adapter and configuration
src/i18n/en.ts        UI strings
data/works/           composition-level records
data/objects/         physical objects and embedded provenance events
data/places.json      reusable place records
data/sources.json     bibliography and web references
data/media.json       only approved reusable assets
tests/fixtures/       clearly synthetic edge cases, excluded from release data
docs/                 requirements, decisions, review reports
```

## Data model and invariants

| Entity | Minimum meaning and fields |
| --- | --- |
| Work | Stable ASCII `id`; Chinese and English titles; aliases; author roles and uncertainty; composition date; script; sourced background. |
| Object | Stable `id`; `workId`; object type; object-specific title; creation date; catalog number when available; survival status; relationships; current collection assertion; provenance events. |
| Place | Stable `id`; Chinese and English names; historical name where relevant; kind; coordinates or null; coordinate system; precision; evidence or geocoding method. |
| Event | Stable `id`; object association; type; date/range; place or null; original place wording; concise original summary; evidence links; certainty. |
| Source | Stable `id`; title; author/publisher; URL or bibliography; publication date when available; access date; relevant page/section. |
| Media | Asset path or approved URL; depicted object; creator; source; license and version; credit; rights evidence; acquisition date. |

Avoid a full scholarly ontology in v0.1. Events can live inside their object files. Use cross-file IDs only where they solve actual duplication.

Identity rules:

1. One work can have many objects; one marker represents a physical object or an explicitly labeled collection of objects.
2. Separate `original-stele`, `cliff-inscription`, `recarving`, `rubbing`, and `fragment`. Store relations such as `rubbing-of`, `recarving-of`, or `fragment-of`, with supporting references.
3. Creation of the composition, carving of the stone, production of a rubbing, excavation, and accession are different events. A Tang inscription does not make a Republican-era rubbing a Tang physical object.
4. Do not inherit the original stone's movements into a rubbing's provenance. Do not infer location from a collector's birthplace, office, seal, or colophon without an explicit argument and evidence.
5. Physical survival, evidence certainty, and editorial review state are separate. A lost original may have surviving derivatives; a draft record must not silently appear as reviewed.

Current collection assertion:

- Distinguish collection institution from documented physical location, temporary loan location, and display status.
- Store `locationKind` (collection institution / in situ / last known / unknown), `placeId` or null, `sourceRefs`, `sourceAccessedAt`, and `assertionAsOf` if the source provides a temporal anchor.
- Accessing an old source today does not update its assertion date. UI wording: “Documented collection” or “Location reported by source”, with a link and checked date.
- Mark coordinates for a collection institution as an institution marker, not the precise storage location of the object. Do not derive a branch, exhibition hall, or vault from a museum's general address.
- Unknown and last-known locations remain in the list. Last-known places are not presented as verified current markers.

Dates and uncertainty:

- Support year, bounded interval, approximate date, unknown, and disputed claims. Preserve original era/date wording.
- Use signed integer years when needed, with a documented no-year-zero convention; avoid JavaScript Date for historical sorting.
- Open interval endpoints are null; null means unknown/unbounded, not the year zero or today. A single known year is not an exact day.
- Each historical claim cites its own source and locator. Use explicit certainty labels such as documented / approximate / disputed / unknown rather than invented numerical confidence.
- Preserve conflicting accounts as separate sourced claims with an editorial note. Do not merge them into one precise fictional history.

Geography:

- The normalized geographic layer targets WGS84. Store explicit `longitude` and `latitude` names, origin CRS, coordinate source, and transformation provenance when applicable.
- Do not relabel GCJ-02, BD-09, CGCS2000, or an unknown CRS as WGS84. If no defensible conversion is available, preserve the source coordinates separately and withhold the canonical point.
- GeoJSON uses longitude then latitude. Leaflet interfaces commonly use latitude then longitude; convert at the adapter boundary.
- Precision is one of site / institution / city / region / unknown. A centroid is a representative point and must be labeled as such; do not invent a numerical accuracy radius.
- Historical toponyms need manual resolution and uncertainty labels. A modern geocoder alone does not establish a historical location.
- Default to a modern basemap. Do not add historical territorial polygons in v0.1.
- Known event places may be connected schematically, with a visible explanation. Unknown intervals remain gaps; never invent roads, transfer dates, or intermediate stops.

## UI behavior

- Desktop: search/results, map, and an object detail panel. Mobile: usable list and detail views plus map access; avoid squeezing three columns onto a phone.
- Display Chinese original title near the English title, object type, collection label, and provenance sources.
- Search English titles, Chinese titles, and aliases. Simplified/traditional aliases should be explicit where useful, not invented by a lossy title replacement.
- Distinguish “work period” from “object production period” in filters.
- Combine objects at the same institution into an expandable marker/list. Keep counts and filters consistent across map and list.
- Store selected object ID in a query or hash link; avoid history-routing paths that need unsupported host rewrites.
- A basemap error must not hide the corpus. Show an accessible error and keep the list, details, and source links functional.
- Make selection possible by keyboard and from the list. Color alone must not communicate certainty. Respect reduced motion and avoid heavy external font requirements.

## Data workflow

Candidate → source collection → draft → fact and rights review → approved → build checks → publication.

Record sources before writing the narrative. Summarize facts in original prose. AI output is a drafting aid, not evidence. Do not scrape or redistribute an entire museum catalog as a shortcut.

Owners can submit names, links, bibliographic pages, or photos in ordinary formats. Codex and the implementer handle structuring. Source gaps stay visible; a compelling narrative is not a reason to fill them.

For v0.1, review all publication records, not a random sample. Keep a future maintenance queue for stale links, collection changes, disputed claims, and image permissions. An update to collection data changes its review record, not unrelated dates.

## Release gates

Automated checks must catch meaningful risks:

- Duplicate IDs, missing references, missing evidence for published collection assertions and dated events.
- Invalid coordinate ranges/CRS, missing precision metadata, null converted to zero, and latitude/longitude inversion fixtures.
- Invalid date intervals; unknown and approximate dates must remain representable.
- Unreviewed entries and synthetic fixtures leaking into publication data.
- Bundled images without rights records; broken internal paths; unsafe URL protocols.
- Type check and production build; representative interaction checks for selection, search, filtering, history gaps, same-site objects, and direct-link refresh.

Do not build a giant test suite for cosmetic choices. Check the actual risks and a small end-to-end journey.

Manual acceptance:

1. Open the same tested build on mainland desktop broadband and mobile data without special network routing. Record date, network, browser, page loading, and map loading separately.
2. Check an overseas connection if available; otherwise label overseas verification outstanding.
3. Select the Yan Qinli original stone and the Palace Museum rubbing. They must have independent IDs, collection assertions, and histories.
4. Open an unknown-location record and a record with historical gaps; no false precise map point or continuous fictional journey appears.
5. Follow source links for each seed object's current collection and key events.
6. Refresh a share link under the deployment's actual base path. Verify mobile layout and keyboard access.
7. Disable/block the map provider: list and detail content remain usable.

M0/M1 local code checks can pass before external access checks. Report these as separate statuses; do not declare the mainland deployment gate passed from a local preview.

## Hosting, rights, and credentials

- GitHub is the planned public source host. Never publish the parent workspace; it contains unrelated personal material.
- Codex Sites hosts the owner-authorized interactive draft preview. Keep the atlas build portable and verify mainland access separately.
- Vite's base URL must match the deployment path. Codex Sites serves the project at the URL root.
- Browser-embedded configuration is public even when injected from a build environment. `.env` alone cannot hide a frontend secret. Use provider-supported domain restrictions, quotas, and a server-side proxy if required; document added costs.
- Preserve provider attribution and any required approval number. Do not use undocumented tile endpoints or remove official map annotations. Provider terms and host requirements must be checked for the selected release setup.
- Original code: MIT recommended. Editorial data: separate license only for material the project can license. Third-party media: per-item rights. Placeholders or links are acceptable when image reuse is not established.
- `jiangshan-map` uses GPL-3.0. Any later source reuse must be reviewed before selecting the resulting application license. Do not assume museum images inherit the code license.

## Collaboration

Codex owns requirements and independent review. WorkBuddy/DeepSeek owns the currently assigned implementation task. The user owns priorities, accounts, and experiential approval.

Use one task branch per bounded change after Git is initialized. Only one tool writes the implementation at a time. Deliver changed files, run instructions, actual command outcomes, unresolved problems, and the commit identifier when there is a commit. Unrun checks are “not run”, never “passed”.

Reviewer findings should include severity, file/location, reproduction, expected behavior, and a proposed fix direction. Fix findings on the same task before expanding scope. Update a short decision log when a reviewed architecture choice changes.

## Primary technical references

- [Vite static deployment](https://vite.dev/guide/static-deploy)
- [Leaflet stable documentation](https://leafletjs.com/reference-1.9.4.html)
- [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/)
- [GeoJSON RFC 7946](https://www.rfc-editor.org/rfc/rfc7946.html)
- [Tianditu official regional access guide](https://tianjin.tianditu.gov.cn/static/help/note.html) — recheck the chosen national/regional service's actual terms.
- [AMap security guidance](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)
- [AMap loading requirements](https://lbs.amap.com/api/javascript-api-v2/guide/abc/load)
- [AMap coordinate conversion](https://lbs.amap.com/api/javascript-api-v2/guide/transform/convertfrom)
