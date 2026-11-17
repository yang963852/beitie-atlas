# Design system — calm, useful, content-led

Owner direction, 2026-11-17: take inspiration from Apple's simplicity without losing functionality. This document defines our own web design choices; it is not an Apple component kit or a claim of Apple affiliation.

## Principles

Show the artifact and its location first. Use strong hierarchy, consistent alignment, whitespace, and progressive disclosure. Keep search, selection, source access, and recovery discoverable. Do not equate simplicity with hiding necessary controls.

The existing parchment-colored three-column audit screen is a foundation preview, not the approved visual direction. Prefer a neutral gallery/map application: compact header, quiet sidebar, generous map, readable detail sheet. Avoid ornamental ink textures, oversized promotional headings, pervasive glass effects, and excessive nested cards.

## Starting tokens (project decisions)

| Token | Initial value/use |
| --- | --- |
| Canvas | `#f5f5f7` |
| Surface | `#ffffff` |
| Main text | `#1d1d1f` |
| Secondary text | `#515154`; verify actual background contrast |
| Accent | `#0066cc`, reserved for actions/selection |
| Divider | `#d2d2d7`; decorative, not sufficient for all control boundaries |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px |
| Corners | 8 px controls; 12–16 px panels; avoid pills everywhere |
| Body | 16 px, line height 1.5–1.65 |
| Secondary information | 14 px; avoid tiny 11 px reference paragraphs |
| Motion | 120–200 ms for state changes; honor reduced motion |

Define reusable CSS variables and shared button/input states. Use system sans-serif stacks including Chinese fallbacks. Chinese artwork headings may use a restrained local serif fallback. Do not download or redistribute Apple fonts or icons without the relevant license; system fallback usage is sufficient.

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
