# Contributing to Between Steles

[中文投稿与试读指南](docs/CONTRIBUTE.zh-CN.md) · [Project philosophy](docs/PROJECT.en.md) · [中文理念](docs/PROJECT.md) · [Knowledge library](knowledge/README.md) · [Member and agent setup](docs/START-HERE.md)

## Why this project exists

Between Steles is an open, shared knowledge project built by calligraphy enthusiasts for beginners and fellow learners. It offers knowledge and guidance for study, not a substitute for teaching between people. **人人为我，我为人人 — everyone contributes for the benefit of others, and everyone benefits from what others share.** Technology and AI serve human learning, expression and collaboration. The full, authoritative statement is kept in [docs/PROJECT.md](docs/PROJECT.md) and [docs/PROJECT.en.md](docs/PROJECT.en.md); this guide links to it rather than restating it.

## Anyone can take part

You do not need to be a calligraphy expert, a programmer or an AI user. Share what you notice while copying, a documented collection detail, a textual correction, a visit to a stele or exhibition, a reading suggestion, or your own understanding and questions. A single source lead, one correction or one honest learning note has value. Contributors keep their own name, views and wording; factual knowledge needs a traceable source. Contributors may also use the open resources for their own study, research, exchange and cultural activities.

| Contribution | Start | Handoff |
| --- | --- | --- |
| Share an observation, a source, a correction or a learning note | [Knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) or a browser edit to an authored Markdown file in the library | An editor links the submission and credit to the resulting PR or explains the open question in the Issue |
| Report a reading, navigation or site problem | [Beta feedback](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) | Include the page, device or browser, steps, observed and expected behaviour |
| Take part without a GitHub account | Prepare the text and ask someone who uses GitHub to submit it, or add it to an existing public issue | The maintainer helps organise what is shared in public; there is no private submission channel to promise |
| Change the website | Claim a [web task](https://github.com/yang963852/beitie-atlas/issues/new?template=web-task.yml) when coordination is useful | Send a small PR with the reproduced reader path, checks and limitations |

**What the channels can actually do.** The site is a static GitHub Pages site. The "Add or correct information" panel on a record composes text the reader can read and copy, and opens a pre-filled GitHub issue when the reader chooses. Nothing is stored or posted by the page, and there is no in-site submission backend, account system or dedicated public contact address. GitHub Issues and pull requests are public; a submission becomes a public lead that an editor checks against an openable source before anything is added. Do not put private contact details in a public issue.

Chinese-only submissions are welcome. Small, evidenced corrections may go straight to PR. The Issue number or PR preserves attribution. Citing a contribution in the resulting article also preserves the named author's credit for a reading or interpretation. Full reader-facing instructions are in the [Chinese guide](docs/CONTRIBUTE.zh-CN.md) and on the site's [Join in](https://yang963852.github.io/beitie-atlas/#/join) page.

## The technical workflow, for those who need it

1. The coordinator prioritizes Issues by reader impact and marks the track (`knowledge`, `web` or `beta-feedback`). Record a lead and scope when coordination is useful. Acceptance examples, reviewers and task cards are optional. Coordinate overlapping files. Independent tasks can proceed in parallel.
2. Branch from current project `main`. External contributors push to their own fork (`origin`) and propose changes to the project (`upstream`). Invited contributors may use a project task branch. A browser edit can create the fork and PR directly. For local work see the [setup guide](docs/START-HERE.md).
3. Put the change, sources or reproduction, checks run and remaining gaps in the PR. Link any Issue, including submissions incorporated by an editor. CI runs the quality check on PRs. For an ordinary contribution the PR is the delivery record. Merging to `main` deploys the site but does not create a formal edition: the maintainer decides separately when to record a version, CHANGELOG entry, tag and GitHub Release. Task cards, board rows and delivery reports are optional.
4. The editor checks identities, locators, uncertainties and rights. A technical review is optional. Describe an author's or their agent's own review as **self-review**; it is sufficient. Resolve blocking findings on the same PR. The owner decides the merge or explicitly delegates that PR. A contributor agent stops at the assigned handoff.
5. Sync the local default branch with the project after merge. Pages builds and deploys from checked `main`. The owner's merge is the deployment decision; a formal release is a separate decision with a version, CHANGELOG, tag and GitHub Release. A quick live smoke test is recommended. [Editorial workflow](docs/atlas-workflow.md) · [Release runbook](docs/release.md)

Send a focused pull request directly to `yang963852/beitie-atlas:main` from your fork. An Issue is optional. The maintainer reviews when available; self-review is acceptable.

## Coordinator's queue

Use [knowledge submissions](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Aknowledge), [web work](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Aweb), [beta feedback](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Abeta-feedback) and [open PRs](https://github.com/yang963852/beitie-atlas/pulls). Triage a new submission, name a reviewer, link a PR or record the missing evidence, then return the outcome to the submitter. Use GitHub permissions and branch protection to enforce the PR and required status check. A skill, label or Issue assignment grants no repository access.

On each PR, check the latest revision and the required CI job. Self-review is acceptable; record it in the PR. Keep secrets, build products and personal profiles out of Git. A failed check or blocked push stays visible until resolved. [Repository rules](AGENTS.md)

Project practice draws on [Google's code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html), [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and the [design system references](docs/design-system.md).
