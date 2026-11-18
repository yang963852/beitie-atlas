# Between Steles · 碑帖之间

[简体中文](README.md) · **English**

**[Open the online atlas](https://beitie-atlas.partedlute2.chatgpt.site/)** · [Report an issue or suggest a source](https://github.com/yang963852/beitie-atlas/issues)

An interactive atlas of Chinese stone inscriptions and rubbings. Browse by historical period or search by name or catalogue number. Locate documented holdings on the map and open an object to read its provenance and references. Original stones, recarvings, and rubbings each have their own records. The map can filter for surviving originals.

The public preview contains **33 works, 36 physical objects, 15 places, and 54 sources**. Four mapped places account for 22 objects. Pins represent reference locations for institutions or sites. The records are marked as drafts pending editorial review for formal publication.

![Three-column atlas with a Tianditu basemap](docs/screenshots/011-live-map-1440.png)

*Local preview capture. The hosted atlas uses Tianditu and provides a coordinate grid and place list when the basemap is unavailable.*

## Run locally

Install Git and Node.js 24. Run these commands and open the address printed in the terminal.

```bash
git clone https://github.com/yang963852/beitie-atlas.git
cd beitie-atlas
npm ci
npm run dev
```

On Windows, `npm.cmd` also works. The corpus is readable without a map key. See the [Tianditu setup guide](docs/map-setup.md) to enable the basemap. Run `npm run check` before submitting changes.

## Stack and project documentation

React, TypeScript and Vite build the static app. JSON stores works, physical objects and sources. Tianditu supplies the basemap. Vitest and GitHub Actions run checks, and Codex Sites serves the public preview.

| Goal | Start here |
| --- | --- |
| Set up the project and find the right files or commands | [Maintainer and AI handoff](docs/START-HERE.md) · [Project rules](AGENTS.md) |
| Add a source, correct a holding, or submit code | [Contributing](CONTRIBUTING.md) · [Atlas workflow](docs/atlas-workflow.md) |
| Check progress and release criteria | [Iteration board](docs/iteration-board.md) · [Changelog](CHANGELOG.md) · [Release runbook](docs/release.md) |

Original code, documentation and editorial contributions are available under the [MIT License](LICENSE). Third-party material and map services carry their own terms. [Rights and acknowledgements](NOTICE.md)
