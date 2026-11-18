# Task 017 | Close the review's defects and codify synchronization

Base revision `b85c0f47569ab67c2cbfdecdfe1a3c30ebfd03c8`. The owner asked for the four verified defects and the workflow gaps from the 2026-11-18 technical review to be fixed, for the project rules to carry the missing constraints, and for the result to be synchronized to GitHub.

- Show the work-level editorial notes that the detail view currently hides; keep missing translations visible as recorded rather than generated.
- Add a validator rule for bilingual note arrays: a present-but-misaligned translation is an error, a missing translation is one aggregated warning.
- Declare the Chinese interface language in `index.html` instead of English.
- Cache the validation report instead of recomputing it on every render.
- Harden CI: concurrency, timeout, `git diff --check`, pinned action commits, dependency updates.
- Add a reproducible preview/release artifact workflow that stops at the host upload, because no host account is authorized yet.
- Make the iteration board verifiable: one canonical state keyword per row, checked by a script that also rejects broken evidence links and missing rows.
- Record the GitHub synchronization requirement, the review-versus-acceptance rule, and the documentation-language rules in `AGENTS.md`.

Out of scope: changing the public host (owner decision, review §3), editing corpus claims, and marking any draft record as reviewed.
