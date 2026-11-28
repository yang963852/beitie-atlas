# Between Steles · 碑帖之间

**English** · [简体中文](README.md) · [Project philosophy](docs/PROJECT.en.md) · [Markdown library](knowledge/README.md) · [Chinese contribution guide](docs/CONTRIBUTE.zh-CN.md)

**From a single model of calligraphy to a wider world.**

Between Steles is an open, collaborative knowledge project built by lovers of Chinese calligraphy.
Starting with the works we study and copy, we explore their creators, historical contexts, surviving originals, manuscript copies and rubbings. Through reading, writing, reflection and conversation, we seek a deeper appreciation of calligraphic beauty.
We believe calligraphy belongs not only to specialists and accomplished artists, but to everyone. It offers a way to discover history, appreciate beauty, express oneself and enrich one's inner life.
The project primarily serves beginners and calligraphy enthusiasts, bringing together reliable knowledge and resources for independent learning.

**Everyone contributes for the benefit of others, and everyone benefits from what others share.**
United by our love of calligraphy, we welcome all who wish to share their discoveries, experiences and reflections with those who follow.

[Visit the website](https://yang963852.github.io/beitie-atlas/) · [Read the project philosophy](docs/PROJECT.en.md) · [Take part](docs/CONTRIBUTE.zh-CN.md) · [Browse the library](knowledge/README.md)

The full statement lives only in the [project philosophy](docs/PROJECT.en.md) ([中文](docs/PROJECT.md)); this page and the other documents link to it rather than keeping another version.

## What the site offers

- **Start at the desk.** An open sheet of paper leads into the [atlas of surviving works](https://yang963852.github.io/beitie-atlas/#/collections); the plate on the desk opens the object record of the Shenlong copy of the Lanting Preface.
- **Read a work.** Begin with the [Yan Qinli Stele](https://yang963852.github.io/beitie-atlas/#/work/yan-qinli-bei): background, calligrapher and surviving witnesses are kept apart, and the original stone and the Republican rubbing carry separate histories.
- **Unroll the long scroll.** Browse [every work](https://yang963852.github.io/beitie-atlas/#catalogue) in the Chronology by the period of the inscription, from the pre-Qin era to the present.
- **Use the atlas.** Locate surviving witnesses by their present collection or in-situ site in the [atlas of surviving works](https://yang963852.github.io/beitie-atlas/#/collections); places without reliable coordinates stay textual rather than guessed.
- **Search the reading room.** Enter the [reading room](https://yang963852.github.io/beitie-atlas/#/library) by work, calligrapher, reading note or object record — for example [Yan Zhenqing](https://yang963852.github.io/beitie-atlas/#/person/yan-zhenqing).
- **Meet the project.** Open [About](https://yang963852.github.io/beitie-atlas/#/about) and [Join in](https://yang963852.github.io/beitie-atlas/#/join) from the opening desk or from the navigation.

**Current corpus**: the compiler counts works, physical objects, places, sources and events; the generated [knowledge status page](docs/knowledge-status.md) is the reference (`npm run knowledge:status`). This page does not restate corpus counts, which change with every content batch.

## Three editorial rules

- **Works and objects stay separate.** An original stone's excavation history is recorded once, in the stone's own record, never copied onto a rubbing or a recarving.
- **Conflicts stay visible.** Contradictory accounts are recorded side by side, each with its source, rather than resolved by picking the tidier claim.
- **Unknown stays unknown.** Years, coordinates and current teaching use without a source are left blank and marked as open questions.

See the [editorial workflow](docs/atlas-workflow.md) for research and review steps. We offer knowledge and guidance for study, not a substitute for education between people; technology serves human learning, expression and collaboration.

## Contribute

The project exists because people share a love of calligraphy. Anyone may take part, whatever their stage of learning, professional background or technical ability; ordinary readers come first, the technical workflow follows.

| Goal | Start |
| --- | --- |
| Share an observation, a piece of experience or a question from copying | Write one thing in the [knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml); Chinese only is fine. See the [Chinese guide](docs/CONTRIBUTE.zh-CN.md) |
| Add a collection source or correct a line of text | Edit the Markdown in a browser, or use the [knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) with a source and a specific passage, page or catalogue number |
| Report a reading, navigation or interaction problem | Follow the [five-minute read-through](docs/CONTRIBUTE.zh-CN.md#五分钟试读), then use the [feedback form](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) |
| Cannot use GitHub | Prepare your text and ask someone who uses GitHub to submit it for you, or leave a note in an existing public issue; the maintainers help organise what is shared in public |
| Join the conversations and activities described on About and Join in | Use the open resources for your own study, research and cultural activities, or share what you find in a public issue |
| Change the website or compiler | Fork, work on a branch and open a PR against `main`; read [setup and handoff](docs/START-HERE.md) first |
| Reuse it for your own library | Fork, replace `knowledge/`, the site title and the deployment address; the MIT licence applies, and `NOTICE.md` keeps third-party rights separate. See [setup and handoff](docs/START-HERE.md#reusing-this-repository) |

**What the submission channel actually does**: the site is a static GitHub Pages site. The "Add or correct information" panel on a record composes text you can read and copy, and, if you choose, opens a pre-filled GitHub issue. The page stores and sends nothing itself: there is no in-site submission backend, no account system and no dedicated public contact address. An editor checks an openable source before anything is added.

Send a pull request directly; an Issue is optional, and Chinese explanations are welcome. [Contributing guide](CONTRIBUTING.md) · [Chinese guide](docs/CONTRIBUTE.zh-CN.md)

## How the library reaches the site

`knowledge/` Markdown author sources → read-only compiler → `data/index/knowledge-v1.json` → website, timeline, map and download package.

- `knowledge/` is the only author source; edit it directly on GitHub or with any Markdown editor.
- The website never reads author Markdown, and the compiler never imports web code; `npm run check:isolation` enforces the boundary.
- Compiling the same input twice produces byte-identical output, verified by `npm run check:reproducible`.

More: [architecture and data model](docs/engineering-plan.md#data-model-and-invariants) · [architecture guide with five diagrams](docs/engineering-plan.md#负责人架构导读)

## Repository layout

| Path | Contents |
| --- | --- |
| `knowledge/` | Author sources: works, objects, people, places, sources, reading notes |
| `docs/PROJECT.md`, `docs/PROJECT.en.md` | The single authoritative philosophy, in Chinese and English |
| `scripts/` | Compiler, checks, library packaging and release gate |
| `src/` | React site: opening desk, reading, chronology, map, library, About and Join in |
| `data/index/knowledge-v1.json` | Versioned interface produced by the compiler; the site reads only this. Rebuilt at build time, not committed |
| `docs/` | Current operating documents: setup, editorial, design, architecture, release, map and archive |

## Run locally

Node.js 24 (see [.nvmrc](.nvmrc)) and npm are required; on Windows PowerShell use `npm.cmd`.

```sh
git clone https://github.com/yang963852/beitie-atlas.git
cd beitie-atlas
npm ci
npm run dev
```

`npm run dev` compiles the library, generates the catalogue and packages the ZIP before starting Vite. Run `npm run check` before submitting: type, data, interface, isolation, reproducibility, documentation, tests and a preview build in one pass. The Tianditu basemap is optional; without a key the map falls back to a coordinate schematic — see [map setup](docs/map-setup.md).

## Status and limitations

- The site is public on GitHub Pages, and every checked merge to `main` is deployed, so the live content may be newer than the latest formal edition. The interface footer and the library colophon show the formal edition (the `version` in `package.json`) together with the current build revision. Every entry has passed the release gate and editorial confirmation. Open questions and conflicting accounts stay in each record's 待考 and claims sections rather than being resolved by assertion. See the [release runbook](docs/release.md) for editions, tags and rollback.
- The live basemap depends on the Tianditu network service; without a key, or when tiles are refused, the map shows a coordinate schematic. Observed access varies by network and must be tested locally; the project does not guarantee it.
- Quotations, collection images and map services retain their own terms.

## Licence and credits

Original code, documentation and original editorial content are MIT-licensed. [License](LICENSE) · [Rights and attribution](NOTICE.md)

[doublett523](https://github.com/doublett523) designed and implemented the writing-desk opening, ink-river chronology, collection map and library editing links. [Contribution #29](https://github.com/yang963852/beitie-atlas/pull/29)
