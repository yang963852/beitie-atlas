# Learning content and media interface

Design proposal for tasks D-001 and D-002 (2026-11-25). This document records the audit of the current data model and a proposed interface for learning content and images. It changes no schema, compiler or component. Implementation needs the coordinator's approval and follows the data-contract rule in [the engineering plan](engineering-plan.md).

## 1. What the interface carries today

| Entity | Current shape | Learning use |
| --- | --- | --- |
| Work | `titles`, `aliases`, `attribution`, `compositionDate`, `script`, `background`, `notes`, `claims`, `sourceRefs`, `review`, optional `guide` | Identity, date, script, sourced background and caveats |
| Guide (inside a work file) | `state`, `timelineYear`, `people`, `objects`, `sources`, plus `## 导读` prose in Chinese and English | One authored reading path per work, no internal structure |
| Person / Note | `titleZh`, `titleEn`, `people`, `works`, `objects`, `sources`, `state`, `## 中文` / `## English` prose | Calligrapher pages and close-reading notes |
| Object | `workId`, type, production date, collection assertion, provenance events, claims, optional attribution | Witness-level record, independent of the work |
| Media | `objectId` (required), `assetPathOrUrl`, `creator`, `sourceRefs`, `license`, `credit`, `rightsEvidence`, `acquiredAt` | One image per physical object; currently 1 record, rendered only in the timeline |
| Relation | `from`, `to`, `type`, label, `sourceRefs`, `state` | Documented person-to-person links |

Verified against `data/index/knowledge-v1.json` on 2026-11-25: 117 works, 126 objects, 184 sources, 46 places, 1 media record.

## 2. Gaps for learning content

1. **A guide is a single prose blob.** The compiler reads `guide` plus the `## 导读` section (`readGuide` in `scripts/lib/knowledge-schema.ts`). It cannot express 概述 / 历史与流传 / 作品赏析 / 典型字例 / 临习指南 / 延伸学习 / 研究与文献 as separate, addressable sections, and cannot attach a character example or an exercise to one of them.
2. **No topic or path entity.** `libraryEntries` sorts by dynasty and date only. A 隶书专题 cannot state its own order, prerequisites or exercises, and the reader has no route that crosses periods.
3. **Media is object-only.** There is no work-level image, no role (overview, detail, single character, colophon), no alt text, no dimensions and no IIIF or zoom entry. `AtlasTimeline` is the only consumer.
4. **Search is a substring match** over titles, aliases, attribution names and linked person names (`matchesQuery`). There is no script or period facet, and simplified/traditional matching depends on aliases an editor happened to record.
5. **No teaching metadata.** Nothing records who a guide is for, what it assumes, or whether its practice advice was reviewed by a practitioner. Review state is per record, not per section.
6. **No cross-reference from a guide section to a character image or a comparison work.** The reader can only follow the flat `works` / `notes` lists.

## 3. Principles for the proposal

- `knowledge/` Markdown stays the only author source; the compiler stays the only read path.
- Additive and versioned: existing files must compile unchanged; the interface version moves when a field is added.
- Every learning claim keeps its source. Unknown stays null; no generated difficulty score, audience label or teaching advice.
- Learning structure is authored content, not interface copy.
- No new runtime: no CMS, server, search service or graph database.

## 4. Proposed content types

### 4.1 Guide sections (extend `Work.guide`)

```yaml
guide:
  state: draft
  timelineYear: 156
  people: []
  objects: [liqi-stele-...]
  sources: [src-...]
  sections:
    - id: overview
      kind: prose
    - id: transmission
      kind: prose
    - id: analysis
      kind: prose
    - id: characters
      kind: character-example
      media: [media-liqi-li, media-liqi-qi]
      characters: [禮, 器]
    - id: practice
      kind: practice
      audience: 初学隶书者
      reviewedBy: null
    - id: further
      kind: links
      works: [yiying-bei, shichen-bei]
    - id: research
      kind: prose
      openQuestions: true
```

Rules:

- `id` is stable ASCII and unique inside the guide; the reader URL can address `#/work/liqi-bei#characters`.
- `kind` is a closed list: `prose`, `character-example`, `practice`, `links`.
- The body stays Markdown: each section reads its prose from a `### <id>` subsection, so GitHub readers still see one document.
- A file with only `## 导读` compiles to one `prose` section; no author migration is required.
- `character-example` requires either `media` or an explicit open question in the work's `待考`; it may never imply an image the project does not hold.
- `practice` records `audience` as authored wording and `reviewedBy` as a person id or null. A null reviewer renders as 待专业审读, never as approved.

### 4.2 Topics and paths (new directories, after compiler support)

`knowledge/topics/<id>.md` — one subject, e.g. 隶书入门:

```yaml
titleZh: 隶书入门
titleEn: Beginning clerical script
state: draft
works: [liqi-bei, cao-quan-bei, zhangqian-bei, shimen-song]
people: []
sources: [src-...]
order: 10
sections:
  - id: aim
    kind: prose
  - id: sequence
    kind: work-list
  - id: exercise-01
    kind: exercise
```

`knowledge/learning/<id>.md` — a path that orders topics and works for a stated reader:

```yaml
titleZh: 隶书学习路径
titleEn: A clerical-script path
state: draft
audience: 已能稳定执笔、准备系统学习隶书者
steps:
  - topic: lishu-rumen
  - work: liqi-bei
  - note: reading-...
```

Rules: `steps` reference stable ids only, never URLs or titles. The reader page renders the order; the compiler rejects an unknown id, a duplicated step and a step cycle. Directories stay uncreated until the compiler ships the type.

### 4.3 Media (extend `MediaItem`)

```yaml
media:
  - id: media-liqi-li
    workId: liqi-bei          # at least one of workId / objectId
    objectId: null
    role: character          # overview | detail | character | colophon | comparison
    assetPathOrUrl: src/assets/media/liqi-li.webp
    width: 640
    height: 640
    altZh: 礼器碑“禮”字局部
    alt: The character 禮 from the Liqi stele
    creator: ...
    sourceRefs: [src-...]
    license: ...
    credit: ...
    rightsEvidence: ...
    acquiredAt: 2026-11-25
    linkOnly: true            # render an outbound link, never an <img>
```

Rules:

- At least one of `objectId` and `workId`; both may be present when a detail belongs to a witness of the work.
- `linkOnly` images are never bundled or hot-linked; the reader shows a labelled outbound link to the holding institution.
- `alt` is required for any renderable image; `altZh` follows the bilingual-pair rule where present.
- No media enters the interface without `license`, `credit` and `rightsEvidence`. `NOTICE.md` states the rule; the validator must enforce it.

## 5. Validation and release gates

Add to the existing checks, in the same PR that adds the field:

- Duplicate section ids, unknown media or work ids, and a `character-example` with neither media nor an open question.
- A `practice` section without `reviewedBy` is allowed in draft and flagged in `knowledge-status`; it blocks the strict release gate.
- `linkOnly` media without a non-empty `assetPathOrUrl` (used as the outbound URL) is an error.
- Bilingual headings keep the same order and count; a missing translation still falls back to the recorded language.
- `npm run check:reproducible` must still pass after the compiler change.

## 6. Cost, migration and rollback

| Step | Change | Evidence |
| --- | --- | --- |
| 1 | Schema + types add optional fields | Unit fixtures compile; no author file changes |
| 2 | Compiler reads sections, emits `interfaceVersion: 2` | `knowledge:compile` diff shows only added fields |
| 3 | Validator adds the rules above | Focused tests; draft and strict modes differ |
| 4 | Reader renders sections and media | 390/768/1440 and 200% zoom; reduced motion; no-image state |
| 5 | Topics and paths | One compiled 隶书 topic as the worked example |

Rollback: the interface file is generated, so reverting the compiler and regenerating restores v1. Author files remain valid because every added field is optional.

## 7. Non-goals

- No online course system, video pipeline, quiz scoring or progress tracking for signed-in users.
- No automatic generation of teaching advice, audience labels or aesthetic judgements.
- No full-text search index or graph service; the current in-browser search is measured before any replacement.

## 8. Acceptance of this proposal

The coordinator accepts the proposal when: (a) the seven-section guide structure is expressible without breaking existing work files; (b) `礼器碑` can carry the structure with its current sources; (c) media rights remain enforceable at build time; (d) the reader can still read every record with no image, no map and no translation.
