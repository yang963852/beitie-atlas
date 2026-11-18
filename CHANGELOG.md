# Changelog

## Unreleased — task 017 defects and synchronization (2026-11-18)

Editorial notes that live on a work or a place are now shown, not hidden: 26 records carried
notes that no view rendered, 22 of them on works. They appear in the same "editorial notes and
gaps" section as object notes, and each one declares the language it is written in, so a Chinese
reader sees English marked as English rather than silently unlabelled.

The validator learned the rule that a translation and its source keep the same count and order:
a misaligned `notesZh` is now an error, and a missing translation is reported once as a backlog
instead of once per record.

`index.html` declares `zh-Hans` instead of `en`, matching the interface default and what a
crawler or a reader without JavaScript sees. The validation report is memoised, so a keystroke no
longer re-validates all 69 records.

Workflow: `npm run check` now runs `check:docs`, which fails when a task file or delivery report
has no board row, when a state does not open with a canonical keyword, or when an evidence link
does not resolve. CI gained concurrency cancellation, a timeout, commit-pinned actions, the
`.nvmrc` version, and a whitespace check; a manual `site-artifact` workflow builds and verifies
the directory the Sites upload consumes without holding Site credentials. 103 tests pass.

## Unreleased — public atlas preview and Chinese-first repository (2026-11-18)

- The public Codex Site serves the interactive atlas with a visible draft notice, a Tianditu basemap configuration and an originals-only map filter. See [deployment evidence](docs/delivery-015.md).
- The corpus covers 33 works and 36 physical objects across 12 periods, with 54 sources. See [the first source audit](docs/delivery-013.md).
- The GitHub homepage uses a concise Chinese README with a companion English version. Repository metadata points to the public atlas.

## Unreleased — task 004 live map verification (2026-11-18)

The Tianditu base map now renders with an owner-supplied browser key: 24 tiles fill a 569×734
column at 1440 px and both documented institutions carry markers. The key lives only in
`.env.local` and is not committed.

The live run exposed a real defect: the provider was created while the panel still used the
210 px fallback geometry, and because the SDK measures its container once, only the top third
of the column ever received tiles. The fallback geometry is now used only when no key is
configured, and the adapter observes the container and calls the documented `checkResize()`.
A second defect was test isolation — a local key changed what the suite asserted — so `test.env`
now forces an empty key.

`npm run check:map-key` also learned that `301012` means “this is a browser key”, not “broken
key”. 96 tests pass. Live verification is local only; mainland network behaviour is untested.

## Unreleased — task 010 Tianditu key self-check and setup runbook (2026-11-18)

`npm run check:map-key` makes one geocoding request and classifies the answer, so a key can be
judged before a browser is opened. It separates an invalid key (301001), a key-type or origin
mismatch (301013), and gateway codes such as 408 quota exhaustion; it prints only a masked key
and never writes it anywhere.

`docs/map-setup.md` is rewritten as a five-step runbook. The domain-whitelist instruction was
corrected to the provider's documented protocol-prefixed form (`https://example.com:8443/`), the
service and gateway error codes are tabulated, and each on-page failure state now says what to
check. 94 tests pass.

## Unreleased — task 009 periods, credited hands, and map options (2026-11-18)

Every work now carries a `dynastyId`, validated against a single table of 21 periods with an
explicit reading order. The list is grouped by period; a Republican rubbing of a Tang stele
sits with its stele instead of at the end. Coverage is 东汉 6, 南北朝 1, 唐 15.

Attribution expands from five roles to eight — `engraver`, `title-writer`, and `sponsor` join
the author and calligrapher — and gains bilingual notes. Newly documented: 张迁碑's carver
孙兴 and its donors 韦萌等; 玄秘塔碑's carvers 邵建和、邵建初; 多宝塔感应碑's carver 史华;
石台孝经's seal-script heading by 李亨; 开成石经's 郑覃 and its scribes 艾居晦、陈玠、段绛等;
曹全碑's donors 王敞、王毕等. Five Han steles now say 未署名 explicitly, because an empty
attribution array is a validation error: “nobody signed this” has to be a recorded claim.

`docs/map-options.md` compares six basemaps and records that the map is gated by coordinate
evidence as much as by a key. 83 tests pass.

## Unreleased — task 008 extant steles and unique rubbings (2026-11-18)

The corpus doubles to 22 works, 24 objects, 15 places, 26 sources, and 16 events, all draft.
Ten of the twelve new objects still have their original stone: 大秦景教流行中国碑, 开成石经,
石台孝经, 迴元观钟楼铭 (Xi'an Beilin), 九成宫醴泉铭 (Linyou, in situ), 晋祠之铭并序 with its 1772
recarving, 麓山寺碑 (Yuelu Academy), 大唐中兴颂 (Wuxi cliff), 瘗鹤铭 (five fragments, Jiaoshan).
Two record works whose stone is lost and whose only witness is a rubbing: 神策军碑 (unique Song
volume, National Library of China) and 温泉铭 (Tang rubbing, Bibliothèque nationale de France).

Each record names what its source does not say — weight, accession, condition survey, display
status, coordinates — in both languages. Conflicting numbers are kept side by side rather than
resolved: 大唐中兴颂 is 242 characters in one government page and 332 in another, and both are
recorded. The 1772 晋祠 recarving is a separate object so it can never stand in for the Tang
stone. 76 tests pass. The map did not grow: seven new places have no coordinate, because the
only batch values available were rounded to about 1 km and would overstate an institution
marker.

`validateDataset` now registers every object id before checking relationships, fixing an
order-dependent `MISSING_RELATION_TARGET` for a recarving that points at an original read later.

## Unreleased — task 007 Chinese-first interface, blue visual pass, corpus expansion (2026-11-18)

The interface now opens in Chinese with a `中文 / EN` switch stored in `localStorage`; `<html lang>`
follows the choice. All copy lives in `src/i18n/zh.ts` and `src/i18n/en.ts` behind one `Strings`
type, so a missing key is a compile error. Records may carry optional Chinese editorial fields
(`summaryZh`, `noteZh`, `notesZh`); rendering falls back to the recorded language and nothing is
translated at run time.

Visual system rebuilt on a light Apple-style blue accent (`#0071e3`): frosted sticky header, 18 px
panel radii, layered shadows, iOS-style segmented controls. Draft and unverified states keep their
own amber colour so a draft never looks approved.

The corpus grows from 2 to 12 objects (11 works, 8 places, 13 sources, 7 events), each citing an
institutional or government https page. Every object states in both languages what its source does
not say — dimensions, excavation, accession, display status, coordinates — and a test keeps the two
note lists the same length. Objects sort by carving year with undated records last. Map framing is
computed from marker bounds and a "show all points" control re-frames them; without a key the panel
is an explicit status panel with the exact `.env.local` line. 75 tests pass. Live map rendering,
mainland access, and independent review of this interface remain pending.

## Unreleased — task 003 interface refinement (2026-11-17)

Replaces the parchment foundation screen with a neutral, map-led interface: shared design
tokens, compact header, three-pane desktop, two-column tablet, and a mobile List/Map switch
with a full-width record view and Back action. Source citations and coordinate precision move
into “Sources (N)” disclosures; map fallback copy is reader-facing with provider diagnostics
behind a developer disclosure; empty searches offer a reset action. 63 tests pass. Live map
rendering, mainland access, and independent review of this interface remain pending.

## v0.1.0-alpha.1 — 2026-11-17

Initial collaborative source baseline. Includes the foundation, task 002 fixes,
61 passing tests, strict publication gate, independent reviews, project rules,
design system, onboarding, contribution instructions and MIT licensing with
third-party exclusions.

Research corpus: one work and two physical objects, all draft. Actual map/network
verification and Apple-inspired interface refinement remain next milestones.
No production website is included in this release.
