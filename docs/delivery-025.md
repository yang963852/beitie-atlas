# Delivery 025 | Catalogue audit and handoff

Task branch `codex/025-catalogue-audit` from `40acd37a96600848c9b906710890b1a11eb868e2`. The public preview under review was Sites v7, deployed from GitHub revision `6b15362f397049934dde6c928d07f77cd2b4433a`. This task produces source and evidence for owner review. The published catalogue is identified in [delivery 024](delivery-024.md).

## Editorial changes and handoff

The [editorial ledger](editorial-review-025.md) groups all 30 draft witnesses under 28 works. It records institutional evidence, attribution qualifications, catalogue identifiers and follow-up questions. The 26 Chinese-note gaps comprise 22 works and four places. An apparent orphan in the active bibliography is cited by two archived records. All draft approval states are preserved.

Compared with the task base, 17 previously empty catalogue numbers and 11 previously empty dimension fields now carry museum evidence. The Shenlong copy records the museum’s reservations about the traditional copyist. The physical 雁塔圣教序 rubbing is dated to the Ming.

The changes touch the witness and work JSON named in the ledger, the source title for the Shenlong copy, both main READMEs, the maintainer handoff, release runbook, board and task record. The latest trial and the last approved edition now have separate entry points.

## Dependency decisions

GitHub reported a successful preview check for each candidate. Workflow-dispatch builds on the individual candidate heads ran in preview mode at the root base path. Each downloaded ZIP contained an index marked preview and the JavaScript asset referenced by that index. These candidate artifacts are diagnostic builds of older revisions.

| PR and candidate | Decision and evidence |
|---|---|
| [7, checkout 7.0.1](https://github.com/yang963852/beitie-atlas/pull/7), d0276e9 | Eligible for separate owner merge after the current merge candidate passes CI. [Artifact round trip](https://github.com/yang963852/beitie-atlas/actions/runs/44271719467), 433181 bytes, SHA-256 1e87db1781b8ab69f9cabb20001f8d6a860a53b56ba58646d2b2b588c3b04722. |
| [8, setup-node 7.1.0](https://github.com/yang963852/beitie-atlas/pull/8), 3ccda88 | Eligible under the same condition. The candidate installed dependencies and built the downloadable preview. [Artifact round trip](https://github.com/yang963852/beitie-atlas/actions/runs/44271725917), 433181 bytes, SHA-256 e28b0f1d14e14c532e309ef4c578ca7048fabe1818f7a5922aac0fd4d9b8901c. |
| [9, upload-artifact 7.0.2](https://github.com/yang963852/beitie-atlas/pull/9), 0fb53c8 | Eligible under the same condition. Verified upload and download using the changed action. [Artifact round trip](https://github.com/yang963852/beitie-atlas/actions/runs/44272234751), 433181 bytes, SHA-256 cb22cafbb388dbd8584b7fa994b0c8245d769c0e62f52641b70282456f768c2d. |
| [11, Node types](https://github.com/yang963852/beitie-atlas/pull/11), cd14d8c | Eligible after current CI. Manifest changes only the development type declarations from 22.19.1 to 22.20.5, with corresponding lockfile update. |
| [12, testing-library/dom](https://github.com/yang963852/beitie-atlas/pull/12), d21f664 | Eligible after current CI. Manifest changes only the test dependency from 10.4.1 to 10.4.2, with corresponding lockfile update. |

## Local verification

Verified implementation and handoff revision `28cf80b00c64630b103853aae0475cd1df078107`. On Node 24.16.0, `npm.cmd run check` passed type checking, data validation, the 25-row board check, all 120 tests and the preview build. Data warnings fell from 36 to 28. The final JavaScript file measured 579.29 kB (172.61 kB gzip). `npm.cmd run check:release` exited 1 on the expected 58 drafts. A separate ID comparison matched every draft work and witness to the editorial ledger. Relative links in both READMEs, the handoff, ledger and release instructions resolved locally.

## Hosted reader checks

A separate Codex reviewer session on Windows opened the public v7 URL in the Codex browser. The catalogue showed 69 of 69 witnesses. Searching 兰亭序 narrowed the results to one. Selecting it and refreshing `#/object/witness-lanting` restored the same record. Enter expanded both the editorial disclosure and the place list, which exposed 19 locations associated with objects. At least eight 256-pixel map tiles decoded and rendered. Four places have stored coordinates in the dataset.

The [390 px](screenshots/025-hosted-390.png), [768 px](screenshots/025-hosted-768.png) and [1440 px](screenshots/025-hosted-1440.png) captures show the deployed preview. Page scroll width equalled client width at each viewport (390, 753 and 1425 px respectively, accounting for the scrollbar). The terminal HTTPS probe from the same machine received 403 after 644 ms, including 641 ms to first byte. That timing measures the refusal response. Mainland desktop and physical phone carrier paths require separate observations.

A second Windows browser check used a fresh Microsoft Edge headless profile, a 1440-pixel outer window, and Chromium’s native 200% zoom preference. The effective viewport changed from 1410 to 705 CSS pixels and devicePixelRatio from 1 to 2. The refreshed [hosted detail](screenshots/025-hosted-zoom200.png) and [updated local detail](screenshots/025-local-zoom200.png) both rendered without horizontal page overflow. In an uncached navigation at normal zoom the public home returned HTTP 200 and completed the load event in 1.53 seconds. A repeat cold navigation returned 200 with load at 8.00 seconds and first contentful paint at 8.37 seconds. These two samples show substantial variation. A mainland carrier timing and request waterfall are needed before attributing the delay to bundle size. Bundle optimization is deferred.

Blocking Tianditu domains only in the isolated browser and reloading produced a retry control, coordinate schematic and an open, populated location list in both the [hosted preview](screenshots/025-hosted-fallback.png) and [local candidate](screenshots/025-local-fallback.png). This controlled provider outage complements the ordinary live-tile check.

Outcome: partially verified, Codex self-review. The owner retains editorial approval and merge acceptance. No change was deployed to Sites. Source files and evidence for this task can be enumerated with [the branch comparison](https://github.com/yang963852/beitie-atlas/compare/40acd37...codex/025-catalogue-audit).
