# Project rules for every coding agent

Read the assigned Issue or [task brief](templates/task-brief.md), then follow the relevant row below. Consult the [engineering plan](docs/engineering-plan.md) for changes to shared interfaces and architecture. Explicit owner instructions take precedence. Start a fresh clone at [the member and agent guide](docs/START-HERE.md).

## Read by task

Do not read the whole repository to make a bounded change. Read the row that matches the assignment, then the target record and its cited sources.

| Assignment | Read first | Do not change |
| --- | --- | --- |
| Edit a work, object, person, place, source or note | [Editorial workflow](docs/atlas-workflow.md), [Chinese templates](knowledge/_templates/), the target Markdown and its sources | Compiler, UI, generated catalogue |
| Develop the website | [Design system](docs/design-system.md), [data boundary](src/domain/data.ts), the compiled interface shape and the affected component | Author Markdown, legacy JSON, compiler |
| Maintain the compiler or interface | [Schema](scripts/lib/knowledge-schema.ts), [compiler](scripts/lib/knowledge-compiler.ts), [execution plan](docs/knowledge-rebuild.md) | Reader-facing prose except a migration correction |
| Review a contribution | [Review skill](.agents/skills/review-change/SKILL.md), the Issue/PR, the target record and evidence | Merging or publishing on the author's behalf |
| Coordinate a milestone or release | [Iteration board](docs/iteration-board.md), [release runbook](docs/release.md), [execution plan](docs/knowledge-rebuild.md) | Other contributors' assigned files |

## Roles and scope

- The coordinator (the project owner) prioritizes Issues, assigns reviews, settles scope and decides merges. A contributor may use their preferred local agent. Work independently on disjoint subjects or files. Assign one lead per task and agree responsibility before editing overlapping files.
- Resolve blocking findings within the assigned PR. Do not rewrite the application or introduce a backend, framework, provider, or dependency without a concrete need recorded in the decision log.
- Use English for implementation, technical guidance and skills. Communicate with the coordinator in Chinese. Welcome Chinese-only submissions and preserve original wording and names.
- Inspect `git status` first. Preserve others' changes. Work inside this repository, never stage the parent workspace or personal documents.

## Local artifact storage

- Never create project folders or write project outputs in the parent workspace or beside this repository.
- Use `.private/tmp/` for temporary files and caches, `.private/browser/` for browser profiles, `.private/sites/` for deployment checkouts and archives, and `.private/workspace-archive/` for retained legacy artifacts. Keep existing `dist/` and `build/` conventions. Never stage `.private/`.
- Set tool output paths, browser profile paths, and temporary-directory variables explicitly as needed. If a tool cannot keep its output inside the project, report the limitation instead of writing beside the repository. Check for stray project outputs at handoff; leave unrelated folders alone.

## Evidence and data

- Readers enter through the [Markdown library](knowledge/README.md). Author original editorial prose there. `knowledge/` is the only author source; `scripts/lib/knowledge-compiler.ts` produces `data/index/knowledge-v1.json`, and the website, checks, timeline, map and download package consume that interface. The old JSON under `data/works/`, `data/objects/`, `data/places.json`, `data/sources.json`, `data/media.json`, `data/knowledge-relations.json` and `data/yan-qinli-journey.json` is a frozen migration baseline; do not edit it or read it from the web.
- Update generated pages with `npm run knowledge:compile && npm run knowledge:generate`. Never hand-edit `knowledge/catalogue/` or `knowledge/README.md`. Link drafts to the issue, evidence and relevant stable IDs. Review the [editorial workflow](docs/atlas-workflow.md) before changing historical claims.
- Work and physical object remain separate. Never copy provenance between related objects.
- Every collection assertion and history event needs evidence. Unknown values stay unknown. Source access date is not physical verification date.
- Last-known and unknown locations are not current-location markers. Coordinate display precision is not measurement accuracy. A modern reference landmark is not an event's historical place.
- No guessed coordinates, invented transformations, fictional licenses, or generated history presented as fact.
- Drafts are allowed in clearly labeled previews. Public releases require an enforceable build-time data gate. Tests cannot replace editorial review.
- Bilingual prose travels in pairs. `notesZh`, `summaryZh` and `noteZh` keep the same count and order as the recorded wording; a present but misaligned translation is a validation error. A missing translation is allowed and shows the recorded language, never a machine translation. Work-level notes are reader-facing: a note that no view renders is dead data and must be either shown or removed.
- Keep credentials out of commits. Browser configuration is public after bundling. Keep image rights and map attribution explicit.

## Implementation and checks

- Keep the existing React/TypeScript/Vite stack and npm lockfile. Prefer stable versions and existing dependencies. Separate domain rules, provider code, UI, and editorial data.
- Follow the design system: content first, progressive disclosure, accessible controls, functional parity across screen sizes.
- PowerShell 7 is supported. Use `npm.cmd` on Windows when needed; do not rely on Bash environment-variable syntax. Use Node scripts for shared cross-platform commands. Do not change system execution policies to run the project.
- Run `npm.cmd run check` for implementation changes. It compiles `knowledge/`, runs type, data, interface, catalogue, isolation, board and unit checks, builds the download package and emits a preview build. Editors run `npm run knowledge:compile && npm run knowledge:generate` when source or index changes affect a generated page and include the generated diff in the PR. Run `npm run check:reproducible` when changing the compiler or interface. Add focused regression tests for defects, not tests that merely restate a visual choice.
- Keep `index.html`'s declared `lang` identical to the product's default interface language; JavaScript switches it at runtime, and the first paint, a reader without JavaScript, and a crawler must not disagree.
- Do not hard-code a test count in reader-facing documents (`README*`, `START-HERE`, the release runbook). The number changes with every task and cannot be checked. Delivery and review reports may state the count of their own revision, because that is dated evidence.
- Visually inspect changed layouts at 390, 768, and 1440 CSS pixels and at 200% zoom. Exercise keyboard access, missing data, missing key, map failure, and share-link refresh where relevant.
- Report unrun checks as unrun. A local preview does not prove public mainland access. A mocked SDK does not prove a live map works.
- Add no unnecessary confirmation steps for reversible work within the assigned task. Continue independent work while account information is pending.

## Handoff

- Use small commits with `feat:`, `fix:`, `docs:`, `test:`, `ci:`, or `chore:` prefixes; do not rewrite history or push unless the current task calls for it.
- For a small contribution, keep scope, assignee, evidence, actual checks, limitations and review in the Issue/PR. A contributor may submit either a browser-only source Issue or a Markdown PR. The editor links the two when normalizing a reader's submission.
- For a milestone, migration or release, update the iteration board and write `docs/delivery-NNN.md` with the exact revision, changed files, commands/outcomes, screenshots for UI work, source gaps and limitations. The board's state cell opens with `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted` or `Superseded`. `npm run check:docs` checks that vocabulary, task rows and evidence links. Retain existing milestone evidence.
- Review outcomes are changes-required / partially-verified / accepted. P1 blocks release; P2 must be fixed in its assigned iteration; P3 is optional polish. Never mark your own work independently accepted.
- A review produced by the implementer's own tooling is a self-review. It may clear findings. Record who performed it and who decides acceptance in the PR (and the board row for a milestone).
- Do not silently change these rules to make a failing check pass.

## GitHub synchronization

- Submit each change as a checked PR against the canonical GitHub repository. The coordinator decides the merge or explicitly delegates that specific PR. Keep the required CI job and review outcome visible. Resolve blocking findings before merge. Failing checks and repository protection cannot be bypassed. Record the branch, revision, PR and merge result in the milestone report when applicable.
- After merge synchronize local `main` with the project's `main`. For a direct clone this is `origin/main`; for a contributor fork the project is normally `upstream/main`. A local-only change remains unsubmitted.
- Do not force-push a branch that another person or tool may have based work on, and do not rewrite pushed history.
- Report a blocked push exactly: the command, the error, and what remains unpushed. Never describe unpushed work as delivered.
- Keep `dist/`, `build/`, local environment files, map keys, and deployment credentials out of the source remote. GitHub Actions uploads the built site as a Pages artifact.

## Repository and preview workflow

- Start a task branch from current project `main`. Record its review outcome before merge. Source merge, labelled preview and formal editorial approval are separate events.
- Apply the evidence checklist in [the atlas workflow](docs/atlas-workflow.md) to additions and coordinate changes. Sort the left column by the represented inscription's period, then date. Keep the production date of each copy visible in its own detail.
- GitHub Pages is the sole website host. [The Pages workflow](.github/workflows/pages.yml) publishes a labelled preview of checked `main`. Record the deployed revision, Actions run, and observed network reachability separately.
- A formal publication on GitHub Pages requires `npm run release`, a verified release manifest, editorial approval, and host checks. Follow [the release runbook](docs/release.md) before changing the Pages deployment mode.
