# Project rules for every coding agent

Read the assigned Issue or [task brief](templates/task-brief.md), then follow the relevant row below. Consult the [engineering plan](docs/engineering-plan.md) for changes to shared interfaces and architecture. Explicit owner instructions take precedence. Start a fresh clone at [the member and agent guide](docs/START-HERE.md).

## Working mode (2026-11-26)

The owner has simplified this project's workflow. This section supersedes any stricter review, acceptance, delivery-report or archival step later in this file or in `docs/`.

- The owner is the reviewer and decides merges. Self-review is enough. No independent reviewer, acceptance record, delivery report, board row, archive tag or screenshot set is required for routine work or a release.
- The gate is `npm run check` green plus the owner's merge. The PR is the record: state what changed, what ran and what remains uncertain.
- Publish when the owner says so. Merging to `main` deploys through the Pages workflow. Tag the release and update `CHANGELOG.md`; a GitHub Release and a delivery report are optional. `npm run release` and the release manifest remain the automated data gate for the public build.
- For reader-facing changes, do a quick live smoke test: home, one work, one object, search and a phone-width layout. The full 390/768/1440 + 200% + keyboard matrix is for major redesigns, not every change.
- Keep the evidence rules: every factual claim has a source, unknown values stay unknown, no guessed coordinates, bilingual notes stay aligned, no credentials in commits. These protect the content, not the ceremony.
- Keep the automated checks. Do not delete or bypass a check to make a change pass.

## Read by task

Do not read the whole repository to make a bounded change. Read the row that matches the assignment, then the target record and its cited sources.

| Assignment | Read first | Do not change |
| --- | --- | --- |
| Edit a work, object, person, place, source or note | [Editorial workflow](docs/atlas-workflow.md), [Chinese templates](knowledge/_templates/), the target Markdown and its sources | Compiler, UI, generated catalogue |
| Develop the website | [Design system](docs/design-system.md), [data boundary](src/domain/data.ts), the compiled interface shape and the affected component | Author Markdown, retired legacy JSON, compiler |
| Maintain the compiler or interface | [Schema](scripts/lib/knowledge-schema.ts), [compiler](scripts/lib/knowledge-compiler.ts), [engineering plan](docs/engineering-plan.md) | Reader-facing prose except a migration correction |
| Review a contribution | [Review skill](.agents/skills/review-change/SKILL.md), the Issue/PR, the target record and evidence | Merging or publishing on the author's behalf |
| Publish a release | [Release runbook](docs/release.md), [CHANGELOG](CHANGELOG.md), the affected source | Other contributors' assigned files |

## Roles and scope

- The coordinator (the project owner) prioritizes work, settles scope and decides merges. Self-review is sufficient; no independent reviewer is required. A contributor may use their preferred local agent. Work independently on disjoint subjects or files. Assign one lead per task and agree responsibility before editing overlapping files.
- Local agents use separate workspaces: TRAE works in `.private/worktrees/trae` on `trae/work`; WorkBuddy works in `.private/worktrees/workbuddy` on `workbuddy/work` (or its own app-managed worktree until moved); Codex is read-only on the primary checkout and writes plans only when the coordinator asks. The primary checkout is the coordinator's space, not a shared agent workspace. See [the local agent workflow](docs/agent-workflow.zh-CN.md).
- `trae/work` and `workbuddy/work` are long-lived integration branches. Keep one task per PR, merge `origin/main` into the branch before opening it, and synchronize the branch again after the coordinator merges. Never commit directly to `main`.
- Resolve blocking findings within the assigned PR. Do not rewrite the application or introduce a backend, framework, provider, or dependency without a concrete need recorded in the decision log.
- Use English for implementation, technical guidance and skills. Communicate with the coordinator in Chinese. Welcome Chinese-only submissions and preserve original wording and names.
- Inspect `git status` first. Preserve others' changes. Work inside this repository, never stage the parent workspace or personal documents.

## Local artifact storage

- Never create project folders or write project outputs in the parent workspace or beside this repository.
- Use `.private/tmp/` for temporary files and caches, `.private/worktrees/` for the two long-lived agent worktrees, `.private/browser/` for browser profiles, `.private/sites/` for deployment checkouts and archives, and `.private/workspace-archive/` for retained legacy artifacts and local copies of records retired from `main`. The canonical copy of a retired record is its annotated archive tag. Keep existing `dist/` and `build/` conventions. Never stage `.private/`.
- WorkBuddy's own application data directory (`C:/Users/zhangyang/WorkBuddy/Worktrees/碑帖之间/`) is the only permitted workspace outside this repository. It is a Git worktree managed by that application, not a project output; do not create other folders there.
- Set tool output paths, browser profile paths, and temporary-directory variables explicitly as needed. If a tool cannot keep its output inside the project, report the limitation instead of writing beside the repository. Check for stray project outputs at handoff; leave unrelated folders alone.

## Evidence and data

- Readers enter through the [Markdown library](knowledge/README.md). Author original editorial prose there. `knowledge/` is the only author source; `scripts/lib/knowledge-compiler.ts` produces `data/index/knowledge-v1.json`, and the website, checks, timeline, map and download package consume that interface.
- The pre-rebuild JSON corpus (`data/works/`, `data/objects/`, `data/places.json`, `data/sources.json`, `data/media.json`, `data/knowledge-relations.json`, `data/yan-qinli-journey.json`) and its one-time migration tools were retired on 2026-11-25. They remain in the annotated tag `archive-pre-hygiene-2026-11-25`; do not reintroduce them into `main` or read them from the web.
- Update generated pages with `npm run knowledge:compile && npm run knowledge:generate`. Never hand-edit `knowledge/catalogue/` or `knowledge/README.md`. Link drafts to the issue, evidence and relevant stable IDs. Review the [editorial workflow](docs/atlas-workflow.md) before changing historical claims.
- Work and physical object remain separate. Never copy provenance between related objects.
- Every collection assertion and history event needs evidence. Unknown values stay unknown. Source access date is not physical verification date.
- Last-known and unknown locations are not current-location markers. Coordinate display precision is not measurement accuracy. A modern reference landmark is not an event's historical place.
- No guessed coordinates, invented transformations, fictional licenses, or generated history presented as fact.
- Drafts are allowed in clearly labeled previews. Public releases require an enforceable build-time data gate. Tests cannot replace editorial judgment; the owner may self-review.
- Bilingual prose travels in pairs. `notesZh`, `summaryZh` and `noteZh` keep the same count and order as the recorded wording; a present but misaligned translation is a validation error. A missing translation is allowed and shows the recorded language, never a machine translation. Work-level notes are reader-facing: a note that no view renders is dead data and must be either shown or removed.
- Keep credentials out of commits. Browser configuration is public after bundling. Keep image rights and map attribution explicit.

## Implementation and checks

- Keep the existing React/TypeScript/Vite stack and npm lockfile. Prefer stable versions and existing dependencies. Separate domain rules, provider code, UI, and editorial data.
- Follow the design system: content first, progressive disclosure, accessible controls, functional parity across screen sizes.
- PowerShell 7 is supported. Use `npm.cmd` on Windows when needed; do not rely on Bash environment-variable syntax. Use Node scripts for shared cross-platform commands. Do not change system execution policies to run the project.
- Run `npm.cmd run check` for implementation changes. It compiles `knowledge/`, runs type, data, interface, catalogue, isolation, board and unit checks, builds the download package and emits a preview build. Editors run `npm run knowledge:compile && npm run knowledge:generate` when source or index changes affect a generated page and include the generated diff in the PR. Run `npm run check:reproducible` when changing the compiler or interface. Add focused regression tests for defects, not tests that merely restate a visual choice.
- Keep `index.html`'s declared `lang` identical to the product's default interface language; JavaScript switches it at runtime, and the first paint, a reader without JavaScript, and a crawler must not disagree.
- Do not hard-code a test count in reader-facing documents (`README*`, `START-HERE`, the release runbook). The number changes with every task and cannot be checked. A dated release note may state the count of its own revision.
- For a reader-facing layout change, inspect the changed view at a phone width and a desktop width, and exercise keyboard access, missing data, missing key, map failure or share-link refresh where relevant. Save the full 390/768/1440 + 200% matrix for a redesign.
- Report unrun checks as unrun. A local preview does not prove public mainland access. A mocked SDK does not prove a live map works.
- Add no unnecessary confirmation steps for reversible work within the assigned task. Continue independent work while account information is pending.

## Handoff

- Use small commits with `feat:`, `fix:`, `docs:`, `test:`, `ci:`, or `chore:` prefixes; do not rewrite history or push unless the current task calls for it.
- For a small contribution, keep scope, assignee, evidence, actual checks, limitations and review in the Issue/PR. A contributor may submit either a browser-only source Issue or a Markdown PR. The editor links the two when normalizing a reader's submission.
- Routine work: put scope, checks and known gaps in the PR. The owner's merge is the decision; no delivery report or board row is needed.
- A release: update `CHANGELOG.md`, tag `vX.Y.Z`, and let the Pages workflow publish. A short release note is enough; the full delivery report in `docs/delivery-NNN.md` is optional.
- The iteration board is optional. If a task card or delivery report exists, `npm run check:docs` still checks that its row and links resolve.
- Self-review is acceptable. Record who made the change and that the owner merged it; no independent acceptance is required.
- Do not silently change these rules to make a failing check pass.

## GitHub synchronization

- Submit each change as a checked PR against the canonical GitHub repository. The owner decides the merge or explicitly delegates that specific PR. Keep the required CI job visible. Resolve blocking findings before merge. Failing checks and repository protection cannot be bypassed.
- After merge synchronize local `main` with the project's `main`. For a direct clone this is `origin/main`; for a contributor fork the project is normally `upstream/main`. A local-only change remains unsubmitted.
- Do not force-push a branch that another person or tool may have based work on, and do not rewrite pushed history.
- Report a blocked push exactly: the command, the error, and what remains unpushed. Never describe unpushed work as delivered.
- Keep `dist/`, `build/`, local environment files, map keys, and deployment credentials out of the source remote. GitHub Actions uploads the built site as a Pages artifact.

## Repository and preview workflow

- Start a task branch from current project `main`. Local agents use their long-lived branch (`trae/work` or `workbuddy/work`) and open a PR after each task; external contributors use a short-lived `task/...` branch. CI green plus the owner's merge is the gate.
- Apply the evidence checklist in [the atlas workflow](docs/atlas-workflow.md) to additions and coordinate changes. Sort the left column by the represented inscription's period, then date. Keep the production date of each copy visible in its own detail.
- GitHub Pages is the sole website host. [The Pages workflow](.github/workflows/pages.yml) publishes a release build of checked `main`.
- A release keeps the automated `npm run release` gate and manifest check. The owner's merge is the approval; a quick live smoke test is recommended. Follow [the release runbook](docs/release.md) before changing the Pages deployment mode.
