# Delivery 035 | GitHub Pages as the sole public host

Branch `codex/035-github-pages-only`, based on `6ef120defcdce550109dbb5abf04891b7b633f38`. Self-review by Codex. The owner decides acceptance at merge.

Updated the two READMEs, `AGENTS.md`, `CONTRIBUTING.md`, the engineering plan, maintainer handoff, atlas workflow, release runbook, map setup, and iteration board. Removed `.openai/hosting.json` and `.github/workflows/site-artifact.yml`. The existing `.github/workflows/pages.yml` serves the labelled draft preview and the formal release gate still applies. The previous formal edition remains documented in [delivery 021](delivery-021.md).

Before the cutover, the Pages homepage returned HTTP 200 and referred to its bundle under `/beitie-atlas/`. The HTML declared preview mode. [The baseline Pages run](https://github.com/yang963852/beitie-atlas/actions/runs/44497091563) succeeded for the base revision.

The GitHub repository website field now points to [GitHub Pages](https://yang963852.github.io/beitie-atlas/). The former Site was restricted to the owner, retaining its nine saved versions. An anonymous request to the old hostname returned HTTP 401. The Pages bundle returned HTTP 200.

Local verification: `npm.cmd run check` passed with the Pages base path and a keyless build. Type checking, data validation, the iteration board, 124 tests, and the preview build passed. The corpus retains 40 validation warnings and the build retains the existing bundle-size warning. The built HTML uses the preview marker and the project asset path. `git diff --check` passed. This task changes hosting and documentation, so viewport, zoom and live map checks were outside this verification. Mainland access was not tested.

`npm.cmd run check:release` returned exit code 1 with draft records, as expected for the public preview.
