# Iteration board

Updated: 2026-11-19. One active implementation task at a time.

| Task | Outcome | State | Exit evidence |
| --- | --- | --- | --- |
| 001 | Foundation preview | Changes required — local checks pass; live map and public-network verification pending | See review-001.md; live map and public-network verification pending |
| 002 | Close review defects and establish release gate | Accepted — locally 2026-11-17; external gates still open | Independent 61-test check and strict rejection of 3 drafts; see review-002.md; live/external gates remain pending |
| 003 | Apple-inspired visual hierarchy and usability | Delivered — 2026-11-17; awaiting independent review | 63 tests; 390/768/1440 screenshots plus 720 px zoom equivalent; live map unverified; see delivery-003.md |
| 004 | Real map verification | Delivered — live locally 2026-11-18; awaiting independent review; mainland network untested | 96 tests; 24 tiles fill a 569×734 column at 1440 and 12 tiles a 356×454 column at 390; 2 markers; mount-sizing, test-isolation and mobile-button defects fixed; see delivery-004.md |
| 005 | Reviewed physical objects | Queued — partly superseded by 007; review still queued | Sources reviewed, coordinate basis checked, missing data handled |
| 006 | First public corpus and release | Queued | Rights, contribution docs, strict release checks, host tests, rollback revision |
| 007 | Chinese-first interface, blue visual pass, corpus expansion | Delivered — 2026-11-18; awaiting independent review | 75 tests; 12 objects from institutional sources; 390/768/1440 evidence; live map still needs a key; see delivery-007.md |
| 008 | Extant steles and unique rubbings | Delivered — 2026-11-18; awaiting independent review | 76 tests; 24 objects from 22 works; 12 new records, all draft; coordinates still limited to 2 places; see delivery-008.md |
| 009 | Period ordering and credited hands | Delivered — 2026-11-18; awaiting independent review | 83 tests; 22 works filed under 3 periods; 37 attribution entries incl. 5 explicit 未署名; map options in map-options.md; live map still needs a key; see delivery-009.md |
| 010 | Tianditu key self-check and setup runbook | Delivered — 2026-11-18; awaiting independent review | 94 tests; `npm run check:map-key` classifies 301001 / 301013 / gateway codes without printing the key; whitelist format corrected; live rendering still needs an owner key; see map-setup.md |
| 011 | Expand period coverage and connect the atlas to Codex Sites | Accepted — preview deployed 2026-11-18; two P2 findings addressed; merged in PR #1 | 36 objects across 12 periods, 4 points for 22 objects. See [PR #1](https://github.com/yang963852/beitie-atlas/pull/1) for the independent review, checks, and merge, and [delivery 011](delivery-011.md) for browser verification. |
| 012 | Publish the GitHub Pages project overview | Superseded — by 014 | See [task 012](../tasks/012-github-pages-overview.md) and [delivery 012](delivery-012.md). |
| 013 | Audit the corpus for public atlas publication | Accepted — owner approved the expanded corpus in 021 | See [task 013](../tasks/013-public-corpus-audit.md), [delivery 013](delivery-013.md), and [delivery 021](delivery-021.md). |
| 014 | Move the public overview to Codex Sites | Accepted — merged by the owner in PR #3 after a clean review; that review was Codex reviewing Codex, so an independent review of this change is still open | See [task 014](../tasks/014-sites-public-overview.md) and [delivery 014](delivery-014.md). |
| 015 | Restore the interactive atlas on Codex Sites | Delivered — Tianditu build deployed as Site version 4; rendered-tile inspection still pending | See [task 015](../tasks/015-restore-atlas-site.md) and [delivery 015](delivery-015.md). |
| 016 | Organize the GitHub project home | Accepted — documentation merged by the owner at `b85c0f4`; no code changed | See [task 016](../tasks/016-github-project-home.md) and [delivery 016](delivery-016.md). |
| 017 | Close the technical review's defects and codify synchronization | Accepted — merged by owner decision without an independent review; CI "Preview quality checks" passed on the branch head | 103 tests; 26 invisible notes now render; bilingual note rule added; board check and CI hardening in place; see [task 017](../tasks/017-defect-fixes-and-governance.md) and [delivery 017](delivery-017.md). |
| 018 | Simplify lookups, widen the corpus, define citable sources | Accepted — merged by owner decision without an independent review; CI "Preview quality checks" passed on the branch head | 106 tests; 37 works / 40 objects / 19 places / 62 sources; four new steles from institutional pages; printed sources allowed; apps defined as leads; see [task 018](../tasks/018-simplify-and-widen-corpus.md) and [delivery 018](delivery-018.md). |
| 019 | Report a refused basemap and answer the stack question | Accepted — merged by the owner's standing decision for direct merges, without an independent review | Refused tiles now produce a notice and the coordinate schematic; major dependency bumps stopped; stack rationale and growth table in the engineering plan; live tile-refusal check not run; see [task 019](../tasks/019-tile-failure-and-stack-rationale.md) and [delivery 019](delivery-019.md). |

| 020 | Fix artifact input handling and basemap recovery | Accepted — owner authorized the merge; no independent implementation review | 112 tests; subpath preview and draft gate verified locally; formal release remains separate. See [task 020](../tasks/020-artifact-and-basemap-followup.md) and [delivery 020](delivery-020.md). |

| 021 | Publish the founding second edition | Delivered — owner-approved corpus; Sites version 5 deployed, mainland access still limited | Formal release validated; 37 works and 40 objects; see [task 021](../tasks/021-founding-second-edition.md) and [delivery 021](delivery-021.md). |

| 022 | Quiet record list, inspectable map points, contribution channel | Accepted — code review findings addressed; owner authorized source merge only | 120 tests; seven new objects remain drafts. Live browser checks and editorial approval remain open. See [task 022](../tasks/022-reading-and-contribution.md), [delivery 022](delivery-022.md), and [review 022](review-022.md). |

| 023 | Prioritize common inscriptions and fill first gaps | Delivered — merged and deployed as owner-authorized trial preview; editorial review pending | Sites version 6; rollback version 5. See [task 023](../tasks/023-canonical-inscriptions.md), [delivery 023](delivery-023.md), and [coverage matrix](canonical-coverage.md). |

| 024 | Text catalogue of steles and manuscripts through the Qing | Delivered — owner requested merge and trial publication, editorial review pending | See [task 024](../tasks/024-bei-tie-catalogue.md) and [delivery 024](delivery-024.md) and the subsequent [reader checks](delivery-025.md). |

| 025 | Review the public catalogue, draft evidence and dependency candidates | Delivered — partially verified; Codex self-review, owner decides acceptance at merge | See [task 025](../tasks/025-catalogue-audit.md), [editorial review](editorial-review-025.md) and [delivery 025](delivery-025.md). |

| 026 | Study by inscription or modelbook and follow the surviving witness | Delivered — merged by owner instruction after self-review; public trial v8 deployed; editorial approval pending | [Task 026](../tasks/026-study-catalogue.md) and [delivery 026](delivery-026.md). |
| 027 | Scroll opening, sourced custody leads, and a second public preview | Delivered — merged under owner authorization after self-review; editorial verification pending | PR #13; Pages and Sites v9 both verified; see [task 027](../tasks/027-opening-and-provenance.md) and [delivery 027](delivery-027.md). |
| 028 | Enable the GitHub Pages basemap | Delivered — owner-authorized merge after self-review; public tiles verified | [Task 028](../tasks/028-pages-basemap.md), [delivery 028](delivery-028.md). |
| 029 | Yan Qinli bilingual reading and findspot diagram | Delivered — partially verified by Codex self-review; owner decides acceptance at merge | [Task 029](../tasks/029-yan-qinli-story.md) and [delivery 029](delivery-029.md). |
| 030 | Read the Yan Qinli timeline on the map | Delivered — partially verified by Codex self-review; owner decides acceptance at merge | [Task 030](../tasks/030-provenance-map.md) and [delivery 030](delivery-030.md). |
| 031 | Unroll a handscroll onto the copying desk and open record previews | Delivered — partially verified by Codex self-review; owner decides acceptance at merge | [Task 031](../tasks/031-desk-opening.md) and [delivery 031](delivery-031.md). |

## Iteration loop

Ready → in progress → delivered → reviewed → fixing (if necessary) → accepted.

Each task specifies goal, allowed scope, exclusions, input evidence, and observable acceptance. The implementer writes a delivery report; Codex writes the independent outcome. Record blocked portions separately and continue independent work. Local engineering, editorial approval, live provider behavior, and public network access are four distinct gates.

The state column opens with one canonical keyword — `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted`, `Superseded` — followed by an em dash and any detail. `npm run check:docs` enforces that vocabulary, requires every task file and delivery report to have a row, and rejects evidence links that do not resolve. Prose after the dash is free text; the keyword is not.

P1: material correctness/release blocker. P2: fix within its assigned iteration. P3: optional polish. Fix demonstrated risks first; do not postpone usable improvements for stylistic perfection. No automatic infinite review loop: new requests enter the backlog unless they affect current acceptance.

Before a new iteration record its base revision; after acceptance record its accepted commit. Do not overwrite evidence from previous rounds. Roll back by selecting a known accepted revision or reverting the specific change, never by deleting unexplained work.

## Decisions

- 2026-11-18: The public host stays Codex Sites. The owner decided this explicitly after the review measured a Cloudflare 403 from a mainland network; the reachability limit is recorded in [delivery 017](delivery-017.md) as a known limitation, not as a migration plan. Any future change of host is a separate owner decision.

- 2026-11-18: A review by the implementer's own tooling is a self-review. It can clear findings, but the board records that distinction and acceptance requires either an independent reviewer or the owner's decision at merge.

- 2026-11-18: Work-level and place-level editorial notes are reader-facing, not private scaffolding. They render in the detail view's editorial section with an explicit language attribute. A note that no view shows is a defect, not tolerated data; the 26 English-only notes (22 works, 4 places) stay visible until translated rather than being deleted.

- 2026-11-18: A source is citable when a reader can open the same evidence and see the same sentence: a museum, library, heritage or government page, or a printed catalogue cited by publisher, year and page. An inscription app (掌上碑帖, 以观书法 and similar) is a lead, never evidence. A book source carries no URL, and none may be invented for it.

- 2026-11-18: The national Tianditu console rejected a URL with a scheme and trailing slash. Its field examples use bare hostnames separated by ASCII commas. The older regional-console instructions do not apply to this form.

- 2026-11-18: The owner reinstated the three-column atlas on the existing public Codex Site and authorized the 36-record preview with a visible draft notice. The strict release gate still governs the formal atlas release.

- 2026-11-18: The owner selected Codex Sites as the public website and GitHub as the source host. The public Site serves the static overview while corpus review continues. Its `build/` deployment output is separate from the atlas output in `dist/`.

- 2026-11-18: GitHub remains the canonical source. The owner-only Codex Sites preview uses a preview build with a visible draft notice and a coordinate grid when the basemap is unavailable. Public release continues through the strict build gate.

- 2026-11-17: English implementation, Chinese original titles; mainland-first; steles plus selected rubbings.
- 2026-11-17: Owner requests Apple-inspired simplicity. Adopt design-system.md; implementation in task 003.
- 2026-11-17: Keep existing framework and npm; use lightweight rules and CI rather than adding formatting/lint frameworks during review.
- 2026-11-17: PowerShell 7 supported. Reviewer ran in PowerShell 7.6.9 provided by the Codex runtime; this does not verify the owner's separately installed executable.
- 2026-11-17: Publishing command is `npm run release`; `npm run build` stays preview-only. Release artifacts carry a `beitie-build-mode=release` meta tag and a counts manifest, and a failed release deletes `dist/`.
- 2026-11-17: Current map points require a `collection-institution` or `in-situ` assertion. `last-known` and `unknown` records remain readable but are never plotted as current markers.
- 2026-11-17: No datum transformation is applied to coordinates. The stored WGS84 values pass through unchanged; `docs/map-pilot.md` §3 records what official sources establish and what remains unresolved.
- 2026-11-17: Task 003 implemented on `task/003-visual-refinement` from `d015e1d` (implementation `555ff18`). The neutral map-led layout, mobile List/Map flow, progressive source and coordinate disclosures, and reader-facing map fallback replace the foundation screen. Two copy-driven test assertions changed with the visible labels; no functional assertion was removed. Live map rendering remains unverified.
- 2026-11-18: Owner direction overrides the earlier English-first interface choice. Chinese is now the default interface language, English stays one switch away, and the earlier decision line is kept for history. Implementation copy lives in `src/i18n/zh.ts`; data titles and source wording are untouched.
- 2026-11-18: The accent moves to `#0071e3` with a frosted header, larger radii, and softer elevation. This is a visual pass inside `docs/design-system.md`, not a new design system, and it does not add glass effects beyond the sticky header.
- 2026-11-18: Editorial prose gains optional Chinese fields (`summaryZh`, `noteZh`, `notesZh`). A missing translation shows the recorded language rather than a generated one; no claim is added by a translation.
- 2026-11-18: Corpus expanded to 11 works, 12 objects, 8 places, 13 sources, and 7 events, all draft. Every collection assertion cites an institutional or government page; missing dimensions, excavation history, accession dates, and coordinates are left `null` and stated in the record's notes in both languages.
- 2026-11-18: Object order is chronological by production year, undated last. Sorting by id put an arbitrary stele first and made the list read as unordered.
- 2026-11-18: The 国家文物局 page for 汉中市博物馆 is `http://` only, so the 石门颂 record cites the https 中国社会科学网 page instead. The https-only source test stays unchanged.
- 2026-11-18: Task 008 prioritises objects whose original stone still exists (10 of 12 new records) and adds two cases where only a rubbing survives (神策军碑, 温泉铭). Works with a surviving stone and a famous early rubbing are still recorded as separate objects, never merged.
- 2026-11-18: Where two cited pages disagree on a number (大唐中兴颂 242 vs 332 characters; 张猛龙碑 226 vs 280 cm), both readings are kept in notes and neither is asserted in the structured field. Silent averaging or picking would invent a fact.
- 2026-11-18: No new coordinate ships in task 008. The seven new places stay `null` until a source states a point and its precision; the Wikidata batch lookup returned values rounded to 0.01°, which is city-level and would overstate an institution marker. They are listed under “records without a map point” instead.
- 2026-11-18: `validateDataset` now registers every object id before checking relationships, so a recarving may point at an original that is read later in the glob order. The previous order-dependent failure was a validator defect, not a data error; a regression test covers it.
- 2026-11-18: Reading order is the period of the stone, not the date of the paper. `Work.dynastyId` is required, validated against one table, and ordered by an explicit `order` field because several periods overlap (Liao 907, Northern Song 960). A Republican rubbing of a Tang stele stays under the Tang; the row still shows 拓本 and its own date.
- 2026-11-18: An empty `attribution` array is now a validation error. A work whose maker is unrecorded must carry an explicit `unknown` entry with a bilingual note, so “nobody signed this” is a recorded claim rather than a blank field. Five Han steles use it.
- 2026-11-18: Attribution roles expand to include `engraver`, `title-writer`, and `sponsor`. The carver and the donors are not authors; collapsing them into one line would misattribute the 张迁碑 to the people who paid for it.
- 2026-11-18: `docs/map-options.md` records six basemap options and the finding that the map is gated by coordinate evidence as much as by a key: 13 of 15 places have no citable point, and Wikidata returns values rounded to about 1 km, below the `institution` precision the project requires. Geocoding through an approved provider is the only scalable path, and it needs the same key as the basemap.
- 2026-11-18: The setup runbook had the domain-whitelist format wrong. The provider's help page shows entries **with** a protocol prefix and an optional port (`https://example.com:8443/`), not a bare host, so `docs/map-setup.md` was corrected rather than left as a plausible guess.
- 2026-11-18: A key can be probed before a browser is opened, but a **browser** key cannot be settled that way. `npm run check:map-key` makes one geocoding request, prints a masked key, and separates an invalid key (301001) from a key-type mismatch (301013) and gateway codes such as 408 quota exhaustion. A real browser key answers 301012 (“this key is a browser key, use a browser”), which the tool now reports as a type confirmation with exit code 0, not as a failure.
- 2026-11-18: The provider must never be mounted into the short fallback box. `.map--fallback` is 210 px, and the SDK measures its container once, so a map created there kept loading tiles for a 210 px box after the column grew to 734 px (8 tiles over the top third). Only the unconfigured state uses that geometry now, and the adapter observes the container and calls `checkResize()`.
- 2026-11-18: Tests must not depend on the developer's `.env.local`. Adding a real key turned two map assertions from “not configured” into “loading”, so `test.env` now forces an empty `VITE_TIANDITU_KEY`; the adapter path stays covered by its own tests.
- 2026-11-18: Coordinates remain an evidence problem, not a key problem. The browser key is refused by the geocoding service (301012), so filling the 13 missing points needs either a second **server** key on the same account or per-institution citable sources. A key alone is not permission to invent points.
