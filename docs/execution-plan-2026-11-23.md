# Execution plan · 2026-11-23

Coordinator-facing plan for the next four weeks. This is not reader-facing prose and it does not
describe a milestone, so it adds no row to the iteration board and no `tasks/NNN-*` card. Convert any
section below into a task brief when the coordinator assigns it.

Baseline revision: `61a4a3d` (main, 2026-11-23). Every count in this document was measured at that
revision and will drift.

## 1. Baseline

| Measure | Value at `61a4a3d` | Note |
| --- | --- | --- |
| Works | 85 (36 reviewed, 49 draft) | 58% draft |
| Objects | 95 (37 reviewed, 58 draft) | 61% draft |
| Places | 33 (4 with coordinates) | 29 without a point |
| Sources | 141 | one never cited |
| Knowledge pages | 86 generated | `check:knowledge` clean |
| Media | 1 | task 037 could not fetch a licensed file |
| Data warnings | 39 (0 errors) | 38 `DATE_WITHOUT_ORIGINAL` + 1 `UNUSED_SOURCE` |
| Tests | 135 passing, 15 files | `npm test`, 36.8 s |
| `vite build` | not verified here | esbuild temp-file permission failure in this sandbox; CI is the authority |

The release gate treats any draft as a build error (`src/domain/validate.ts`, `DRAFT_IN_RELEASE`).
With 107 draft works and objects plus 10 draft knowledge records (117 release blockers), the project cannot produce a formal release today. Everything below is ordered
by how directly it moves that number or protects it.

## 1a. Progress against this plan

Execution of 2026-11-23, same day as the baseline:

| Item | Result |
| --- | --- |
| W4 render guard | `src/components/RootErrorBoundary.tsx` added and mounted in `main.tsx`; copy in both dictionaries; two tests |
| W4 place invariant | two `MISSING_PLACE` cases in `tests/validate.test.ts`; both reverse-checked by deleting the validator branch |
| Good-first issue 5 (`lang` guard) | `tests/document-language.test.ts`; reverse-checked against a changed `index.html` |
| W1 batch 1 (7 wording checks; 2 production dates deferred to W3) | **blocked** — no outbound network to `dpm.org.cn` or `digitalarchive.npm.gov.tw`, so no source wording can be read or quoted |
| W2 `README.zh-CN.md` | **withdrawn** — it is a redirect; `README.md` is the full Chinese entry |
| W2 dependabot, release notes, issues | **blocked** — the GitHub connector is disabled; issue texts are drafted in `.private/tmp/` and unresolved PRs are unchanged |

Test count moved 135 → 140 across 17 files. `typecheck`, `check:data`, `check:knowledge`,
`check:docs` and `test` pass locally; `vite build` still fails here on the esbuild temporary-file
permission error and is verified by CI only.

## 2. What this plan optimises

1. **Releasability.** Nothing else matters until `npm run release` can run.
2. **Reviewer independence.** Owner self-approval is currently the only path to `reviewed`.
3. **Contributor entry cost.** Use the existing Chinese README to direct new contributors to an actionable issue.

Explicit non-goals: no new runtime dependency, no framework change, no backend, no corpus expansion
until the draft backlog is cleared. A larger corpus with the same review capacity only raises the
draft ratio.

## 3. W1 — Close the 39 warnings (highest value, zero editorial risk)

### 3.1 Two different gaps hide behind one warning code

The rule is `date.kind !== 'unknown' && !date.original` → warn. Of the 38 hits:

- **28 are wording gaps.** A source is cited; it states the date in its own words; `original` is
  simply empty. Fix = transcribe the source wording, change nothing else.
- **10 are evidence gaps.** `witness-boyuan`, `witness-deng-kaishu`, `witness-dong-lunshu`,
  `witness-jizhi`, `witness-lanting`, `witness-wen-guiqulai`, `witness-yi-wuzi`, `witness-zhao-jijiu`,
  `witness-zhao-luoshen`, `witness-zhu-santi` carry **no source at all** on `productionDate` and no
  object-level `sourceRefs`. Writing an `original` here would invent a citation.

Treat the two differently. Do not open them in the same PR.

### 3.2 Batch by work family, five PRs

Grouping comes from `workId`, so one PR stays reviewable as one subject.

| PR | Work family | W1 wording checks + W3 evidence gaps | Files |
| --- | --- | --- | --- |
| 1 | 祭侄文稿 + 伯远帖 | 7 + 2 | `data/works/jizhi.json`, `data/objects/witness-jizhi.json`, `data/works/boyuan.json`, `data/objects/witness-boyuan.json` |
| 2 | 兰亭序 + 快雪时晴帖 | 6 + 1 | `data/works/lanting.json`, `data/objects/witness-lanting.json`, `data/works/kuaixue.json`, `data/objects/witness-kuaixue.json` |
| 3 | 楷书诗轴 + 行书论书卷 + 楷书归去来兮辞页 + 隶书五字横幅 | 4 + 4 | four work/object pairs |
| 4 | 篆书急就章轴 + 洛神赋 + 三体杂书诗卷 | 3 + 3 | three work/object pairs |
| 5 | 董美人墓志 + 寒食帖 + 麻姑仙坛记 + 松风阁诗 + 雁塔圣教序 + 多宝塔碑 + 玄秘塔碑 + 石鼓文 | 8 + 0 | single-field records |

PR 1 is the recommended first contribution: seven source-wording checks, three of which (`jizhi`) sit in one file
and read as one story.

### 3.3 Rules for every W1 PR

- Only add `original`. Do not touch `startYear`, `endYear`, `eraLabel`, `certainty`.
- `original` must be the cited page's or book's own wording, quoted, in the language of the source.
  If the source gives no wording (only a year), leave the field empty and say so in `note`/`noteZh`.
- Never add a source to close a warning. If no source states the wording, the warning stays.
- One PR ≤ 10 warnings, one work family, `npm run check:data` output pasted before and after.
- The 10 evidence-gap records go to W3 as editorial work, not to W1.

### 3.4 Commands

```bash
npm run check:data                       # 39 warnings, 0 errors
npm run check:data 2>&1 | grep DATE_WITHOUT_ORIGINAL
npm run check:data 2>&1 | grep UNUSED_SOURCE   # src-beilin-xiao-beilin
npm run check                            # typecheck + data + knowledge + docs + test + build
```

`src-beilin-xiao-beilin` is the one `UNUSED_SOURCE`. Either cite it where it belongs or delete it and
record the decision on the board. Do not leave it as a permanent warning.

## 4. W2 — Governance in one working day

### 4.1 Clear the four open pull requests

| PR | Content | Action |
| --- | --- | --- |
| #25 | `test-and-build` group, 2 dev updates | merge after CI |
| #11 | `@types/node` 22.19.1 → 22.20.5 | merge after CI |
| #8 | `actions/setup-node` 4.4.0 → 7.1.0 | one dedicated PR, all six pins together |
| #7 | `actions/checkout` 4.4.0 → 7.0.1 | same PR as #8 |

Actions are pinned by commit SHA in six places across `check.yml` and `pages.yml`; a major bump must
change the SHA and its trailing comment together. `.github/dependabot.yml` currently declares only the
`npm` ecosystem, so action majors arrive ungrouped and unignored. Add a `github-actions` entry with the
same `semver-major` ignore, otherwise this queue rebuilds itself next week.

If a major cannot be verified in one CI run, close the PR and add the ignore. A permanently red
dependency PR trains readers to ignore CI.

### 4.2 Two documents

- `README.zh-CN.md` is three lines **by design**: it redirects to `README.md`, which is already the
  full Chinese entry (positioning, five reader paths, beta caveat, licence). Written during execution
  of this plan; do not expand the stub into a second README. The earlier assessment counted the stub
  as a documentation gap and was wrong about it.
- The `v0.2.0-beta.1` release has no notes. Add: what the beta contains, that drafts are visible and
  labelled, and that the strict release gate has not passed.
- `docs/CONTRIBUTE.zh-CN.md` exists; confirm `README.md` links to it rather than restating it (it does).

### 4.3 Five good-first issues

Open in the repository's own templates (`knowledge.yml`, `web-task.yml`). Each states files, an
acceptance example, and the check command.

1. **`[资料]` 核对 7 条日期原文措辞（祭侄文稿 / 伯远帖族）** — W1 PR 1, files listed, acceptance: record which of the seven fields have verified wording and which remain open; preserve the years. Track both witness production dates in W3.
2. **`[资料]` 为 10 件实物补 `productionDate` 来源** — W3 evidence gap; acceptance: each record cites a
   catalogue entry that states the production period; `original` filled only where the source gives
   wording.
3. **`[Web]` 回归测试：悬空 `placeId` 必须被校验器拒绝** — `tests/validate.test.ts`; the map panel's
   `requirePlace` throws on purpose, so a test must prove the validator never lets that happen.
   Error code to assert: `MISSING_PLACE`.
4. **`[资料]` 删除或引用 `src-beilin-xiao-beilin`** — acceptance: `UNUSED_SOURCE` gone, decision
   recorded, no orphan left.
5. **`[Web]` 锁住 `index.html` 的 `lang` 声明** — `tests/app.test.tsx` asserts the runtime value but
   nothing fails if someone edits `index.html`. AGENTS.md requires the declared language to match the
   default; a first paint, a reader without JavaScript and a crawler must not disagree.

Issues 3 and 5 need no stele reading and no new dependency. Start there. The sourcemap item is
deliberately **not** an issue: its release path cannot be verified until the draft backlog clears, and
an acceptance step that cannot be run is not an acceptance step.

## 5. W3 — Review pipeline (the only thing that unlocks v1.0)

49 draft works by period: Tang 13, Eastern Jin 7, Northern Song 7, Qing 4, Ming 4, Yuan 3, Eastern Han
3, Northern and Southern 3, Qin 2, Sui 1, Western Jin 1, Pre-Qin 1.

Batch in that order, 10–15 records per batch, one batch per review cycle:

| Batch | Period | Draft works | Why first |
| --- | --- | --- | --- |
| B1 | Tang | 13 | Densest, best institutional catalogues, highest reader value |
| B2 | Eastern Jin + Western Jin | 8 | 帖 side; overlaps the 10 evidence gaps above |
| B3 | Northern Song | 7 | 寒食帖、松风阁 already have sources, only wording missing |
| B4 | Ming + Qing | 8 | Later hands, thinner catalogues, expect more open questions |
| B5 | Yuan + Han + Qin + Sui + Pre-Qin + N&S | 13 | Mixed; batch by object family, not by period |

Track the 58 draft physical objects individually alongside their works. Also queue the four work guides, three people, two notes and one relationship for editorial review. Re-run `npm run check:release` to identify remaining records in both categories.

Each record returned for review carries three fields, not a rewritten entry:

- what the cited institution states, quoted;
- which structured fields stay empty and why;
- which points need a historian's judgement (dating disputes, attribution, recut vs original).

The reviewer records identity and date in `review.note`. With no second reviewer, the honest state
stays `reviewed` with "Owner approved … independent review remains pending". Do not rewrite it as
accepted; acceptance is the coordinator's call and is recorded on the board.

**Decision needed from the coordinator:** keep owner-only approval (fast, keeps the credibility gap) or
recruit one or two 碑帖 reviewers (2–3 weeks to find, then a slower cadence). The plan works either way;
only the acceptance date changes.

## 6. W4 — Robustness (two small items, not the four I first listed)

Checked against the source, two items from the earlier assessment do not hold:

- **Dangling `placeId` is already a validation error** (`src/domain/validate.ts:569` for
  `currentCollection`, `:618` for provenance events). No rule needs adding.
- **`MapPanel` throwing on a missing place is deliberate.** `requirePlace` carries a comment saying a
  throw keeps a broken corpus visible, and `unmappedRows` already handles `place: undefined` for
  unknown custody. Adding a fallback would hide exactly the failure the design wants surfaced.

What is genuinely missing:

1. **No `ErrorBoundary`.** One render throw blanks the page. Add a boundary at the app root with a
   readable fallback, a link back to the list, and one test that forces a throw.
2. **No regression test for the invariant `requirePlace` relies on.** `tests/validate.test.ts` covers
   dangling source refs and object-to-object relationships, but not `placeId` on a collection or on a
   provenance event. Two cases, ~30 lines.

## 7. W5 — Deferred (do not start before W1–W2 land)

| Item | Change | Why deferred |
| --- | --- | --- |
| Release sourcemap | `vite.config.ts:45` `sourcemap: true` → dev only | Cosmetic until a release exists; also unverifiable in this sandbox |
| Knowledge/three lazy load | dynamic import for three and knowledge data | Needs a measured baseline from CI |
| `Locale` unification | three `export type Locale` definitions (`src/i18n`, `src/domain/text.ts`, `src/domain/attribution.ts`) | Behaviour-neutral refactor, no reader value |

## 8. Schedule

| Week | Deliverable | Exit check |
| --- | --- | --- |
| 11/24–11/30 | W1 PR 1–2 merged; dependabot queue empty; Chinese README entry path verified | `check:data` ≤ 22 warnings; 0 open dependency PRs |
| 12/1–12/7 | W1 PR 3–5; five issues open; B1 (Tang, 13) sent for review | warnings = 0 or each has a written exemption; one external PR opened |
| 12/8–12/14 | B2 review; ErrorBoundary + place-ref tests | a forced render throw shows the fallback |
| 12/15–12/21 | B3 review; W5 first item | `npm run release` reaches the gate and fails only on remaining drafts |

## 9. Risks

| Risk | Signal | Response |
| --- | --- | --- |
| Wording fix turns into a history edit | diff touches `startYear` | Review rule: W1 diffs may only add `original` and `note` |
| Corpus keeps growing, draft ratio rebounds | draft count rises while W1 runs | Freeze new records until B1 is accepted |
| Actions major bump breaks the build | CI red on the bump PR | Revert, add `semver-major` ignore for `github-actions`, record why |
| No second reviewer found | end of W2 | Publish the gap explicitly in README and release notes |
| "Green" claimed from a partial run | only `typecheck` run | Report unrun checks as unrun; `vite build` counts only from CI |
| Review scope creep | one record opens ten questions | Priority: reader-visible claims; the rest goes to `canonical-coverage.md` open questions |

## 10. Acceptance

- [ ] `npm run check` green in CI on two consecutive revisions.
- [ ] `check:data`: 0 errors, 0 `DATE_WITHOUT_ORIGINAL`, 0 `UNUSED_SOURCE` (or each has a written
      exemption with a reason).
- [ ] `npm run release` produces a manifest; `check:release` passes before any formal publication.
- [ ] A new contributor can follow the existing Chinese README to the setup guide and run `npm run check`.
- [ ] Five issues open, each with files, acceptance example and command.
- [ ] Every `reviewed` record names its reviewer and date.
- [ ] A forced render throw shows the fallback; a dangling `placeId` fixture fails validation.
- [ ] Every PR states which checks were run and which were not.

## Appendix — the 38 warnings by record

Run `npm run check:data` for the current list; the grouping below is what it resolves to at `61a4a3d`.

| Work family | Records and fields |
| --- | --- |
| jizhi (5) | `jizhi.compositionDate`, `witness-jizhi.productionDate`, `witness-jizhi.provenanceEvents[0..2].date` |
| boyuan (4) | `boyuan.compositionDate`, `witness-boyuan.productionDate`, `witness-boyuan.provenanceEvents[0..1].date` |
| lanting (4) | `lanting.compositionDate`, `witness-lanting.productionDate`, `witness-lanting.provenanceEvents[0..1].date` |
| kuaixue (3) | `kuaixue.compositionDate`, `witness-kuaixue.provenanceEvents[0..1].date` |
| deng-kaishu, dong-lunshu, wen-guiqulai, yi-wuzi, zhao-jijiu, zhao-luoshen, zhu-santi (2 each) | work `compositionDate` + witness `productionDate` |
| dong-meiren, hanshi, magu, songfeng, yanta (1 each) | work `compositionDate` |
| duobao-ta-bei, xuanmi-ta-bei (1 each) | `provenanceEvents[0].date` |
| stone-drum-inscriptions (1) | `stone-drums-original-set.provenanceEvents[1].date` |
