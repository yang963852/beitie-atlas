# Member and agent handoff

A learner wants to identify the work on their desk, distinguish its surviving versions and learn what to look at in the writing. Follow that reader from a work to a person, a witness and a source. The project covers historical and modern calligraphy. A claim about current teaching use needs evidence for that use.

[中文资料与试读指南](CONTRIBUTE.zh-CN.md) · [Public site on Pages](https://yang963852.github.io/beitie-atlas/) · [Markdown knowledge library](../knowledge/README.md) · [Contribution guide](../CONTRIBUTING.md)

## What lives in `main`

`main` holds the current author sources, the website and compiler, the checks, the current operating documents and active work. The project uses a lightweight owner-merge workflow: self-review is sufficient, and `npm run check` green plus the owner's merge is the gate. Dated records are retrievable but are not current guidance:

- Milestones 001–039: annotated tag `archive-pre-hygiene-2026-11-25`.
- Milestones 040–051, acceptance screenshots and completed plans or proposals: annotated tag `archive-milestones-040-051-2026-11-26`.
- Agent-named coordination records: annotated tag `archive-agent-records-2026-11-27`.

See [the archive index](archive.md) for browsing and restore commands. A new contributor only needs the current documents linked on this page.

## Choose the assignment

For the owner or an agent preparing a technical decision, start with the [Chinese architecture guide, diagrams and decision records](engineering-plan.md#负责人架构导读).

| I am here to… | Read first | Hand off |
| --- | --- | --- |
| Suggest a source using only a browser | [Chinese knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) | A single Issue with source and locator, or an authored Markdown PR |
| Edit a work, witness, person or reading note | [Editorial workflow](atlas-workflow.md), [Chinese templates](../knowledge/_templates/) | A narrow PR linking the subject, evidence, contributor and open questions |
| Develop a web feature | [Engineering plan](engineering-plan.md), [design system](design-system.md), [data boundary](../src/domain/data.ts) | A reproducible reader path and check results in a PR |
| Review a contribution | [Project rules](../AGENTS.md), the Issue or PR and its evidence | Findings, optionally; the owner decides the merge |
| Coordinate priorities or release | [Open Issues and PRs](../CONTRIBUTING.md#coordinators-queue), [milestone board](iteration-board.md), [release runbook](release.md) | Scope, merge decision and release tag |

Each assignment supplies a reader outcome, subject or files, base revision, evidence and a stopping point; an acceptance example is optional. Copy the [bounded task brief](../templates/task-brief.md). GitHub handles repository permissions. A task description provides workflow guidance; no repository access is granted by an assignment.

Work on a short-lived `task/NNN-slug` branch opened from current `main`, and submit one pull request per task; delete the branch after merge. The maintainer decides the merge. Use a separate clone or working tree per concurrent task so that two agents never edit the same checkout at once, and name the paths each task owns before starting. [Project rules](../AGENTS.md)

## Set up a clean workspace

Use Git and Node.js 24 with npm. External members fork [the project](https://github.com/yang963852/beitie-atlas), clone that fork, and add the project remote once.

```sh
git clone https://github.com/YOUR-ACCOUNT/beitie-atlas.git
cd beitie-atlas
git status --short --branch
git remote add upstream https://github.com/yang963852/beitie-atlas.git
git fetch upstream
git switch -c task/your-topic upstream/main
npm ci
npm run check
npm run dev
```

Replace `YOUR-ACCOUNT` and `your-topic`. Invited collaborators cloning the project can branch from `origin/main`. Windows PowerShell supports `npm.cmd` in place of `npm`. Use the URL printed by Vite. The corpus and knowledge pages work without a map key. Local basemap setup is optional. [Tianditu setup](map-setup.md)

Run `npm run check` again after implementation. Push the checked branch to the contributor's own remote, open a PR against project `main`, and state the tested revision and unverified paths. On a fork, `git push -u origin task/your-topic` pushes to the fork. The coordinator decides merge or delegates the particular PR. Keep build products and temporary artifacts out of Git; use an ignored local directory for temporary work. [Project rules](../AGENTS.md)

## Where a change belongs

| Change | Editable input | How to check |
| --- | --- | --- |
| Authored works, objects, people, places, sources or reading notes | Markdown under `knowledge/`; start from [the templates](../knowledge/_templates/) | Run `npm run knowledge:compile`, then `npm run check` |
| Catalogue index and GitHub reading copies | Generated from `knowledge/`; never hand-edit `knowledge/catalogue/` or `knowledge/README.md` | `npm run knowledge:generate` and commit the generated diff |
| Website and navigation | `src/App.tsx`, `src/components/`, `src/styles.css`, `src/i18n/`; import only the compiled interface | Exercise entry, link refresh, keyboard, narrow screen and 200% zoom |
| Compiler, interface or validation | `scripts/lib/knowledge-*.ts`, `src/domain/`, the generated `data/index/knowledge-v1.json` | Run `npm run check:data`, `npm run check:interface`, `npm run check:isolation`, `npm run check:reproducible` |
| Formal publication | `scripts/release.ts`, [release runbook](release.md) | Verify all reviewed inputs, the release marker, the manifest and a live smoke test |

The website reads `data/index/knowledge-v1.json`; it does not import author Markdown. That file is generated on demand and is not in version control, so a fresh clone builds it before `dev`, `build` or `check`. The download package is generated at build time from `knowledge/` and served at `/download/beitie-knowledge.zip`. The pre-rebuild JSON corpus and its migration tools are retired; their records are in the archive tags listed in [the archive index](archive.md).

The public **1.2** edition is built and deployed through `npm run release`. The Pages workflow verifies the release marker, the manifest counts and the downloadable library ZIP. Deployment evidence for the earlier 1.1 release is recorded in delivery 051 in the `archive-milestones-040-051-2026-11-26` tag.

## Reusing this repository

The MIT licence covers the code, documentation and original editorial work; third-party rights stay in [NOTICE.md](../NOTICE.md). To build a different library from this repository:

1. Fork the project and replace the records under `knowledge/` using the [Chinese templates](../knowledge/_templates/).
2. Change the site title, interface text and deployment address; set the Vite base path for your host.
3. Run `npm run knowledge:build`, then `npm run check`.
4. Keep the evidence, rights and release rules that you still need. The iteration board, delivery reports and local-agent branches describe this project's coordination, not a requirement for a fork.
5. The archive tags and `docs/archive.md` are optional in a fork; they preserve this project's dated records.
