# Member and agent handoff

A learner wants to identify the work on their desk, distinguish its surviving versions and learn what to look at in the writing. Follow that reader from a work to a person, a witness and a source. The project covers historical and modern calligraphy. A claim about current teaching use needs evidence for that use.

[中文资料与试读指南](CONTRIBUTE.zh-CN.md) · [First internal beta on Pages](https://yang963852.github.io/beitie-atlas/) · [Markdown knowledge library](../knowledge/README.md)

## Choose the assignment

For the owner or an agent preparing a technical decision, start with the [Chinese architecture guide, diagrams and decision records](engineering-plan.md#负责人架构导读).

| I am here to… | Read first | Hand off |
| --- | --- | --- |
| Suggest a source using only a browser | [Chinese knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) | A single Issue with source and locator, or an authored Markdown PR |
| Edit a work, witness, person or reading note | [Research skill](../.agents/skills/research-entry/SKILL.md), [editorial workflow](atlas-workflow.md) | A narrow PR linking the subject, evidence, contributor and open questions |
| Develop a web feature | [Web skill](../.agents/skills/web-change/SKILL.md), [engineering plan](engineering-plan.md), [design system](design-system.md) | A reproducible reader path and check results in a PR |
| Review a contribution | [Review skill](../.agents/skills/review-change/SKILL.md), [project rules](../AGENTS.md) | Findings and a review outcome for the coordinator |
| Coordinate priorities or release | [Open Issues and PRs](../CONTRIBUTING.md#coordinators-queue), [milestone board](iteration-board.md), [release runbook](release.md) | Assignee, reviewer, recorded merge decision and separately authorized release |

A local agent can read each `SKILL.md` directly from the checkout. Each assignment supplies a reader outcome, subject or files, base revision, evidence, acceptance example and stopping point. Copy the [task card and Chinese prompt](../templates/task-brief.md). GitHub handles repository permissions. A task description or skill provides workflow guidance.

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

Run `npm run check` again after implementation. Push the checked branch to the contributor's own remote, open a PR against project `main`, and state the tested revision and unverified paths. On a fork, `git push -u origin task/your-topic` pushes to the fork. The coordinator decides merge or delegates the particular PR. Keep project artifacts in the locations defined by [AGENTS.md](../AGENTS.md).

## Where a change belongs

| Change | Editable input | How to check |
| --- | --- | --- |
| Authored Chinese introductions, people and practice notes | Follow the article links in [knowledge/README.md](../knowledge/README.md) | Inspect GitHub Markdown, website, review status, sources and incoming links |
| Catalogue, holdings, events, places or bibliographic sources | `data/works/`, `data/objects/`, `data/places.json`, `data/sources.json` | Run `npm run knowledge:generate` when projections change, commit the generated diff and run `npm run check` |
| UI and navigation | `src/App.tsx`, `src/components/`, `src/styles.css`, `src/i18n/` | Exercise entry, link refresh, keyboard, narrow screen and 200% zoom |
| Domain model or provider | `src/domain/`, `scripts/lib/`, `src/map/` | Test consumers and the affected failure modes, including a missing map when relevant |
| Formal publication | `scripts/release.ts`, [release runbook](release.md) | Verify all reviewed inputs, release marker, manifest and host |

The public **内部测试第一版** uses the checked Pages preview. The last owner-approved formal edition is tagged [v0.1.0-alpha.2](https://github.com/yang963852/beitie-atlas/tree/v0.1.0-alpha.2). Its approval and manifest are recorded in [delivery 021](delivery-021.md).
