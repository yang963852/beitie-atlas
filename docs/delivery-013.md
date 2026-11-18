# Delivery 013 | First evidence pass for the public atlas

> Note added 2026-11-18, not part of the original report: the GitHub Pages publishing described
> below was retired in task 014 and the public host is Codex Sites. The evidence audit itself
> remains open; 69 records are still draft.

Base revision `6f1a3affba3c146e3aaa0bfbaee2569f8ce8d714`. The commit introducing this report identifies the audited revision. Scope is the complete 33-work, 36-object corpus. Status is partially verified. This pass inventories the evidence and makes bounded corrections. All 69 work and object records remain draft pending editorial acceptance.

## Changes checked against sources

| Record | Change | Evidence |
| --- | --- | --- |
| 颜勤礼碑 original stone | Added the holding museum's object catalogue and body measurements. The 1922–1948 events remain attached to the stone. | [Xi’an Beilin Museum catalogue](https://www.beilin-museum.com/index.php?a=index&aid=2582&c=View&m=home) |
| 张迁碑 | Replaced a secondary album note as the holding basis with the official report that identifies the Tai’an Museum holding. Exact display and storage remain unspecified. | [Museum activity report](https://tsgw.taian.gov.cn/art/2025/5/19/art_48253_10316874.html), [Dai Temple museum site](https://tsgw.taian.gov.cn/art/2021/6/13/art_363479_10320189.html) |
| 石门颂 | Cited the district's list and account of the relocation. Kept the relocation approximate and left the carving month empty. | [Hantai district account](https://www.htq.gov.cn/hzshtqzf/zjht/lswh/201707/312e445fc8eb26fd26e26ed8d7f0edf8.shtml) |
| 神策军碑 Song rubbing | Added the holding institution's object page for the surviving rubbing and the credited hands. Existing evidence for the 1965 purchase remains separate. | [National Museum of Classic Books](https://www.nlc.cn/nmcb/jpww/gengu/20240904_2641037.shtml) |
| 温泉铭 Tang rubbing | Added a firsthand study confirming the holding and call number. Removed the unqualified claim that it is the earliest surviving rubbing of any Chinese inscription. | [Shi Anchang's study, p. 71](https://www.dpm.org.cn/Uploads/pdf/1887/T00071_00.pdf) |
| 曹全碑 | Cited both 185 and 186 readings and kept the date disputed. Published width readings are 95 and 123 cm, so the structured dimensions give only the agreed height. | [Beilin current entry](https://beilin-museum.com/index.php?a=index&aid=145&c=View&m=home), [Beilin alternate entry](https://www.beilin-museum.com/index.php?a=index&aid=2996&c=View&lang=en&m=home), [Palace Museum account](https://www.dpm.org.cn/collection/impres/228534.html) |
| 大秦景教流行中国碑 | Marked the discovery date as disputed, with 1623 and 1625 as the two reported dates. Kept the 1907 transfer separate. | [Beilin collection catalogue](https://www.beilin-museum.com/index.php?a=index&aid=2577&c=View&m=home), [Beilin alternate account](https://www.beilin-museum.com/INDEX.PHP?a=index&aid=2999&c=View&m=home) |

## Coverage and open checks

The original 46 source links were queried. Some returned only indexed excerpts or failed to load on direct open. The checks below describe what is still needed against the existing claim inventory. A reachable page alone does not establish every claim in a record.

| Group | Objects | Priority for the next pass |
| --- | ---: | --- |
| Xi’an Beilin | 16 | Match the official object entries to the credited engravers and dates. Check the alternative readings for 曹全碑 and 景教碑 and the disputed attribution of 赵子昂游天冠山诗. Reconcile production and composition dates for later carvings. |
| Qufu Han–Wei Stele Gallery | 7 | Retrieve the individual pages for 五凤刻石, 陈叔毅修孔子庙碑 and 张猛龙碑, and verify object-level dates for the Confucius Temple steles. The gallery's 北陛石 entry identifies the dated stone and its documented transfers. |
| Palace Museum | 3 | Match the three object numbers and rubbing eras against the catalogue. The 天发神谶碑 page is directly accessible. The 颜勤礼碑 and 张猛龙碑 catalogue details were visible in search results, and direct-page access was intermittent. |
| Jinci Museum | 2 | Recover the municipal source and independently compare the Tang stone and the 1772 recarving, including the approximate 984 transfer. |
| Other holdings | 8 | Read the [BnF catalogue entry for P.4508](https://archivesetmanuscrits.bnf.fr/ark:/12148/cc120773g), which returned HTTP 403 during this pass. A [Baoji municipal account](https://www.baoji.gov.cn/col26/col95/201705/t20170525_10385.html) confirms the 632 carving date and the original stone at the Jiucheng Palace site. Jiaoshan and Wuxi claims, the early-Ming discovery account for 张迁碑 and the 1965 神策军碑 acquisition date still need primary evidence. |

The four map points are secondary WGS84 references for institutions or complexes. Coordinate checks must preserve those limits. There are no media assets in the release corpus. Source titles remain as citations. Descriptions use original prose.

## Engineering evidence

- `npm.cmd run check` passed type checking, data validation with zero reported findings, 97 tests, and the Vite build. `git diff --check` passed.
- `npm.cmd run check:release` rejected all 69 draft work and object records as expected.
- A keyless preview build with `VITE_BASE_PATH=/beitie-atlas/` produced HTML with working path references for its bundled CSS and JavaScript. The build was isolated from the public site.
- `tests/seed-records.test.ts` keeps source and coordinate checks while allowing independently approved records to transition from draft. The strict release gate still rejects drafts.
- The public Pages site serves the project overview while editorial review remains open. The final atlas also requires a checked release artifact and verification on the hosted path.
