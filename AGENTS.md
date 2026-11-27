# Public agent contract

This file is the tool-independent contract for any agent or contributor working on this repository. It says what must not break, not how any particular assistant should think. Read the assigned Issue or [task brief](templates/task-brief.md), then the documents named for that kind of work.

## Ten rules

1. Edit only the files in the assigned scope. If the task requires a file outside it, stop and report instead of widening the task.
2. Never hand-edit a generated file. `knowledge/catalogue/`, `knowledge/README.md` and `data/index/knowledge-v1.json` are compiler output.
3. Every factual claim carries a source, and a specific locator when the source is not itself the passage.
4. Unknown stays unknown, and conflicting sources may coexist. Do not pick a winner, and do not invent a date, coordinate, catalogue number, provenance link or licence.
5. Work and physical witness stay separate. Never copy provenance between related objects.
6. Do not add a dependency, framework, backend, provider or schema field unless the task requires it.
7. Never commit credentials, local agent configuration, personal paths, private workspace files or build products.
8. Run the checks required for the paths you changed. Never delete or weaken a check to make a change pass.
9. Stop after opening or updating the pull request. Only the maintainer decides merge and publication.
10. The pull request states the changed scope, the evidence or reproduction, the commands actually run and what remains unresolved.

## Where the detail lives

| Question | Read |
| --- | --- |
| How do I contribute, and how is a change reviewed? | [CONTRIBUTING.md](CONTRIBUTING.md), [Chinese contribution guide](docs/CONTRIBUTE.zh-CN.md) |
| How do I set up a clean clone? | [Member and agent handoff](docs/START-HERE.md) |
| What may I claim about a work, a witness or a date? | [Editorial workflow](docs/atlas-workflow.md) |
| Where does a change belong, and how is it checked? | The table below |
| How is a release built and verified? | [Release runbook](docs/release.md), [archive index](docs/archive.md) |

## Read by task

Do not read the whole repository for a bounded change. Read the matching row, then the target record and its cited sources.

| Assignment | Read first | Do not change |
| --- | --- | --- |
| Edit a work, object, person, place, source or note | [Editorial workflow](docs/atlas-workflow.md), [Chinese templates](knowledge/_templates/), the target Markdown and its sources | Compiler, UI, generated catalogue |
| Develop the website | [Design system](docs/design-system.md), [data boundary](src/domain/data.ts), the compiled interface shape and the affected component | Author Markdown, retired legacy JSON, compiler |
| Maintain the compiler or interface | [Schema](scripts/lib/knowledge-schema.ts), [compiler](scripts/lib/knowledge-compiler.ts), [engineering plan](docs/engineering-plan.md) | Reader-facing prose except a migration correction |
| Review a contribution | The Issue or PR, the target record and its evidence, [project rules](CONTRIBUTING.md) | Merging or publishing on the author's behalf |
| Publish a release | [Release runbook](docs/release.md), [CHANGELOG](CHANGELOG.md), the affected source | Other contributors' assigned files |

## Evidence and data

- `knowledge/` is the only author source. `scripts/lib/knowledge-compiler.ts` produces `data/index/knowledge-v1.json`; the website, checks, timeline, map and download package read that interface and never parse author Markdown.
- Regenerate with `npm run knowledge:compile && npm run knowledge:generate`, and include the generated diff in the pull request.
- Work and physical object remain separate. A work may survive in several copies; each copy's production date, condition and custody belong to that copy alone.
- Every collection assertion and history event needs evidence. Source access date is not physical verification date.
- Last-known and unknown locations are not current-location markers. Coordinate display precision is not measurement accuracy. A modern reference landmark is not an event's historical place.
- No guessed coordinates, invented transformations, fictional licences, or generated history presented as fact.
- Bilingual prose travels in pairs. `notesZh`, `summaryZh` and `noteZh` keep the same count and order as the recorded wording; a present but misaligned translation is a validation error. A missing translation is allowed and shows the recorded language, never a machine translation. A reader-facing note that no view renders is dead data and must be either shown or removed.
- Keep image rights and map attribution explicit.

## Implementation and checks

- Keep the React/TypeScript/Vite stack and the npm lockfile. Prefer stable versions and existing dependencies. Separate domain rules, provider code, UI and editorial data.
- Follow the design system: content first, progressive disclosure, accessible controls, functional parity across screen sizes.
- Use Node scripts for shared cross-platform commands. On Windows, `npm.cmd` works in PowerShell; do not change a system execution policy to run the project.
- `npm run check` is the gate for implementation changes: it compiles `knowledge/`, runs the type, data, interface, catalogue, isolation and unit checks, builds the download package and emits a preview build. Run `npm run check:reproducible` when changing the compiler or interface.
- Keep `index.html`'s declared `lang` identical to the product's default interface language; JavaScript switches it at runtime, and the first paint, a reader without JavaScript and a crawler must not disagree.
- For a reader-facing layout change, inspect the changed view at a phone width and a desktop width, and exercise keyboard access, missing data, missing key, map failure and share-link refresh where relevant. Save the full 390/768/1440 + 200% matrix for a redesign.
- Report an unrun check as unrun. A local preview does not prove public mainland access. A mocked SDK does not prove a live map works.
- Add focused regression tests for defects, not tests that restate a visual choice. Do not hard-code a test count in a reader-facing document.

## Handoff

- Small commits with `feat:`, `fix:`, `docs:`, `test:`, `ci:` or `chore:` prefixes. Do not rewrite pushed history.
- The pull request is the delivery record: scope, evidence, commands run, limitations and any open question. A dated delivery report is for a milestone, migration or release, not for routine work.
- A contributor may submit either a browser-only source Issue or a Markdown pull request. An editor links the two when normalising a reader's submission, and that link preserves attribution.

## Repository and publication

- `main` is the published branch. Branch from current `main`, open one pull request per task, and let the maintainer decide the merge.
- GitHub Pages is the sole website host. [The Pages workflow](.github/workflows/pages.yml) publishes checked `main`; `npm run release` and the release manifest remain the automated data gate for a public build.
- Keep `dist/`, `build/`, local environment files, map keys and deployment credentials out of the source remote.
- Every image, quotation and map tile keeps its own rights. The repository licence does not relicense third-party material; see [NOTICE.md](NOTICE.md).

## Local automation

The maintainer may run local automation, private agent configuration or workspace tooling that is not part of this repository's interface. It is excluded from version control and is not required to contribute. Nothing in a local configuration overrides the ten rules above.
