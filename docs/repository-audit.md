# Public repository audit

Task D-004 (2026-11-25). Scope: personal information in tracked files, credential exposure, ignore rules, workflow permissions, rights statements and documentation drift. Method: `git grep` over tracked files, review of configuration files, and a read of the compiled interface. This is a repository hygiene review, not a security audit of dependencies or the hosting provider.

Baseline: `eccc9b5`, 822 tracked files.

## Findings

| ID | Severity | Finding | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| A-01 | P2 | Local absolute paths with the maintainer's Windows user name are published in four documents. They expose the local folder layout and break copy-paste for other contributors. | `AGENTS.md:30`; `docs/agent-workflow.zh-CN.md:37-38`; `docs/delivery-045.md:26`; `docs/map-setup.md:61` | Replace with repository-relative paths or `<project-root>` placeholders. Keep the WorkBuddy application path only where it explains an environment-specific rule, and label it as this machine's example. |
| A-02 | P2 | `NOTICE.md` states that the compiled interface carries no media records, but it carries one (the Shenlong Lanting opening, Public Domain Mark 1.0). A stale rights statement is worse than none: it tells a reuser that no third-party image obligations exist. | `NOTICE.md` paragraph 2; `data/index/knowledge-v1.json` `media[0]` | Reword to describe the rule instead of a count, and require rights fields for every record. Corrected in this revision. |
| A-03 | P3 | `docs/map-setup.md` mixes two audiences: contributor setup and the owner's local key check. Steps that name the owner's folder read as instructions to everyone. | `docs/map-setup.md:61` | Split the owner-only step into a labelled subsection, or move it to the release runbook. |
| A-04 | P3 | Node version has two sources of truth: `.nvmrc` says 24, `package.json` says `>=22.12.0`. CI follows `.nvmrc`; a contributor on 22.12 is told by `engines` that they are supported but is never tested there. | `.nvmrc`; `package.json:engines` | Either test the minimum in CI or raise `engines` to `>=24`. Record the decision either way. |
| A-05 | P3 | The generated interface is a single large JSON file. It is excluded from text diffs by `.gitattributes`, so a reviewer who reads a normal diff cannot see data changes; they must use `git diff --text` or the source Markdown. | `.gitattributes`; `data/index/knowledge-v1.json` | Keep the current rule but repeat the `--text` instruction wherever reviewers are told to inspect generated changes. |
| A-06 | Info | No private keys, tokens, `sk-` strings or personal e-mail addresses were found in tracked files. `.env`, `.env.*`, `.private/`, `dist/` and the download ZIP are ignored. | `git grep` patterns; `.gitignore` | No action. Keep browser keys out of commits; a Vite key is public after bundling. |

## Verified good practice

- GitHub Actions are pinned to full commit SHAs (`actions/checkout`, `setup-node`, `configure-pages`).
- Workflow permissions are `contents: read`; the Pages job builds and uploads an artifact instead of committing output.
- `index.html` declares `lang="zh-Hans"`, matching the default interface language.
- The MIT licence covers code and original editorial work; `NOTICE.md` separates third-party rights.
- No `TODO` / `FIXME` / `HACK` markers remain in `src/` or `scripts/`.
- The retired pre-rebuild corpus is not referenced from `src/` or `scripts/`; the isolation check enforces this.

## Changes made in this task

- `NOTICE.md`: replaced the false "no media records" sentence with the rule that every media record must carry creator, licence, credit, source and permission evidence, and that a link does not prove reuse permission.

All other findings are reported for the coordinator to schedule; none changes reader-facing behaviour.

## Follow-up

1. A-01 and A-03: one documentation-hygiene PR, owner decides whether the WorkBuddy path stays as a labelled example.
2. A-04: decide between raising `engines` and adding a minimum-version CI job.
3. A-05: add one sentence to the review guide if reviewers keep missing compiled-data changes.
