# Delivery report

Optional. Use for a formal release or a large migration when a longer record is useful. Routine changes use the PR; a release may use a short `CHANGELOG.md` entry instead. Attach UI screenshots to the PR or issue instead of committing them to `docs/`.

Task ID:
Date:
Implementation branch and commit, if any:

## Result

State what now works in observable terms. Distinguish implemented, verified, and still pending.

## Changed files

List meaningful files and their purpose. Do not dump generated dependencies.

## Run and inspect

Exact setup/start commands and preview address:
Required non-secret configuration:

## Verification evidence

UI screenshots belong in the PR or issue; link them here rather than adding binary files to the repository.

| Check | Result: passed / failed / not run | Evidence or limitation |
| --- | --- | --- |
| Type check | | |
| Data validation | | |
| Production build | | |
| Live smoke test (home, work, object, search, phone width) | | |

Use the full access matrix below only when the owner asks for a formal host check.

| Check | Result: passed / failed / not run | Evidence or limitation |
| --- | --- | --- |
| Object identity and source review | | |
| Browser interaction | | |
| Mainland desktop access | | |
| Mainland mobile access | | |
| Overseas access | | |
| Map failure fallback | | |

## Known issues and decisions

List remaining issues, relevant source gaps, provider conditions, and proposed decisions. Never include secret values in this report.

## Decision

Who merged it and when. Self-review is acceptable; no separate acceptance record is required.

Link the PR, resulting revision and any separate deployment. Describe any remaining source gap or limitation; never include secret values.
