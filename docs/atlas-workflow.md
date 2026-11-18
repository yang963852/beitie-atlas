# Atlas workflow

GitHub is the canonical source. Codex Sites hosts the interactive atlas preview. Its project identity and static output directory are recorded in `.openai/hosting.json`.

## What counts as a source

Three kinds of material show up when looking for a stele, and they are not interchangeable.

| Material | Citable? | How to record it |
| --- | --- | --- |
| Museum, library, cultural-heritage or government page | Yes | `kind: "web"` with the URL, access date and a locator that says which paragraph carries the claim |
| Printed catalogue, rubbing collection, excavation report | Yes, if you actually have the volume | `kind: "book"` with publisher, year and a page or entry locator. No URL is required and none may be invented |
| An app that collects inscriptions (掌上碑帖, 以观书法 and similar), a forum post, an encyclopedia entry | No | Use it as a lead. It tells you which stele to look up; it does not support a claim about that stele |

The distinction is not snobbery about apps. A work page in an app usually has no stable per-object address, no stated editorial method, and no way to tell whether its date came from the stone, a rubbing or another website. A claim needs a reader to be able to open the same evidence and see the same sentence.

What an app is genuinely good for: discovering which inscriptions exist, learning the conventional titles and aliases, and noticing that a stele you had never heard of is worth researching. Take the name from the app, then find a museum or government page, or the printed catalogue, that actually states the fact.

When two citable pages disagree — the year of a stele, the height of a stone, the number of characters — record both readings in the notes and leave the structured field empty. Do not average, and do not pick the figure that looks tidier. `docs/delivery-018.md` has four worked examples from this pass.

## From a source to a record

1. Record the task, base revision, acceptance checks, and implementer on the iteration board. Use one task branch and one implementation writer.
2. Open the institution's object page, catalogue, or other primary publication. Record its URL, publisher, access date, and claim locator. Cross-check conflicting collection, attribution, or date claims. Keep unknown fields empty and explain disputed evidence.
3. Enter the work and each physical object separately. Left-column groups follow the period of the represented inscription or calligraphic work. Within a group, known dates go first in chronological order. A later carving or rubbing keeps its own production date and holding.
4. Check the holding source and the point source separately. Plot only evidenced current collection or in-situ assertions joined to a coordinate for that same institution or site. Preserve the stated coordinate reference, source precision and verification. For missing coordinates, retain the place in the location list. A secondary coordinate supports orientation at institution/site scale and must display its unverified status.
5. Run `npm run check`. Inspect 390, 768, and 1440 CSS px plus 200% browser zoom for layout changes. Exercise keyboard focus, record and map selection, search, no coordinates, map-provider failure, and share-link refresh as applicable. Record the outcomes in `docs/delivery-NNN.md`.
6. Push the task branch to GitHub when requested and review it against `main`. Record the outcome and any blocking findings. The independent reviewer checks both source claims and implementation evidence before acceptance.

## Codex Sites preview

1. Verify the target audience before publishing a preview. The owner explicitly authorized the 36-record draft preview on the [existing public Site](https://beitie-atlas.partedlute2.chatgpt.site/) in task 015. Keep the draft notice visible.
2. Build from the selected GitHub revision with `VITE_BASE_PATH=/` and `VITE_RELEASE_MODE=0`. For live tiles use a Tianditu browser key restricted to the exact hosted origin and the provider quota. The browser bundle includes this key by design. Keep environment files, server keys, and Site write credentials out of Git and the archive.
3. Sync the source, package the matching `dist/`, and confirm that `index.html` has the `preview` marker before deployment. Record the Git revision, Sites version, URL, and actual audience.
4. Refresh a record permalink on the live hostname. Check the draft notice, place-to-record links, and actual Tianditu tiles and attribution. A keyless or failed map keeps the coordinate grid and place list available.

## Formal atlas release

Review the release corpus independently, then run `npm run release` and verify its marker and manifest. Check the actual host over HTTPS, mainland desktop and mobile networks, and the map provider's attribution and terms. Record the accepted revision and rollback version. Follow [the release runbook](release.md).
