# Delivery report

Task ID: 008 — extant steles and unique rubbings
Date: 2026-11-18
Base revision: working tree after task 007 (uncommitted); `npm run check` green at 75 tests before this round

## Result

The corpus doubles: **22 works, 24 objects, 15 places, 26 sources, 16 events**, all draft.
Twelve objects were added, ten of which have a surviving original stone. Two record the
opposite situation — the stone is gone and a single rubbing is what remains.

**Added**

| Object | Date | Holding | Type |
| --- | --- | --- | --- |
| 大秦景教流行中国碑（原石） | 781 | 西安碑林博物馆 | original-stele |
| 开成石经（原石） | 837 | 西安碑林博物馆 | original-stele |
| 石台孝经（原石） | 745 | 西安碑林博物馆 | original-stele |
| 迴元观钟楼铭（原石） | 836 | 西安碑林博物馆 | original-stele |
| 九成宫醴泉铭（原石） | 632 | 隋仁寿宫·唐九成宫遗址 | original-stele (in situ) |
| 晋祠之铭并序（唐碑） | 646 | 晋祠博物馆 | original-stele |
| 晋祠之铭并序（清乾隆摹刻） | 1772 | 晋祠博物馆 | recarving |
| 麓山寺碑（原石） | 730 | 岳麓书院 | original-stele |
| 大唐中兴颂（摩崖） | 771 | 浯溪摩崖石刻 | cliff-inscription |
| 瘗鹤铭（残石五方） | 514 (传) | 焦山碑林 | fragment |
| 神策军碑（宋拓孤本） | 宋拓；石佚 | 中国国家图书馆 | rubbing |
| 温泉铭（唐拓残卷） | 唐拓；石佚 | 法国国家图书馆 | rubbing |

**What the records do differently**

- **Gaps are the content.** Each new object carries three to five bilingual notes naming
  exactly what its source omits: weight, accession number, condition survey, display
  status, coordinates. A test enforces equal note counts in both languages.
- **Conflicting numbers stay conflicting.** The two Yongzhou/Hunan pages give 242 and 332
  characters for the 大唐中兴颂; both are kept and neither is asserted. 瘗鹤铭 keeps
  “93 characters, 11 incomplete” while noting that the original is given as 178 in one
  source and about 160 in another.
- **Recarving is not the original.** The 1772 晋祠 recarving is a separate object linked by
  `recarving-of`, with a note that it must not be used as evidence for the Tang surface.
- **Lost stones stay lost.** 神策军碑 and 温泉铭 record `survivalStatus: surviving` for the
  rubbing and make no claim about where a stone is, because there is none.
- **A disputed date stays disputed.** 瘗鹤铭 is dated 514 with `certainty: disputed` and an
  explicit note that the inscription carries only a cyclical year.

**Fixed on the way**

`validateDataset` validated relationships while still reading objects, so a record pointing
at an object later in the glob order failed with `MISSING_RELATION_TARGET`. Every object id
is now registered before any relationship is checked; a regression test covers the ordering.

## Changed files

| File | Purpose |
| --- | --- |
| `data/works/*.json` | 11 new work records |
| `data/objects/*.json` | 12 new object records |
| `data/sources.json` | 13 new sources, all https, all institutional or government |
| `data/places.json` | 7 new places, coordinates deliberately null |
| `src/domain/validate.ts` | Two-pass object id registration for relationships |
| `tests/validate.test.ts` | Regression test for forward relationship references |
| `tests/app.test.tsx` | List totals 12 → 24 |
| `docs/screenshots/008-desktop.png` | List, map column, and a record at ~1444 CSS px |

## Verification evidence

| Check | Result | Evidence or limitation |
| --- | --- | --- |
| Type check | Passed | inside `npm run check` |
| Data validation | Passed | 22 works / 24 objects / 15 places / 26 sources / 16 events, 0 errors |
| Automated tests | Passed | 76 in 8 files (one new validator test) |
| Preview build | Passed | 23.26 kB CSS / 383.04 kB JS |
| Desktop layout | Passed visually | 24 rows scroll, no overflow, right panel shows provenance |
| Mobile layout | Not re-run | No structural UI change this round; task 007 evidence stands |
| Character counts | Conflicting sources recorded | 大唐中兴颂 242 vs 332; neither asserted |
| Coordinates | 2 of 15 places | New places intentionally have none |

## Known issues and decisions

- **The map did not grow.** Seven new places have no coordinate. A Wikidata batch lookup
  returned values rounded to 0.01° (about 1 km), which is city-level accuracy; publishing
  that as an institution marker would overstate it and would require loosening the
  coordinate test. The places are listed under “records without a map point” instead, and
  coordinate completion is the next task.
- **九成宫 has no dimensions.** The Baoji bureau reply confirms the stone survives in the
  site but gives no measurement, condition survey, or shelter status. The record says so
  rather than quoting a size from an uncited catalogue.
- **Two museum pages are the only source for a whole object.** 迴元观钟楼铭 and 石台孝经 rest
  on one Xi’an Beilin page each; neither has been checked against the stone or a catalogue.
- **`stele-jinci-ming` and its 1772 recarving share one work.** That is deliberate: they are
  two physical objects of one text, which is the distinction the project exists to keep.
- **No image, no media record.** All twelve additions are text-only, as the owner asked.

## Reviewer outcome

For Codex to fill: accepted / changes required / partially verified.
