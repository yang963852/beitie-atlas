# Task 049 | Publish the 1.1 edition without draft labels

Base revision: `db5ae6b` (`workbuddy/work`, 2026-11-25). This task clears the draft layer from the reader-facing library and records the 1.1 edition.

## Outcome

A reader opens the library and sees works, calligraphers and witnesses as published entries. No entry carries a 草稿 or 已审核 label, no work title ends in （草稿）, and the preview draft notice is absent while the corpus has no drafts. `npm run check:release` passes on the author corpus.

## Scope

- Set every author record to `review.state: reviewed`: works, objects, work guides, people, reading notes and the person relation.
- Remove workflow review notes from works and objects; uncertainty stays in each record's 待考 and claims sections.
- Remove （草稿） from reader-facing H1 titles, including the authoring templates.
- Cite `src-beilin-xiao-beilin` for the 1928 Xincheng move in the Yan Qinli original stone, resolving the only uncited source.
- Remove the per-entry status labels and the object review-note block from the React reader; show a draft label only when a record really is a draft.
- Show the preview draft notice only when `hasDraftRecords()` is true.
- Set the package and interface edition to 1.1, regenerate the catalogue, library index and status page, and update the reader-facing documentation.
- Do not change the compiler's release gate, the schema's draft capability, or the Pages deployment workflow.

## Evidence

- Baseline: 117 works / 126 objects / 184 sources; 188 draft states (81 works, 92 objects, 4 guides, 8 people, 2 notes, 1 relation) and 182 occurrences of 草稿 in author files.
- Baseline checks: 0 data errors, 44 `DATE_WITHOUT_ORIGINAL` warnings, 1 `UNUSED_SOURCE`.
- The 1928 event's own summary already describes the Xincheng 小碑林; the museum page for 宋联奎《小碑林记》 records that 宋哲元 established it and that the 颜勤礼碑 was its most valued stone.

## Acceptance

- `npm.cmd run check` passes, including the new library regression test that no published work or witness prints 草稿 or 已审核.
- `npm.cmd run check:release` passes with zero `DRAFT_IN_RELEASE` errors.
- `grep -rn "草稿" knowledge --include=*.md` returns only the authoring templates' `state: draft` values, not reader-facing text.
- The generated catalogue and `knowledge/README.md` carry no 待审/已审 labels.
- `docs/knowledge-status.md` reports 117 reviewed works, 126 reviewed objects and 0 uncited sources.

## Handoff

Self-reviewed PR [#57](https://github.com/yang963852/beitie-atlas/pull/57) from `workbuddy/work` to `main`. The coordinator reviews the diff and decides the merge. Formal release deployment remains a separate step in the release runbook.
