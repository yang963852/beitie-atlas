---
name: research-entry
description: Prepare sourced Chinese Markdown for a Between Steles work, witness, calligrapher, documented relationship or close reading.
---

# Prepare one knowledge contribution

Open [the library](../../../knowledge/README.md), the [Chinese templates](../../../knowledge/_templates/) and the [evidence workflow](../../../docs/atlas-workflow.md). Identify the subject of the requested change and the single editable Markdown source. A person can submit the same material in the Chinese Issue form without a local checkout.

1. Record exactly which work, physical witness, person, relationship or observation the source identifies. Look for a stable ID and edition or collection number. Edit the record under `knowledge/works/`, `knowledge/objects/`, `knowledge/people/`, `knowledge/places/`, `knowledge/sources/` or `knowledge/notes/`. Do not edit `knowledge/catalogue/`, `knowledge/README.md` or reintroduce the retired legacy JSON corpus.
2. Find the institution or author, work title and passage or print edition and page. Connect each assertion to the part that supports it with a source ID and locator. A teaching-use claim also needs an identifiable teaching resource and evidence of its use. Record unresolved disagreements as separate claims or notes with the relevant locators.
3. Identify the author and edition behind a reading note. Point to a character, line or leaf that the reader can inspect. For a person-to-person relationship check both endpoints, the relationship type and direction, using the same cited relationship on both pages.
4. Preserve Chinese originals and aligned translations. Use `schemaVersion: 1`, retain contributor credit, and give item-level rights evidence for media. Run `npm run knowledge:compile && npm run knowledge:generate` and inspect the rendered article and the generated diff.

Hand off the Issue or PR, subject IDs, citations and outstanding editorial questions. Only an authorized reviewer can change publication approval.
