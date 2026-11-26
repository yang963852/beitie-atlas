# Contributing to Between Steles

[中文投稿与试读指南](docs/CONTRIBUTE.zh-CN.md) · [Knowledge library](knowledge/README.md) · [Member and agent setup](docs/START-HERE.md)

Send a focused pull request directly to `yang963852/beitie-atlas:main` from your fork. An Issue is optional. The maintainer reviews when available; self-review is acceptable.

| Contribution | Start | Handoff |
| --- | --- | --- |
| Suggest a source, correction, teaching example or close reading | [Knowledge form](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) or a browser edit to an authored Markdown file in the library | An editor links the submission and credit to the resulting PR or explains the open question in the Issue |
| Change the website | Claim a [web task](https://github.com/yang963852/beitie-atlas/issues/new?template=web-task.yml) when coordination is useful | Send a small PR with the reproduced reader path, checks and limitations |
| Report a beta problem | [Beta feedback](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) | Include the page, device or browser, steps, observed and expected behaviour |

Chinese-only submissions are welcome. Small, evidenced corrections may go straight to PR. The Issue number or PR preserves attribution. Citing a contribution in the resulting article also preserves the named author's credit for a reading or interpretation.

## From assignment to merge

1. The coordinator prioritizes Issues by reader impact and marks the track (`knowledge`, `web` or `beta-feedback`). Record a lead and scope when coordination is useful. Acceptance examples, reviewers and task cards are optional. Coordinate overlapping files. Independent tasks can proceed in parallel.
2. Branch from current project `main`. External contributors push to their own fork (`origin`) and propose changes to the project (`upstream`). Invited contributors may use a project task branch. A browser edit can create the fork and PR directly. For local work see the [setup guide](docs/START-HERE.md).
3. Put the change, sources or reproduction, checks run and remaining gaps in the PR. Link any Issue, including submissions incorporated by an editor. CI runs the quality check on PRs. For an ordinary contribution the PR is the delivery record. A release also updates `CHANGELOG.md` and gets a tag; task cards, board rows and delivery reports are optional.
4. The editor checks identities, locators, uncertainties and rights. A technical review is optional. Describe an author's or their agent's own review as **self-review**; it is sufficient. Resolve blocking findings on the same PR. The owner decides the merge or explicitly delegates that PR. A contributor agent stops at the assigned handoff.
5. Sync the local default branch with the project after merge. Pages builds and deploys from checked `main`. The owner's merge is the publication decision; a quick live smoke test is recommended. [Editorial workflow](docs/atlas-workflow.md) · [Release runbook](docs/release.md)

## Coordinator's queue

Use [knowledge submissions](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Aknowledge), [web work](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Aweb), [beta feedback](https://github.com/yang963852/beitie-atlas/issues?q=is%3Aissue%20is%3Aopen%20label%3Abeta-feedback) and [open PRs](https://github.com/yang963852/beitie-atlas/pulls). Triage a new submission, name a reviewer, link a PR or record the missing evidence, then return the outcome to the submitter. Use GitHub permissions and branch protection to enforce the PR and required status check. A skill, label or Issue assignment grants no repository access.

On each PR, check the latest revision and the required CI job. Self-review is acceptable; record it in the PR. Keep secrets, build products and personal profiles out of Git. A failed check or blocked push stays visible until resolved. [Repository rules](AGENTS.md)

Project practice draws on [Google's code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html), [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and the [design system references](docs/design-system.md).
