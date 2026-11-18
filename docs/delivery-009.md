# Delivery report

Task ID: 009 — periods, credited hands, and a map decision
Date: 2026-11-18
Base revision: working tree after task 008 (uncommitted); `npm run check` green at 76 tests before this round

## Result

The atlas is now ordered by **period** and every work states **who is credited**, including
the works that name nobody. `npm run check` is green at **83 tests**; 22 works, 24 objects,
15 places, 32 sources, 16 events, all still draft.

## Periods

`Work` gains `dynastyId` (required) and `dynastyQualifier` (optional, for a narrower label
such as 南朝梁). The table lives in `src/domain/dynasties.ts` with 21 periods, an explicit
`order`, and start/end years used only as a sanity check.

Two decisions worth recording:

- **Order is explicit, not derived from years.** The Liao began in 907, before the Northern
  Song in 960, yet a Chinese stele sequence lists the Song first. Sorting by `startYear`
  would produce a defensible but wrong reading order.
- **A work is filed under the stone, not the paper.** The Republican rubbing of 颜勤礼碑 now
  sits next to its Tang stele instead of at the end of the list. The row still shows 拓本 and
  its own date, so the distinction stays visible.

Current coverage: **东汉 6、南北朝 1（南朝梁）、唐 15**. The mechanism is general; the axis is
thin because the corpus is thin, not because the table is.

## Credited hands

`Attribution` gains `note` / `noteZh`, and the role list expands from five to eight:

| Role | zh | Count |
| --- | --- | --- |
| author-and-calligrapher | 撰文并书丹 | 5 |
| author | 撰文 | 9 |
| calligrapher | 书丹 | 10 |
| engraver | 刻字 | 3 |
| title-writer | 篆额 | 1 |
| compiler | 集字 | 2 |
| sponsor | 立石 | 2 |
| unknown | 未署名 | 5 |

**Newly documented, with the source that says so**

- 张迁碑 — 刻工 **孙兴**，碑文“賃師孫興，刊石立表”；立石者韦萌等（国家图书馆《北京图书馆藏石刻叙录（六）》）。
- 玄秘塔碑 — 刻工 **邵建和、邵建初**（西安碑林官方页面）。
- 多宝塔感应碑 — 刻工 **史华**（文化艺术报、中国政法大学法律古籍整理研究所）。
- 石台孝经 — **李亨篆额**（中国政法大学法律古籍整理研究所）。
- 开成石经 — **郑覃**主持校定，**艾居晦、陈玠、段绛等**书石（中国教育网络电视台、西安碑林）。
- 曹全碑 — 立石者 **王敞、王毕等**，碑上无撰书人（故宫博物院、学习强国）。

**Five works now say “未署名” explicitly.** 乙瑛碑、礼器碑、史晨碑、曹全碑、张迁碑 的书丹者
都没有可靠署名。校验器把空数组视为错误：说“不知道”必须是一个条目，不能是一片空白。

## What was deliberately not added

- **石门颂的书丹者**：网络文章作“王戎”，汉中方面 PDF 作“王戒”，两说均非机构定论，只记作者王升。
- **麓山寺碑的“黄仙鹤刻”**：只见于地方公众号，未采信。
- **圣教序的刻工**：碑林页面明确说碑末第三十行刻有勒石、镌字工匠名 32 字，但页面未录名字，故留空并记下这条线索。
- **神策军碑、九成宫、颜勤礼碑的刻工**：没有可靠来源，一律不填。

## Map

新增 `docs/map-options.md`：六种底图方案的密钥、坐标基准、合规与成本对比，以及为什么
**点位比底图更卡**（15 处地点仅 2 处有坐标，维基数据返回值被舍入到约 1 公里，达不到
`institution` 精度要求）。结论是天地图为主底图、无底图示意永久保留，地理编码是补齐
13 处点位的唯一可扩展路径，而这两件事都需要同一把密钥。

## Evidence

- `npm run check`: typecheck, data validation (0 errors), 8 files / 83 tests, preview build
  24.29 kB CSS + 396.41 kB JS.
- `docs/screenshots/009-desktop.png`: 东汉 group heading with count, a credited-hands line on
  every row, and the 署名 section in the detail panel.
- New tests: period filing and ordering (including the rubbing staying with its stele),
  empty attribution rejected, unknown role rejected, invalid period rejected, group headings
  and credited hands rendered.

## Still open

- The map still needs a Tianditu key (task 004); nothing in this round changes that.
- 13 places still lack coordinates; `docs/map-options.md` sets out the geocoder path.
- All 24 records remain draft; `npm run release` is expected to fail.
