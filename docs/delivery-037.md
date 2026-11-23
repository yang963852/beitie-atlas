# Delivery 037 — Corpus completion and the image-rights gap

Base revision: `1bcd98b` (merge of PR #26, `main`). Implementation revision: `d825f2b`. Documentation revision: `0749b1c`. Branch: `task/037-corpus-completion`. Pull request: [#27](https://github.com/yang963852/beitie-atlas/pull/27), open and awaiting the coordinator's decision.

## What changed

| Area | Before | After |
| --- | --- | --- |
| Works | 74 | 85 |
| Physical objects | 83 | 95 |
| Places | 25 | 33 |
| Sources | 119 | 141 |
| Events | 57 | 69 |
| Media items | 1 | 1 |

Eleven works were added, each with at least one physical object and its own
institutional evidence:

| Work | Period | Object(s) | Principal evidence |
| --- | --- | --- | --- |
| 平复帖 | 西晋 | 纸本卷, 故宫, 新00044430 | 故宫藏品页 |
| 十七帖 | 东晋 | 十三世纪拓本册, 大都会, 1991.380 | 澎湃展览报道 + 大都会藏品接口 |
| 洛神赋十三行 | 东晋 | 玉版刻石, 首都博物馆 | 人民日报海外版 + 央广网 |
| 好太王碑 | 东晋·高句丽 | 原石, 集安 | 吉林省地方志两则 |
| 始平公造像记 | 北魏 | 古阳洞北壁摩崖 | 光明网 + 上海市文旅推广网 |
| 虞恭公碑 | 唐 | 原石（昭陵博物馆）+ 南宋拓册（故宫） | 故宫两则 + 国图石刻叙录 |
| 颜氏家庙碑 | 唐 | 原石, 西安碑林 | 西安碑林条目 |
| 万岁通天帖 | 唐 | 唐摹卷, 辽宁省博物馆 | 辽博藏品页 + 光明网 + 中新网 |
| 胆巴碑 | 元 | 纸本卷, 故宫 | 故宫赵孟頫专题页（含款识） |
| 三门记 | 元 | 纸本卷, 东京国立博物馆 TB-1461 | 东博著录 + ColBase |
| 三希堂法帖 | 清 | 刻石, 北海阅古楼 | 故宫词条 + 故宫拓本页 + 中国日报 |

The bilingual note backlog is closed: 22 works and 4 places carried English-only
editorial notes; each now has a Chinese counterpart with the same count and order,
and the aggregated `NOTES_NOT_TRANSLATED` warning is gone.

`docs/canonical-coverage.md` now records what was filled and what remains, including
the new image section described below.

## Deliberate omissions

- **史晨前碑/后碑** are two faces of one stone, not two objects. The existing
  object record was left as one and the distinction was not turned into a second
  physical object.
- **张黑女墓志** was not added. The Shanghai Museum page names the work and its
  period but gives no accession number, plate or physical form, and the coverage
  note's requirement — match the He Shaoji album against a catalogue — is still
  unmet. Adding a holding on that page alone would overstate it.
- **大观帖, 绛帖, 汝帖, 秘阁帖, 黄庭经, 宣示表, 荐季直表** remain gaps: no citable
  item-level page was located in this pass.
- Records whose source gives no year carry `kind: "era"` rather than a converted
  date (洛神赋十三行's carving, 三门记's scroll). No age-to-year arithmetic was
  performed.

## Images

No `media` item was added, and this is a reported limitation rather than an
oversight. Two open-access catalogues were identified and checked:

- The Metropolitan Museum's Asian Art department holds twentieth-century rubbings
  of 孔子庙堂碑 (1977.375.12), 多宝塔碑 (1977.375.13), 颜氏家庙碑
  (1977.375.14a–d), 玄秘塔碑 (1977.375.17) and 峄山碑 (1977.375.5), and a
  thirteenth-century 十七帖 album (1991.380). Its API returns
  `isPublicDomain: true` with credit lines and accession numbers.
- Wikimedia Commons is the source of the project's existing 神龙本 crop.

From this working network on 2026-11-23, `commons.wikimedia.org` and
`upload.wikimedia.org` timed out; `images.metmuseum.org` returned a bot-protection
HTML page instead of image bytes (1 KB, `text/html`), with and without a browser
User-Agent and Referer; `www.metmuseum.org` did not load. No licence page could be
read and no file could be inspected, so no image was bundled and no remote URL was
recorded as if it were a licensed asset. `docs/canonical-coverage.md` carries the
leads so a later editor with access can complete the step.

## Commands and outcomes

```
npm run check:data        # 85 works, 95 objects, 33 places, 141 sources, 69 events, 1 media; 0 errors
npm run knowledge:generate # 86 pages checked, 34 refreshed
npm run check             # typecheck, data, knowledge, board, tests, build — all passed
npm run test              # 135 tests in 15 files, all passed
```

Two existing assertions were updated rather than deleted:

- The period-grouping test now expects the new 西晋 group that 平复帖 creates.
- The note-language test asserted that an untranslated note renders in English.
  It now checks the Chinese wording under `lang="zh-Hans"`, then switches the
  interface to English and checks the recorded English wording under `lang="en"`,
  so both directions stay covered.

## What is not verified

- No stone, scroll or rubbing was examined. Every record is `draft` and waits for
  editorial review.
- The 西安碑林 page for 颜氏家庙碑 did not respond to a second request during the
  check; the record says so in its review note.
- 大都会's object page could not be opened; its fields were read through the
  museum's public collection API, which the record discloses.
- No layout changed, so no 390/768/1440 screenshots were produced. The period
  grouping and note language were exercised through the test suite only.
- A local preview does not prove mainland reachability of any external source.
- The `compiler` role renders as 集字 in Chinese, which fits 怀仁's assembly of
  Wang Xizhi characters but reads loosely for an editor of a compendium such as
  弘历 or 梁诗正. The role enum has no separate 编次 value; the records state the
  editorial act in their notes rather than changing the shared label in this PR.
  This is a P3 label question for a later interface task.

## Review

Self-review only, by the implementing agent: the data validator, the knowledge
generator, the test suite and the production build all pass. Acceptance is the
coordinator's decision; this report does not claim it.
