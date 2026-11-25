# Delivery 043 · 金文与简牍增补

**状态：已合并并部署为标注草稿的预览。** 合并提交 `19d3550`（[PR #49](https://github.com/yang963852/beitie-atlas/pull/49)）；Preview quality checks 与 Publish GitHub Pages preview 均成功。

按业主指示把收录范围从碑帖扩展到金文与简牍。选目与分类理由见 [research/bronze-and-slips-2026-11.md](research/bronze-and-slips-2026-11.md)。

## 范围

- 新增 5 件金文：大盂鼎、史墙盘、散氏盘、毛公鼎、中山王厝鼎。
- 新增 5 种简牍：郭店楚简、睡虎地秦简、武威仪礼简、居延新简·隧长焦永死驹劾状、走马楼吴简·嘉禾吏民田家莂。
- 每件作品配 1 件实物，共 10 件；新增 7 处收藏机构地点、11 条来源。
- 新增实物类型 `bronze-vessel`（青铜器），用于铜器原器；简牍沿用 `ink-manuscript`。

## 分类决定

| 问题 | 决定 |
| --- | --- |
| 金文的作品类别 | `bei`。金文长期以拓本行世，属金石碑拓传统 |
| 简牍的作品类别 | `tie`。简牍是墨迹，属手写系统 |
| 铜器实物类型 | 新增 `bronze-vessel`，避免用 `rubbing` 把拓本冒充原器 |
| 简牍实物类型 | `ink-manuscript`，尺寸与材质写入 `dimensions` 与待考 |
| 书体 | 细分为金文、中山篆、楚系简帛书、秦隶、汉隶、章草、吴简隶楷 |

类型改动涉及 `src/domain/types.ts`、`src/domain/validate.ts`、`src/domain/data.ts`、`src/App.tsx`、`src/i18n/zh.ts`、`src/i18n/en.ts`、`scripts/lib/knowledge-schema.ts`、`scripts/lib/catalogue.ts`。未改布局与路由。

## 改动文件

新增：

- `knowledge/works/`：10 个作品源稿。
- `knowledge/objects/`：10 个实物源稿。
- `knowledge/places/`：7 个机构地点。
- `knowledge/sources/`：11 条来源。
- `docs/research/bronze-and-slips-2026-11.md`、`tasks/043-bronze-and-slips.md`、本报告。
- `docs/screenshots/043-*.png`：浏览器验收截图。

更新：

- `knowledge/README.md`、`knowledge/catalogue/`：生成页。
- `data/index/knowledge-v1.json`：编译接口。
- [归档的覆盖面矩阵](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/canonical-coverage.md)、`docs/iteration-board.md`。
- `tests/app.test.tsx`：默认选中变为大盂鼎，地图测试改为先选石鼓再回列表。
- `tests/knowledge.test.ts`、`tests/knowledge-examples.test.ts`：108 作品 / 117 实物。

## 实际命令与结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run knowledge:compile` | 108 works, 117 objects, 45 places, 171 sources, 70 events, 1 media；0 errors，38 warnings |
| `npm.cmd run knowledge:generate` | 109 个页面，0 个待刷新 |
| `npm.cmd run check:data` | 0 errors，38 warnings |
| `npm.cmd run typecheck` | 通过（新增 `bronze-vessel` 已补入全部标签表） |
| `npm.cmd run check` | 通过；18 个测试文件、156 项测试；566 个源文件可复现 |
| `npm.cmd run knowledge:package` | 571 个文件、590.4 KiB；工作区未提交时 `sourceRevision` 记为未记录 |
| `npm.cmd run build` | 通过 |

## 浏览器验收

（合并前在本地 `vite preview` 检查，截图见 `docs/screenshots/043-*.png`。）

- `#/work/dayu-ding`：青铜器标签、铭文说明、实物卡与来源正常。
- `#/work/guodian-chujian`：简牍页正常，书体显示“楚系简帛书”。
- `#/library`：语料统计为 108 部作品；“青铜器”作为实物类型出现在筛选与条目中。

## 部署与线上验证

- 合并提交 `19d3550`；Pages 工作流 `45517288477` 完成并成功。
- 线上 https://yang963852.github.io/beitie-atlas/ 返回 200；`#/work/dayu-ding` 显示“大盂鼎 · 前1003年 · 未署名 · 青铜器 · 中国国家博物馆”；`#/library` 统计为 108 部作品。
- 线上仍是带“内部测试版”标注的预览；正式出版门槛仍拦截全部草稿。

## 未完成或未验证

- 10 条记录全部 `draft`，未经独立编辑复核。
- 铜器原器与拓本分开：本批只登记原器，未登记各器的具体拓本。
- 《大盂鼎》出土地、《散氏盘》字数、《毛公鼎》字数、《郭店楚简》有字简数、《居延劾状》人名均有异说，保留在待考。
- 《武威仪礼简》未见馆方藏品页，数据依报刊。
- 新地点无坐标，只作机构名登记，不上地图。
- 未调阅原件、未新增图像、未验证中国大陆公共网络。
