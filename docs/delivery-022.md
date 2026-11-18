# Delivery 022 | Quiet list, inspectable points, and a contribution channel

- Date: 2026-11-18.
- Base: `c692476eaabfc1376c914b25fd44087c783d29f4`. Branch: `task/022-reading-and-contribution`.
- Outcome: implementer self-check on a local task branch. Not merged, reviewed independently, published, or deployed. No review state was changed and no coordinate was added.

## Changes

- `src/components/ResultsList.tsx` and `src/styles.css`: each period-ordered row now carries one title and the documented place only. Type, date, attribution, and review badges were removed from the list; they remain in the record pane. A last-known holding says so instead of looking like a current collection.
- `src/components/MapPanel.tsx`: the point card now names the object type of every record at the selected place, on both the live basemap and the coordinate schematic. A labelled index of plotted points below the map makes the same selection reachable by keyboard and screen reader.
- `src/components/ObjectDetail.tsx`: the work's recorded `background` text is now rendered, marked with the language it was written in. No on-the-fly translation is invented.
- `src/domain/contribution.ts` and `src/components/ContributionPanel.tsx`: a page-level form composes a readable submission with a record link, source field, optional contact, and an explicit "lead, not verified claim" caveat. The reader may copy the text or open the project's pre-filled public issue page; the site sends and stores nothing. It opens from each record and from the footer.
- `src/i18n/{zh,en}.ts` and `src/domain/text.ts`: Chinese and English strings for the quieter list, map point hint and index, background note, and contribution form; a small language detector for recorded prose.
- Corpus: six sourced works and seven objects were added (泰山刻石, 琅琊台刻石, 衡方碑, 西狭颂, 石门铭, 孔子庙堂碑). All remain `draft`. Two new places are recorded with `coordinates: null`; the citable pages name an institution or site but give no surveyed point.

## Verification and limits

- `npm.cmd run check` passed with a project-local temporary directory: type checking, data validation, board check, 119 tests in 12 files, and the production build.
- Data validation reports 43 works, 47 objects, 21 places, 69 sources and 28 events, with zero errors. The one existing warning is the backlog of 26 records whose editorial notes have no Chinese counterpart; this task did not expand it.
- Seven of eight newly cited source URLs returned HTTP 200 in a spot check. `src-beilin-kongzi-miaotang` returned 502, as did the whole `beilin-museum.com` host and its pre-existing citations; that is a site availability issue, not a link invented for this task.
- The Windows temp directory refused esbuild's cleanup (`Access is denied`) on two builds. Building with `TMPDIR`, `TEMP` and `TMP` pointed at a project-local directory succeeded; no source change was needed.
- Not verified: 390/768/1440 px screenshots, 200% zoom, a click on a live Tianditu marker with a real key, mainland reachability, or an actual GitHub issue submission. The contribution channel was exercised through its composed text and URL in tests only. No Site version, release manifest, or public URL changed.
