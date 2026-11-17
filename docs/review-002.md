# Independent review — task 002

Date: 2026-11-17. Reviewer: Codex. Source reviewed: `069a149`.
Outcome: accepted for the local engineering scope; external gates remain open.

Reran `npm.cmd run check`: type check, data validation, 61 tests in seven files,
and preview build passed on Node 24.16.0. Reran `npm.cmd run check:release`:
nonzero exit with exactly three DRAFT_IN_RELEASE findings, as expected.

Inspected the strict release sequence, loader cleanup/retry implementation,
shared current-location predicate, filtered marker flow, section navigation,
coordinate wording, and map setup guide. R1–R6 are addressed within the scope
of task 002. Existing tests exercise the principal regression cases. No new
live browser, real provider session, public-network check or editorial approval
was performed in this review. The positive release fixture is covered in tests;
the implementer's separate full positive-copy build was not repeated.

One behavior to settle during task 003: an explicitly selected detail can remain
visible when a later search excludes that object. This can be a useful pinned
detail, but should be indicated or cleared consistently; add a test for the
chosen interaction. It does not invalidate the corrected map/list filtering.

This acceptance permits the next local iteration and publication of an explicitly
labeled development source snapshot. It does not approve the draft corpus for
a production historical website.
