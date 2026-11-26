---
name: review-change
description: Review a Between Steles knowledge or web contribution for evidence, reader impact, regression risk and readiness for the coordinator's merge decision.
---

# Review a contribution

Read the assignment, base revision, changed content and [project rules](../../../AGENTS.md). Identify the implementer. An author or their agent reviewing their own work records **self-review**.

1. For knowledge, open the cited passage or page and confirm the exact work, witness or person. Check the date, roles, subject of each holding or provenance claim, and any uncertainty. For an observation check author, edition and locator. For a relationship check the endpoints and direction. Confirm that the edit is in the Markdown source, not a generated catalogue page or a retired legacy JSON record. Use the [editorial workflow](../../../docs/atlas-workflow.md).
2. For web changes, reproduce the affected normal and failure paths, existing share links and relevant accessible interactions. Confirm the page imports only the compiled interface and that a Markdown edit appears after `npm run knowledge:compile`. A new public content type needs a visible review status, strict release validation and matching manifest counts. The compiled interface `data/index/knowledge-v1.json` is excluded from text diffs; inspect generated data changes with `git diff --text`. Inspect the evidence and state what remains unverified.
3. Report blocking findings first. Give the subject ID or file, observed effect and a verification step for each. Preserve author credit, sources, media rights and open questions. Check that the proposed diff contains only scoped project material.
4. Apply the severity levels in the root rules. In the lightweight workflow, self-review is sufficient and the owner's merge is the acceptance. Record findings in the PR; no separate approval record is required.
