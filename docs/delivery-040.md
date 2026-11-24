# Delivery 040 · Reading-room styling for the knowledge library

**Status: delivered locally; self-reviewed. The coordinator authorized the merge and the labelled preview.** Branch `feat/library-reading-style`, base `1d0de8f`.

## Scope

The library index (`#/library`, `#/library/people`, `#/library/notes`) and the work, person and note entries now share one printed-book setting. The atlas interface is unchanged.

- `src/components/knowledge-library.css`: rewritten around scoped `.reading-room` tokens — warm laid paper, Song serif prose, Kai captions, a vermilion seal accent, ruled dynasty shelves and a centred title leaf.
- `src/components/KnowledgeLibrary.tsx`: a catalogue masthead with library counts, a centred entry header, a seal in the brand, a colophon in the footer and redundant kind labels removed from the shelf rows.
- `src/components/ProvenanceEvents.tsx`: a recorded date is no longer printed twice when the source wording equals the formatted label (for example `1922年10月`).
- `docs/design-system.md`: records the reading-room direction and tokens.

Editorial records, the compiler, the versioned interface, the atlas routes and the light-theme decision are untouched.

## Design decisions

| Decision | Reason |
| --- | --- |
| Warm paper `#f7f1e4`, ink `#2a251e`, seal `#8f2f22` | A book surface and a single accent for navigation and selection. All text pairs measure at least 4.71:1 against the paper. |
| Song serif body, Kai captions, Palatino Latin | System-only stacks; no downloaded or redistributed font. |
| 38 rem prose column, 17–18 px, line height 2.0, 2 em indent | A comfortable Chinese reading measure; justified Chinese, left-aligned English. |
| Ruled shelves with Chinese catalogue numerals | The index reads as a catalogue; the count sits on the shelf rule. |
| Centred title leaf and a seal in the masthead | Identity without extra decoration; the seal is `aria-hidden`. |
| 44 px tabs, search, object buttons | Touch-comfort target; focus is a 2 px seal-coloured outline. |

## Commands and results

| Command | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd run check` | Passed: interface current; data 0 errors / 38 known warnings; 88 catalogue pages current; isolation and reproducibility (468 files) passed; board 40 rows; 18 test files / 156 tests; ZIP 473 files; preview build succeeded |
| Browser checks | Passed at 390 / 768 / 1440 and the zoom equivalent; no horizontal overflow; no page errors |

## Browser evidence

390 / 768 / 1440 CSS px and a 720 CSS px viewport at 2× device pixel ratio (200% zoom equivalent):

- [Index 1440](../screenshots/040-library-1440.jpg), [index 768](../screenshots/040-library-768.jpg), [index 390](../screenshots/040-library-390.jpg)
- [Work 1440](../screenshots/040-work-1440.jpg), [work 768](../screenshots/040-work-768.jpg), [work 390](../screenshots/040-work-390.jpg)
- [Zoom equivalent](../screenshots/040-zoom.jpg), [English index 1440](../screenshots/040-library-en-1440.jpg)

Observed:

- The sticky masthead stays at the top while the index scrolls.
- Keyboard focus reaches the work and person links, the tabs, the search field, the language switch and the witness buttons; Enter selects the Republican rubbing and the panel changes to its own record.
- The empty state renders with a working clear action; the active tab carries `aria-current="page"`.
- The English locale switches titles, lede, counters (Arabic numerals) and prose; no horizontal overflow at the tested widths.
- The page footer sits at the bottom on the short notes index.
- Timeline dates print the formatted label once; a differing source wording (for example `1928年三四月间`) still appears beside it. A focused regression test covers this.
- Text contrast measurements: lede, status, shelf count, index meta and inactive tab 4.71:1; active tab 7.18:1; search placeholder 4.65:1.

## Limitations

- Self-reviewed; no independent editorial review was requested for a visual change.
- 200% zoom was simulated with a 720 CSS px viewport at 2× device pixel ratio, not operated in a real 200% browser session.
- The Windows test machine renders system serif fallbacks; macOS and Linux will use their own Song/Kai fallbacks.
- No formal release: 127 drafts still block `npm run release`.

## Rollback

Revert the PR. The change is confined to the library stylesheet, the library component and one shared date-display guard; the atlas and the knowledge records are unaffected.
