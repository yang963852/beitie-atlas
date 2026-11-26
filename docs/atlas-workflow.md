# Atlas workflow

GitHub is the canonical source and [GitHub Pages](https://yang963852.github.io/beitie-atlas/) is the sole website host. The Pages workflow publishes a labelled preview. Formal editorial approval is a separate decision from source merge.

## What counts as a source

Three kinds of material show up when looking for a stele, and they are not interchangeable.

| Material | Citable? | How to record it |
| --- | --- | --- |
| Museum, library, cultural-heritage or government page | Yes | `kind: "web"` with the URL, access date and a locator that says which paragraph carries the claim |
| Printed catalogue, rubbing collection, excavation report | Yes, if you actually have the volume | `kind: "book"` with publisher, year and a page or entry locator. No URL is required and none may be invented |
| Teaching resource, syllabus, published practice edition or named course | For the use it actually documents | Identify the author or issuing body, edition or course, date and passage. A publication establishes a particular example. Wider use needs evidence at that scale. |
| An app that collects inscriptions (掌上碑帖, 以观书法 and similar), a forum post, an encyclopedia entry | No | Use it as a lead. It tells you which stele to look up; it does not support a claim about that stele |

The distinction is not snobbery about apps. A work page in an app usually has no stable per-object address, no stated editorial method, and no way to tell whether its date came from the stone, a rubbing or another website. A claim needs a reader to be able to open the same evidence and see the same sentence.

What an app is genuinely good for: discovering which inscriptions exist, learning the conventional titles and aliases, and noticing that a stele you had never heard of is worth researching. Take the name from the app, then find a museum or government page, or the printed catalogue, that actually states the fact.

When two citable pages disagree — the year of a stele, the height of a stone, the number of characters — record both readings in the notes and leave the structured field empty. Do not average, and do not pick the figure that looks tidier. [Delivery 018](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/delivery-018.md) has four worked examples from this pass.

## From a source to a record

负责人研究材料：[领域本体、证据与五件碑帖试验](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/research/ontology.md)（已归档，现行录入仍依本页流程）。

1. Start from a reader's Issue or small PR. Claim a bounded subject, identify its source and agree any overlapping edits. Record scope, lead, expected evidence and review in the Issue/PR. Add numbered board and delivery records for milestones, migrations and releases.
2. Open the institution's object page, catalogue, or other primary publication. Record its URL, publisher, access date, and claim locator. Cross-check conflicting collection, attribution, or date claims. Keep unknown fields empty and explain disputed evidence.
3. Enter the work and each physical object separately in `knowledge/works/` and `knowledge/objects/`. Left-column groups follow the period of the represented inscription or calligraphic work. Within a group, known dates go first in chronological order. A later carving or rubbing keeps its own production date and holding. Run `npm run knowledge:compile` and `npm run knowledge:generate` to refresh the interface and GitHub reading copies.
4. Check the holding source and the point source separately. Plot only evidenced current collection or in-situ assertions joined to a coordinate for that same institution or site. Preserve the stated coordinate reference, source precision and verification. For missing coordinates, retain the place in the location list. A secondary coordinate supports orientation at institution/site scale and must display its unverified status.
5. Editors validate changes with `npm run check`. For changed layouts inspect 390, 768 and 1440 CSS px and 200% zoom. Exercise keyboard, selection, missing data, fallback and link refresh as applicable. A browser-only submitter can hand the material to an editor and CI. Link the outcome in the original Issue.
6. Open the checked PR against project `main`. Record the review outcome and any self-review, then resolve blocking findings. The coordinator decides the merge or explicitly delegates the specific PR. Sync local `main` to the project after merge. Record a blocked push or failed check with its actual result. [Contributing](../CONTRIBUTING.md)

## Authoring a library article

Use [the GitHub library](../knowledge/README.md) to find the correct input. Write the original article once in Markdown. Keep normalized works, witness holdings, events, places and bibliographic records in the same Markdown source tree. Generated reading copies and their indexes are derived from those records. Preserve stable IDs and existing witness share links. On GitHub, an editor can edit an authored Markdown page with the pencil and preview it before submitting a PR. The website, checks, timeline, map and download package read `data/index/knowledge-v1.json`, which is compiled from `knowledge/`; never hand-edit the compiled interface or a generated catalogue page.

For a work introduction, cite the writing context and identify the sources for any teaching-use claim. For a person, identify their evidenced role. For a relationship, record both parties, type, direction where meaningful, source and certainty once. For a close reading, name the observer and edition and point to a line, leaf or character another reader can inspect. Keep editorial claims and interpretations attributed. Preserve Chinese source wording and existing aligned translations, including when an article is available only in Chinese. Check review status, rights and links before proposing publication.

When moving an existing narrative, compare its text, language, source links, stable ID and review state before switching consumers. Remove superseded editable copies after parity is established. The website and GitHub should both lead readers to the same evidence.

The Chinese contribution guide carries the six source rules and the seven-part guide standard used by Chinese-language editors: [中文投稿与试读指南](CONTRIBUTE.zh-CN.md#来源六条硬规则).

## GitHub Pages preview

1. In GitHub repository **Settings → Pages**, set the publishing source to **GitHub Actions**. [The Pages workflow](../.github/workflows/pages.yml) runs on changes to `main` or by manual dispatch from `main`.
2. The workflow uses the host's project base path, runs keyless checks, then builds the labelled preview with the repository Actions secret `TIANDITU_BROWSER_KEY` when set. It publishes only `dist/` as an Actions artifact. The browser key is visible in the resulting bundle; restrict it to the authorized host and quota. Never commit the key or build output. The coordinate grid and location list remain usable without basemap tiles.
3. Verify the deployment's revision and URL, refresh an object permalink, and open a source from an object's timeline. Record the result and any mainland reachability gap. Do not report a queued or failed workflow as a public deployment.

## Formal atlas release

Review the release corpus independently, then run `npm run release` and verify its marker and manifest. Check the actual host over HTTPS, mainland desktop and mobile networks, and the map provider's attribution and terms. Record the accepted revision and rollback version. Follow [the release runbook](release.md).
