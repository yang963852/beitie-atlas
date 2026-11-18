# Atlas workflow

GitHub is the canonical source. Codex Sites hosts the public project overview. Its project identity and static output directory are recorded in `.openai/hosting.json`.

## From a source to a record

1. Record the task, base revision, acceptance checks, and implementer on the iteration board. Use one task branch and one implementation writer.
2. Open the institution's object page, catalogue, or other primary publication. Record its URL, publisher, access date, and claim locator. Cross-check conflicting collection, attribution, or date claims. Keep unknown fields empty and explain disputed evidence.
3. Enter the work and each physical object separately. Left-column groups follow the period of the represented inscription or calligraphic work. Within a group, known dates go first in chronological order. A later carving or rubbing keeps its own production date and holding.
4. Check the holding source and the point source separately. Plot only evidenced current collection or in-situ assertions joined to a coordinate for that same institution or site. Preserve the stated coordinate reference, source precision and verification. For missing coordinates, retain the place in the location list. A secondary coordinate supports orientation at institution/site scale and must display its unverified status.
5. Run `npm run check`. Inspect 390, 768, and 1440 CSS px plus 200% browser zoom for layout changes. Exercise keyboard focus, record and map selection, search, no coordinates, map-provider failure, and share-link refresh as applicable. Record the outcomes in `docs/delivery-NNN.md`.
6. Push the task branch to GitHub when requested and review it against `main`. Record the outcome and any blocking findings. The independent reviewer checks both source claims and implementation evidence before acceptance.

## Codex Sites owner preview

1. Verify that the selected Site is owner-only before any hosted draft build. The public overview Site uses a separate artifact. Build from a clean checkout of the selected GitHub commit with `VITE_BASE_PATH=/`, `VITE_RELEASE_MODE=0`, and `VITE_TIANDITU_KEY` empty. This preview uses the coordinate grid and place list from the bundled, cited data.
2. Run the Sites source synchronization and package the preview `dist/` with the matching source revision. Use the owner-only deploy operation. Record the Git revision, Sites version and URL in the delivery report or a follow-up evidence commit.
3. Open the hosted Site and refresh a record permalink. Check marker-to-record links, the visible draft notice and the access mode. Roll back to a known owner-only version if a deployed preview regresses.
4. To test the real basemap on Sites, use a separate browser key restricted to the exact hosted origin and provider quota. A browser key is bundled with the application. A server key, the local environment files and Site write credentials stay out of the source and deployment archive.

## Public display on Codex Sites

1. Build the [public overview](https://beitie-atlas.partedlute2.chatgpt.site/) with `npm run build:overview`. The build stages only `site/index.html` and `site/styles.css` into `build/`. The public hosting manifest selects that directory.
2. Sync the reviewed overview source to the existing Site repository, package and deploy the exact same revision, and verify the `overview` marker and CSS at the live URL. Record the GitHub and Sites revisions separately. GitHub Actions runs repository checks.
3. Keep draft atlas builds in `dist/` for local or owner-only preview. Verify the audience before uploading any draft artifact.

For the public interactive atlas, review the release corpus independently, then run `npm run release` and verify its marker and manifest. Update the public Site manifest to select `dist/` for that reviewed release. Check the actual host over HTTPS, mainland desktop and mobile networks, and the map provider's attribution and terms. Record the accepted revision and rollback version. Follow [the release runbook](release.md).
