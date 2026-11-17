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
- Keep credentials out of commits. Browser configuration is public after bundling. Keep image rights and map attribution explicit.

## Implementation and checks

- Keep the existing React/TypeScript/Vite stack and npm lockfile. Prefer stable versions and existing dependencies. Separate domain rules, provider code, UI, and editorial data.
- Follow the design system: content first, progressive disclosure, accessible controls, functional parity across screen sizes.
- PowerShell 7 is supported. Use `npm.cmd` on Windows when needed; do not rely on Bash environment-variable syntax. Use Node scripts for shared cross-platform commands. Do not change system execution policies to run the project.
- Run `npm.cmd run check` for implementation changes. Add focused regression tests for defects, not tests that merely restate a visual choice.
- Visually inspect changed layouts at 390, 768, and 1440 CSS pixels and at 200% zoom. Exercise keyboard access, missing data, missing key, map failure, and share-link refresh where relevant.
- Report unrun checks as unrun. A local preview does not prove public mainland access. A mocked SDK does not prove a live map works.
- Add no unnecessary confirmation steps for reversible work within the assigned task. Continue independent work while account information is pending.

## Handoff

- Use small commits with `feat:`, `fix:`, `docs:`, `test:`, `ci:`, or `chore:` prefixes; do not rewrite history or push unless the current task calls for it.
- Update the iteration board and write `docs/delivery-NNN.md`: exact revision, changed files, commands/outcomes, screenshots for UI work, source gaps, and limitations.
- Review outcomes are changes-required / partially-verified / accepted. P1 blocks release; P2 must be fixed in its assigned iteration; P3 is optional polish. Never mark your own work independently accepted.
- Do not silently change these rules to make a failing check pass.
