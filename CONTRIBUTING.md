# Contributing

Start with [project rules](AGENTS.md), [iteration board](docs/iteration-board.md), and [design system](docs/design-system.md). These are lightweight project-specific adaptations, not copied policy bundles.

## One small improvement at a time

1. Select one ready task with an observable outcome and acceptance criteria.
2. Record its base commit and create `task/NNN-short-name` when starting new implementation. Do not discard existing work or switch branches with unresolved changes.
3. Implement only that scope. Keep data corrections separate from visual refactoring where practical.
4. Run checks and inspect the changed behavior. Deliver evidence using `templates/delivery-report.md`.
5. Codex reviews actual files and evidence. Fix blocking findings in the same task. Record accepted limitations explicitly.
6. After acceptance, merge/checkpoint the work and update the board. Public deployment has its own gate and is never implied by passing local tests.

Use Conventional Commit prefixes. No commit-message tooling or bureaucracy is required. Describe the user-visible result, not just “update files”. A change need not be perfect; it must improve the project without concealing material defects.

## Reproduce locally

Use a supported Node version satisfying `package.json`; the review ran with Node 24.16.0. With a fresh checkout run `npm ci`, then `npm run check` and `npm run dev`. PowerShell users may use `npm.cmd` for these commands. Never commit `node_modules`, `dist`, or local credentials.

The CI workflow runs the existing preview checks. It does **not** approve publication of draft data and does not deploy. Production publishing uses `npm run release`, which applies the strict data gate and verifies the artifact; see [docs/release.md](docs/release.md).

## Data and images

Submit a source link or bibliographic page locator with each correction. Explain what the evidence establishes and what remains unknown. Supply image creator, license, source, credit, and rights evidence. Publicly visible media are not automatically reusable. Coordinate and custody claims require their own evidence.

## Sources for these practices

- [Google code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html): evidence-led review and incremental improvement.
- [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/): readable change history.
- [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout): hierarchy and progressive disclosure, adapted for a cross-platform website.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): web accessibility criteria.

These links credit the ideas. Third-party source code/assets are not included by reference and retain their own licenses.
