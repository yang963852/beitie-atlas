# Design system — a reading room for steles

Owner direction, 2026-11-17: take inspiration from Apple's simplicity without losing functionality. Owner direction, 2026-11-25: carry the knowledge library's paper, ink and seal setting across the whole product, including the opening desk. This document defines our own web design choices; it is not an Apple component kit or a claim of Apple affiliation.

## Principles

Write for a reader at the copying desk. Use concrete details from the inscription, sheet, colophon or seal. Distinguish the story told in the text from the transmission of the physical object. Keep navigation labels plain and allow the prose of the entry to carry the literary voice.

Show the artifact and its location first. Use strong hierarchy, consistent alignment, whitespace, and progressive disclosure. Keep search, selection, source access, and recovery discoverable. Do not equate simplicity with hiding necessary controls.

The opening camera descends from a misty classroom to the copying desk. The question floats above the practice sheet. Clicking the scene or pressing Enter brings the brush from the ink dish to the paper. After contact, the camera moves closer to the spreading wash before revealing the 访碑 atlas. Desktop readers move from earlier to later works horizontally in 编年; narrow layouts follow the same sequence vertically. A work opens in a reading dialog. Its individual witnesses link to their own extant map and sourced transmission narrative. Reduced motion enters immediately. Shared links land on the corresponding record or journey. The camera, brush, hand and ink-spread timing are the scene's core; visual work stays in lighting, colour, texture and the surrounding page chrome.

The 读帖 library remains the reference reading page. A work or person page leads with its title and authored text. Name the edition and observer for a close reading. Keep source, review state and a route back to the subject visible. Reading and following links must work when the subject has no map point, portrait or surviving witness. Present the beta edition label and a feedback route in the reading experience.

## Starting tokens (project decisions)

| Token | Initial value/use |
| --- | --- |
| Canvas | `#f4eddd`; a warm paper wash with a 5% laid-paper grain |
| Surface | `#fdf9ef`; paper leaves and cards |
| Main text | `#2a251e` |
| Secondary text | `#554b3d`; captions `#756a58` (at least 4.55:1 on the paper) |
| Accent | `#8f2f22`; vermilion seal, reserved for actions, selection and focus |
| Divider | `#d9ccb4`; soft `#e8decb`; decorative, not sufficient for all control boundaries |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px |
| Corners | 2–4 px cards, sheets and controls; doubles and hairlines carry the book structure |
| Body | 16 px, line height 1.65; reading prose 17–18 px at 1.95–2.0 |
| Secondary information | 12.5–14 px; avoid tiny 11 px reference paragraphs |
| Motion | 120–200 ms for state changes; the opening keeps its authored sequence; honor reduced motion |

Define reusable CSS variables and shared button/input states. Use Song serif for reading text, Kai for captions and small labels, and a local system sans only for technical or provider chrome. Chinese artwork headings may use a restrained local serif fallback. Do not download or redistribute fonts or icons without the relevant license; system fallback usage is sufficient.

## Reading-room palette (tasks 040–042)

The whole product now shares one printed-catalogue language. Warm laid paper, Song serif body text, Kai captions, a vermilion seal accent and ruled catalogue shelves carry the book metaphor. The 读帖 library is the reference implementation; the 编年 handscroll, 访碑 map, reading card, transmission page, contribution form and opening desk inherit the same tokens. Decorative devices must stay functional: rules separate shelves and facts, numerals order entries, the seal marks identity, and the accent marks navigation and selection.

The three entries — 访碑, 编年 and 读帖 — share one masthead and three-link section nav; only the content below the nav changes. The 编年 page is a handscroll: a dynasty ruler, a ruled paper band and compact paper slips on two banks; narrow layouts become a hanging scroll. The former WebGL river is retired. Names may be visually clamped to two lines on a slip, but the link text remains complete for assistive technology. A slip also carries a compact date, the credited hands and, only where the catalogue records a surviving original stele or cliff inscription, a vermilion 石 mark; the reading card carries the full date and attribution. The ruler follows the reader's position across the unrolled scroll, a red thread under the frame shows how far it has opened, and the reading desk below previews the last slip hovered or focused with its date, hands, catalogued witnesses and an open action. Narrow layouts hide the desk, because each slip already states its date and hand. Calligraphers carry a sourced `dynastyId`; 读帖 groups them by that period and orders them by their earliest dated work inside it.

| Token | Value/use |
| --- | --- |
| Reading paper | `#f4eddd` page, `#fcf8ee` lifted leaf |
| Reading ink | `#2a251e`; secondary `#554b3d`, captions `#756a58` |
| Seal accent | `#8f2f22`; active tab, section marks, 编年 markers, map markers, selection |
| Rules | `#e8decb` soft, `#d9ccb4`, `#c3b192` strong |
| Reading measure | 38 rem prose column; 17–18 px body, line height 2.0 |
| Paragraphs | 2 em first-line indent; Chinese justified, English left aligned |
| Catalogue | Chinese numerals in Chinese, Arabic numerals in English; dynasty shelf count at the right rule |
| Map plate | 4 px double rule, paper grid, seal markers; the provider basemap keeps its own cartography |
| Opening desk | paper-light scene, filmic tone mapping, vignette and grain over the canvas; the camera and brush core stay unchanged |

The vermilion accent is not reused for decorative flourishes. Focus remains a visible 2 px seal-coloured outline. The 390, 768 and 1440 layouts and the 200% zoom equivalent must keep readable measure, 44 px controls and no horizontal overflow. Dark mode remains out of scope.

## Information hierarchy

- Always visible: original title, English title, object type, collection/location status, useful date, and review/uncertainty status when material.
- One action away: full provenance, object relationships, source bibliography, coordinate precision and evidence, editorial notes.
- Developer-only: environment variable names, command output, validator paths, stack traces, and SDK configuration instructions. Keep these in documentation or a clearly developer-only panel.
- Draft and uncertainty notices remain concise and visible; visual simplification must not make tentative claims look certain.
- Sources use a compact “Sources (N)” control near the supported claim. Preserve specific citations when expanded. Collapse repeated details, not the evidence itself.
- User-facing map fallback: “Map unavailable. You can still explore the records.” Show Retry for recoverable failures. Owner setup instructions belong in the runbook.

## Layout and behavior

Desktop: compact search/results sidebar, map as primary space, selected object in a readable detail panel. Tablet: avoid three cramped columns; allow a detail sheet. Mobile: explicit Map/List access and a full-width detail view with a clear Back action; preserve query and selection.

Keep search results, map markers, counts, and map popovers consistent. Empty results need a clear reset action. Selecting a record should highlight/focus the associated valid point; unknown locations must remain usable without a point. Share-link refresh and browser Back must preserve understandable navigation.

## Accessibility and visual acceptance

Target WCAG 2.2 AA: keyboard operation, visible focus, names for icon buttons, no keyboard traps, semantic headings, text contrast of at least 4.5:1 (large text 3:1), and relevant control contrast of 3:1. Aim for 44×44 CSS px touch controls as a project comfort target, not a claim that WCAG AA universally requires 44 px.

Verify at 390/768/1440 CSS px and 200% zoom. Text must wrap without overlapping or being clipped; no horizontal page overflow (map interaction itself excepted). Test long bilingual titles, no results, missing dates, unknown location, map errors, and long citations. Screenshots show the actual tested build. Contrast and interaction need checks in addition to screenshots.

Dark mode, animation flourishes, and glass effects are later enhancements. Task 003 first delivers a coherent light theme and functional parity.

## References

- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout): visual hierarchy, alignment, adaptable layouts, progressive disclosure.
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/): accessibility checks.

Numeric tokens above are our starting design choices, not values mandated by Apple.
