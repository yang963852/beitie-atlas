# Delivery 049 · Publish the 1.1 edition without draft labels

**Status: delivered — self-reviewed; open as [PR #57](https://github.com/yang963852/beitie-atlas/pull/57) at `86b660f`; coordinator acceptance pending.** Base `db5ae6b` (`workbuddy/work`, 2026-11-25). Branch `workbuddy/work`.

## What changed

- 188 draft states became `reviewed`: 81 works, 92 objects, 4 work guides, 8 people, 2 reading notes and 1 person relation.
- 485 workflow review-note lines were removed from work and object records. The substantive caveats remain in each record's 待考 and claims sections; the notes were process metadata, not reader content.
- 12 reader-facing H1 titles lost the （草稿） suffix, including the note and person templates.
- `src-beilin-xiao-beilin` now supports the 1928 Xincheng move in `knowledge/objects/yan-qinli-original-stele.md`; the corpus has no uncited source.
- The library, timeline and object detail no longer print 草稿/已审核; a draft label appears only when a record is actually a draft. The object review-note block is gone. The preview draft notice renders only when `hasDraftRecords()` is true.
- Package version is 1.1.0. The site shows 1.1 in the preview labels. The catalogue generator no longer writes 待审/已审 for reviewed records.
- README, CHANGELOG, release, start-here, contribution and map-setup documents describe the 1.1 edition instead of the internal beta.

## Audit before the change

| Check | Result |
| --- | --- |
| `npm run knowledge:compile` | 117 works / 126 objects / 46 places / 184 sources / 75 events; 0 errors |
| Data warnings | 44 `DATE_WITHOUT_ORIGINAL`; 1 `UNUSED_SOURCE` before the citation fix |
| Relative Markdown links in `knowledge/` | 0 broken |
| Reference lists (work, object, person, place, source, event, claim) | 0 missing IDs |
| Date ranges | 0 with start after end; unknown dates carry no years |
| Source URLs | 3 NPM records share one collection page but cite distinct colophons through `locator`; not a duplicate defect |
| Work/object titles | Shared titles occur where a work and its witness share a name; the two records remain separate |
| Bilingual prose | Compiler alignment checks pass; missing translations fall back to the recorded language |

This audit checks structure, references and internal consistency. It is not an independent scholarly reading of all 117 entries; the owner's publication decision supplies the editorial approval.

## Checks

| Command | Result |
| --- | --- |
| `npm.cmd run check` | Passed: typecheck, data, interface, knowledge, status, isolation, reproducibility, docs, 162 tests, package and build |
| `npm.cmd run check:release` | Passed: zero `DRAFT_IN_RELEASE`, zero uncited sources |
| `npm run knowledge:status` | 117 works (117 reviewed / 0 draft), 126 objects (126 / 0), 0 uncited sources |
| `grep -rn "草稿" knowledge --include=*.md` | 0 reader-facing occurrences; only `state: draft` in the five authoring templates |

## Limitations

- 44 `DATE_WITHOUT_ORIGINAL` warnings remain. They ask for the source's own date wording and are advisory, not release blockers; the dates themselves are unchanged.
- The Pages workflow still builds and deploys a preview with `VITE_RELEASE_MODE=0`. The 1.1 corpus passes the release gate, but a formal release artifact still needs `npm run release` and the workflow change described in `docs/release.md`.
- The site's 1.1 label describes the content edition; the preview build marker remains until that formal deployment.

## Not changed

- The schema still accepts `draft`/`reviewed`, and the release gate still rejects drafts. New contributions can start as drafts and are labelled in previews.
- No historical work, object, person, place, source or note prose was rewritten.
- No deployment was run and no tag was created.

## Rollback

Revert this branch's commits. The previous corpus is the `db5ae6b` state; no archive tag is required because no content was retired.
