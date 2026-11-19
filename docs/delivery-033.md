# Delivery 033 — Contain local project artifacts

- Branch: `codex/031-workspace-storage`. The PR records the exact revision and merge outcome.
- Changed `AGENTS.md`, the iteration board, and the task and delivery documents for 033.
- Moved two browser profiles, two cache directories, and one staging directory with its nested checkout into `.private/workspace-archive/`. `git check-ignore` confirms exclusion.
- Verification: PowerShell directory inventory, `git check-ignore`, `git diff --check`, and `npm run check:docs`. No application, publishing, editorial, or UI changes.
- Self-review only. The rule applies to project work; it is not an operating-system restriction.
