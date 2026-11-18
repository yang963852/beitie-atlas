# Project rules for every coding agent

Read `docs/iteration-board.md`, the assigned task, `docs/engineering-plan.md`, and `docs/design-system.md` before changing implementation. This file applies to this project only. Explicit owner instructions take precedence.

## Roles and scope

- The owner chooses product direction. Codex normally designs/reviews and WorkBuddy implements; the owner may assign implementation directly to Codex, a human, or another AI. Follow the same checks and handoff regardless of tool. One implementation writer at a time.
- Finish the current task and its blocking findings before starting another. Do not rewrite the application or introduce a backend, framework, provider, or dependency without a concrete need recorded in the decision log.
- Use English in implementation and technical documents; explain progress to the owner in Chinese. Preserve Chinese names and original source wording.
- Inspect `git status` first. Preserve others' changes. Work inside this repository, never stage the parent workspace or personal documents.

## Evidence and data

- Work and physical object remain separate. Never copy provenance between related objects.
- Every collection assertion and history event needs evidence. Unknown values stay unknown. Source access date is not physical verification date.
- Last-known and unknown locations are not current-location markers. Coordinate display precision is not measurement accuracy.
- No guessed coordinates, invented transformations, fictional licenses, or generated history presented as fact.
- Drafts are allowed in clearly labeled previews. Public releases require an enforceable build-time data gate. Tests cannot replace editorial review.
- Bilingual prose travels in pairs. `notesZh`, `summaryZh` and `noteZh` keep the same count and order as the recorded wording; a present but misaligned translation is a validation error. A missing translation is allowed and shows the recorded language, never a machine translation. Work-level notes are reader-facing: a note that no view renders is dead data and must be either shown or removed.
- Keep credentials out of commits. Browser configuration is public after bundling. Keep image rights and map attribution explicit.

## Implementation and checks

- Keep the existing React/TypeScript/Vite stack and npm lockfile. Prefer stable versions and existing dependencies. Separate domain rules, provider code, UI, and editorial data.
- Follow the design system: content first, progressive disclosure, accessible controls, functional parity across screen sizes.
- PowerShell 7 is supported. Use `npm.cmd` on Windows when needed; do not rely on Bash environment-variable syntax. Use Node scripts for shared cross-platform commands. Do not change system execution policies to run the project.
- Run `npm.cmd run check` for implementation changes. It runs the type check, the data check, the board check, the tests, and a preview build. Add focused regression tests for defects, not tests that merely restate a visual choice.
- Keep `index.html`'s declared `lang` identical to the product's default interface language; JavaScript switches it at runtime, and the first paint, a reader without JavaScript, and a crawler must not disagree.
- Do not hard-code a test count in reader-facing documents (`README*`, `START-HERE`, the release runbook). The number changes with every task and cannot be checked. Delivery and review reports may state the count of their own revision, because that is dated evidence.
- Visually inspect changed layouts at 390, 768, and 1440 CSS pixels and at 200% zoom. Exercise keyboard access, missing data, missing key, map failure, and share-link refresh where relevant.
- Report unrun checks as unrun. A local preview does not prove public mainland access. A mocked SDK does not prove a live map works.
- Add no unnecessary confirmation steps for reversible work within the assigned task. Continue independent work while account information is pending.

## Handoff

- Use small commits with `feat:`, `fix:`, `docs:`, `test:`, `ci:`, or `chore:` prefixes; do not rewrite history or push unless the current task calls for it.
- Update the iteration board and write `docs/delivery-NNN.md`: exact revision, changed files, commands/outcomes, screenshots for UI work, source gaps, and limitations. The board's state cell opens with a canonical keyword — `Queued`, `In progress`, `Changes required`, `Delivered`, `Accepted`, or `Superseded` — and `npm run check:docs` enforces that vocabulary together with the row, task-file and evidence-link rules.
- Review outcomes are changes-required / partially-verified / accepted. P1 blocks release; P2 must be fixed in its assigned iteration; P3 is optional polish. Never mark your own work independently accepted.
- A review produced by the implementer's own tooling is a self-review. It may clear findings, but record it as self-review and leave the acceptance decision to an independent reviewer or to the owner at merge; say which one in the board row.
- Do not silently change these rules to make a failing check pass.

## GitHub synchronization

- The GitHub repository is the only canonical source. For every project change, push one checked task branch, open a PR, and merge into `main` once the applicable checks pass and blocking findings are resolved. The owner provides standing authorization for these source merges; record self-review as self-review. A failing or blocked check is not authorization to bypass repository protection. Record the branch, revision, PR and merge result in the delivery report.
- After a merge, `main` must match `origin/main`. A local-only commit is an unsynchronized change, not a delivery.
- Do not force-push a branch that another person or tool may have based work on, and do not rewrite pushed history.
- Report a blocked push exactly: the command, the error, and what remains unpushed. Never describe unpushed work as delivered.
- `dist/`, `build/`, `.env*`, local map keys, and Site write credentials stay out of both remotes.
- [The site artifact workflow](../.github/workflows/site-artifact.yml) produces the verified directory for a Sites upload and names its revision. The upload itself remains an owner-authorized step; record the Site version next to the revision.

## Repository and preview workflow

- Start from the synchronized `origin/main` on one task branch. Record the review outcome before merging. A source merge does not constitute formal editorial approval.
- Apply the evidence checklist in [the atlas workflow](docs/atlas-workflow.md) to additions and coordinate changes. Sort the left column by the represented inscription's period, then date. Keep the production date of each copy visible in its own detail.
- Codex Sites remains a public host. GitHub Pages is an additional public, labelled preview of checked `main`, not a formal edition or proof of mainland access. Keep local map keys, private notes and build output out of both source remotes.
- A formal public release requires `npm run release`, a verified release manifest, editorial approval, and host checks. Task 015 records owner authorization for the clearly labelled public draft preview of the existing 36 physical records. Changing a private Site's audience is a separate action.
