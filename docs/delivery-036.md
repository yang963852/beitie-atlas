# Delivery 036 | Internal beta 1

The coordinator authorized a publicly accessible **内部测试第一版** on GitHub Pages. This is a labelled preview. The last formally approved edition remains tagged v0.1.0-alpha.2.

Branch `codex/036-internal-beta` starts from `3e0450d559f4c5d3bb39ed9220cd0597670d2a39`. [PR #24](https://github.com/yang963852/beitie-atlas/pull/24) records the checked branch and merge result. The [beta version record](https://github.com/yang963852/beitie-atlas/releases/tag/v0.2.0-beta.1) links the deployed revision and Pages run. Review outcome is partially verified by Codex self-review. The coordinator authorized the rollout.

## Reader and contributor paths

The opening desk links to the Markdown-backed library. The library supports independent, refreshable work and person pages, both ends of a documented relationship, bilingual reading notes and links to the existing witness catalogue. Every JSON work has a generated, readable GitHub file. Draft notes remain labelled. New knowledge contributors can submit an Issue in Chinese, edit a Markdown file or send a source reference. Three repo-local skills support research, website development and review. GitHub Issues and PRs track daily contributions. Milestone reports and the board retain release evidence.

## Changes and evidence

- Knowledge inputs and generated catalogue under `knowledge/`, normalized sources and relationships under `data/`. The Yan Qinli story now has one Markdown source. Chinese and English passage text, sequence and citations were compared before retiring its JSON source.
- Website routing, source-backed relations and draft labels in `src/App.tsx`, `src/components/`, `src/domain/`, `src/i18n/` and `index.html`. The site uses React Markdown for authored paragraphs and a build-only YAML reader for their metadata.
- Generator, drift checks, Vite loader, strict release coverage and manifests in `scripts/`, `vite.config.ts`, package metadata and tests. The strict gate rejects draft articles and relationships.
- Contributor rules, onboarding and review in the README files, `AGENTS.md`, `CONTRIBUTING.md`, active project docs, templates, `.agents/skills/` and `.github/`. The public repository has knowledge, web and beta-feedback labels. Main requires a PR with a passing up-to-date check, including for admins. The coordinator can merge their own checked PR with the recorded self-review.

## Verification at implementation revision

Implementation head `f50505a108fb0031ae56fcf1cf53a563ac1e7a07`. The full changed-file list is available with `git diff --name-status 3e0450d f50505a`.

The keyless Pages-base configuration passed `npm.cmd run check` (type, data, generated catalogue, board, tests, preview bundle). The corpus comprises 74 structured works, 83 witnesses, 57 events and 119 sources. The beta adds four work guides, three people, two reading notes and one person-to-person relationship. The catalogue generator checked 75 pages. The strict check rejected drafts as expected. The original editorial warnings and Vite chunk-size warning remain.

Headless Edge exercised the keyboard entrance, browser Back, original witness URL refresh, person-to-work navigation, both relationship endpoints, English switching and a post-Qing work without coordinates. Responsive inspection verified [390 px](screenshots/036-390.png), [768 px](screenshots/036-768.png), [1440 px](screenshots/036-1440.png) and [native 200% browser zoom](screenshots/036-zoom.png). The zoom measurement was 705 CSS px at 1440 window width and DPR 2, with no horizontal overflow. No fabricated reader Issues were submitted for testing.

A fresh local clone of revision `65e0538507ee36b3175d14fc14895395cca4aa38` passed `npm ci` and the full keyless `npm run check` with 132 passing tests. All three submission forms passed structure checks. The three repo skills passed format validation. Public posting by a real new member remains for the beta group.

## Editorial and network limits

Teaching use of the two Yan steles is supported by a named teaching activity. The precise first printing and present classroom use of Shen Yinmo's Edition A still require evidence. Sources disagree on Shen's death year. The Zhao–Shen relation is an exchange of poetry. The public trial does not provide access control. Mainland desktop/mobile reachability and live tile availability require separate observations.
