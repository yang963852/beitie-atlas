# 本体试例的数据层校验（B 卡）

**交付 · 2026-11-24 · 角色：B · 模型验证（数据 Agent）。** 本卡只读校验 PR #34 的五件试例，未改生产档案、加载器、地图和出版门槛。结论：试例能用现有 JSON 表达十个能力问题；固定语料中的作品、实物、事件、来源和媒体编号全部可解析；六个故意破坏的副本都被检出并指向具体断言或实物。史料真伪仍待 A 卡复核与 D 卡评审，程序通过不等于史实成立。

## 一、输入与重跑

| 项 | 值 |
| --- | --- |
| 试例 | PR #34 的 [`docs/research/ontology-pilot.json`](https://github.com/yang963852/beitie-atlas/blob/a5e56b1/docs/research/ontology-pilot.json) |
| 固定提交 | `a5e56b1`（PR #34 当前 head）；报告中的编号以该提交为准 |
| 语料基线 | `c6fd7c0`（试例 `baseRevision`；本分支从 `origin/main` 建立。该版本相对本地旧基线 `53d9f24` 只改了依赖锁文件，`data/` 与 `docs/` 未变） |
| 固定副本 | [`scripts/research/inputs/ontology-pilot.a5e56b1.json`](../../scripts/research/inputs/ontology-pilot.a5e56b1.json)，SHA-256 `c274aaf6ee7026a0543a23d2ccd374d58af5132308043b8ca48ae419bb3f2063` |
| 语料规模 | 85 部作品、95 件实物、141 条文献、1 条媒体；试例引用其中 5 部作品、9 件实物、5 条文献、1 条媒体、1 个事件 |
| 校验脚本 | [`scripts/research/check-ontology-pilot.mjs`](../../scripts/research/check-ontology-pilot.mjs)；纯 Node，只读，无新增依赖 |

在仓库根目录可直接重跑：

```sh
node scripts/research/check-ontology-pilot.mjs --base c6fd7c0
node scripts/research/check-ontology-pilot.mjs --base c6fd7c0 --self-test
```

脚本默认先找 `docs/research/ontology-pilot.json`（PR #34 合并后即用该文件），找不到才用固定副本。`--base` 校验试例声明的基线提交；`--self-test` 在内存副本上制造反例，不写盘。若 PR #34 后续修订，重跑时更换 `--pilot` 并重新记录 SHA-256 即可；本报告的结论只对应上表版本。

## 二、实际结果

```text
[ok] yan-qinli-bei -> yan-qinli-original-stele, dpm-rubbing-xin00045406 | claims: yan-era
[ok] lanting -> witness-lanting, dingwu-zhan | claims: lan-version, lan-attribution, lan-reservation
[ok] liqi-bei -> stele-liqi, liqi-ming-44512 | claims: li-face, li-opinion
[ok] zhang-menglong-bei -> stele-zhang-menglong-bei, rubbing-zhang-menglong-bei | claims: zhang-reading, zhang-extent
[ok] jizhi -> witness-jizhi | claims: ji-1282, ji-1283

Errors: 0
Warnings: 0
Counts: 5 cases, 9 objects, 10 claims, 10 evidence items, 1 version, 1 media link, 1 conflict.
Research pilot validation passed.
Self-test: 6/6 negative cases detected; restored pilot passed.
```

十个断言、十处证据定位、一个版本组、一条媒体链接和一个冲突组全部通过；没有出现“引用存在但事件挂错实物”或“版本与实物不同作”的情况。

## 三、校验覆盖

| 约束 | 程序检查 | 结果 |
| --- | --- | --- |
| 编号唯一 | 断言号、版本号在整份试例内唯一；语料内作品、实物、事件、文献、媒体号不得重复 | 通过 |
| 引用存在 | 作品、实物、事件、文献、媒体编号都能在 `data/` 中解析 | 通过（5＋9＋1＋5＋1） |
| 事件属于正确实物 | `event-year` 的主语必须是事件，事件的 `objectId` 必须在本案实物内 | 通过（`witness-jizhi-yuan-acquisition` → `witness-jizhi`） |
| 版本与实物同作 | 版本 `work` 等于案例作品；归组断言的主语实物与版本同属一部作品 | 通过（`trial-shenlong` → `lanting`） |
| 图像绑定本件 | 案例引用的媒体必须存在，且 `media.objectId` 属于本案实物；媒体有许可与权利依据 | 通过（`media-shenlong-opening` → `witness-lanting`） |
| 每条断言有说话者和段落 | `voice` 非空；每条证据有存在的文献号和非空 `locator` | 通过（10/10） |
| 冲突可复原 | 成员至少两条、同案、同谓词、值不同； `selected` 为 `null` 或成员之一；有 `reason` | 通过（`ji-1282`／`ji-1283`，`selected: null`） |
| 试例仍是待审 | 顶层 `status` 必须为 `draft`；`preparedBy`、`method`、`sourceCheckedOn` 必填 | 通过 |
| 能力探针 | 祭侄两说可分别检出且各有跋文定位；按“冯承素”检索同时返回支持与质疑 | 通过 |

冲突组还额外检查了谓词一致：两条记录的 `subject`、`predicate` 相同，只有 `value`、`voice` 和 `locator` 不同；这正是“同页异跋”需要的最小结构。

## 四、反例自测

`--self-test` 对固定试例做深拷贝后逐项破坏，再断言错误码和出错位置；最后用未修改的试例复跑，确认 0 错误。

| 破坏 | 预期错误 | 实际命中 |
| --- | --- | --- |
| 把 `yan-era` 的文献改成 `src-ghost` | `CLAIM_EVIDENCE_SOURCE_UNKNOWN` | `$.cases[0].claims[0].evidence[0].source` |
| 把 `li-face` 的主语改成另一案的 `witness-jizhi` | `CLAIM_SUBJECT_UNKNOWN` | `$.cases[2].claims[0].subject` |
| 清空 `zhang-extent` 的段落定位 | `CLAIM_EVIDENCE_LOCATOR_MISSING` | `$.cases[3].claims[1].evidence[0].locator` |
| 从冲突组删去 `ji-1283` | `CONFLICT_MEMBERS_INSUFFICIENT` | `$.cases[4].conflicts[0].members` |
| 把 `lan-version` 的值改成不存在的版本 | `CLAIM_VERSION_UNKNOWN` | `$.cases[1].claims[0].value` |
| 把神龙本裁图挂到颜勤礼碑案 | `CASE_MEDIA_OBJECT_MISMATCH` | `$.cases[0].media[0]` |

六项均按预期失败；恢复原样后通过。自测只覆盖结构反例，不替代史料复核。

## 五、Q1–Q10 答卷

下表按研究稿的问题顺序记录“问题／输入号／实际结果／出处与定位／未知项”。“实际结果”是脚本和固定语料读出的内容，不是新的史学研究结论。

| 问题 | 输入号 | 实际结果 | 出处与定位 | 未知项 |
| --- | --- | --- | --- | --- |
| Q1 同一作品有哪些实物？ | `yan-qinli-bei` | 两件：原石 `yan-qinli-original-stele`、民国拓本 `dpm-rubbing-xin00045406` | `data/objects/` 两档；试例 `cases[0].objects` | 是否还有其他传本不在本批 |
| Q2 能确定拓自哪方石、何年拓制？ | `dpm-rubbing-xin00045406` | 只能到时代“民国”；`productionDate.startYear` 为 `null`，`relationships` 为空，不建立“拓自”关系 | 旧档 `productionDate`／`relationships`；`yan-era`（`src-dpm-yan-qinli-rubbing`，“藏品说明首句、馆号新00045406”） | 具体拓制年；所拓具体石；入藏时间 |
| Q3 传本的称名、实际摹者和图像？ | `witness-lanting` | 称名“神龙本”，检索组 `trial-shenlong`；归名“冯承素”有支持（项元汴，据馆方转录）与质疑（馆方撰述者）两条；裁图绑定本件 | `lan-version`；`lan-attribution`（后纸题记）；`lan-reservation`（归名考辨）；`media-shenlong-opening`；定武本另有 `dingwu-zhan` | 实际摹者；神龙本与定武本之间的直接底本关系 |
| Q4 哪件拓本留下什么字口？ | `liqi-ming-44512` | “绝思二字未损连”，说话者为故宫博物院 | `li-face`（`src-dpm-234635`，“藏品说明末段的字口与碑面描述”） | 字口在本件授权数字图中的像素位置 |
| Q5 谁提出关于书者的判断？ | `stele-liqi` | 翁方纲（据馆方转述）提出“七人”，作为署名观点返回，不生成七位书家 | `li-opinion`（`src-dpm-234635`，“历代评价段末句”） | 七位书者各自身份；馆方转述与翁氏原文的差异由 A 卡判断 |
| Q6 哪件被剪裱成册，怎样定位版本特征？ | `rubbing-zhang-menglong-bei` | 新00045763 为明拓剪裱册，36 页；“盖魏二字未连”落在该册 | `zhang-extent`（“藏品说明首段，剪裱装册”）；`zhang-reading`（“藏品说明末段，馆号新00045763”） | 能否据该字口为另一部拓本断年 |
| Q7 两条记载是否针对同一事件？ | `witness-jizhi-yuan-acquisition` | 是。两跋同指一次得卷；楷书跋记 1282，行书跋记 1283 | `ji-1282`（“拖尾楷书跋，至元壬午”）；`ji-1283`（“拖尾行书跋，至元癸未”）；冲突组 `selected: null` | 两说是否真为同一次交接，仍属史料判断 |
| Q8 能否选定交接年和地点？ | 同上 | 不能。两说并存；事件 `placeId` 与 `placeWording` 均为 `null` | 旧档事件 `witness-jizhi-yuan-acquisition`；试例冲突组 | 唯一年份；得卷地点 |
| Q9 谁在何时提取、谁批准？ | 试例顶层 | 由 Codex 以 `agent-assisted-extraction` 于 2026-11-24 提取，`status: draft`；旧档 5 部作品中 3 部 `reviewed`、2 部 `draft`，9 件实物中 6 件 `reviewed`、3 件 `draft` | `model`、`preparedBy`、`method`、`status`、`sourceCheckedOn`；`data/works/*.json`、`data/objects/*.json` 的 `review.state` | 谁批准；研究稿待审，自动校验不提升审核状态 |
| Q10 哪些图可以复用？ | `witness-lanting` | 本批只有 `media-shenlong-opening`：绑定 `witness-lanting`，PD-Art 许可，权利依据为 Commons 版本 URL，文件 `src/assets/shenlong-opening.webp` | `data/media.json`；试例 `cases[1].media` | 其他图；无 IIIF 画布或区域；“网站可看”“史料有出处”“图片可再发布”“编辑已批准”仍是四种判断 |

## 六、旧档已有、研究层新增与旧字段的缺口

旧档并不是只有“一行摘要”。下列信息在 `src/domain/types.ts` 和现有 JSON 中已有稳定结构：作品与实物编号、中英题名、署名角色及出处、日期类型与把握度、原文、馆号、尺寸、存佚、实物关系、馆藏断言、事件类型与地点原文、双语事件摘要、文献访问日、审核状态、媒体许可与权利依据、双语注记。试例没有重复造这些字段，只用编号引用它们。

新增的是“一条具体说法”这一层：

| 信息 | 旧档字段 | 试例表达 | 旧字段无法表示的细节 |
| --- | --- | --- | --- |
| 同一事件的两年 | `provenanceEvents[].date` 为 `range` 1282–1283，`certainty: disputed`，摘要用文字说明两说 | `ji-1282`、`ji-1283` 两条断言，各自 `value`、`voice`、`locator`；冲突组 `selected: null` | 不能把 1282 和 1283 分别作为可查询的值返回，也不能给每条说法各配一个段落定位 |
| 同页两跋 | `sourceRefs` 指向整条文献，`source.locator` 只有一个字符串 | 每条证据各带 `source` 与 `locator`（楷书跋／行书跋） | 同页的两则题跋只能压在一条文献定位里，无法按跋分别复查 |
| 支持与质疑 | `notes` 用文字写“馆方对归名提出疑问” | 同一 `subject`／`predicate`／`value` 的两条断言，`stance` 分别为 `supports`、`questions` | 不能按立场筛选，也不能保证支持与质疑指向同一归名 |
| 逐条说话者 | 作品层 `attribution` 只记创作署名；事件摘要用散文提到人物 | 每条断言有 `voice`，区分材料作者、转述者与录入者 | 事件摘要中的“某人说”无法变成可查询的说话者字段 |
| 版本组 | 只有 `workId` 与实物号 | 版本 `trial-shenlong` 带 `label`、`basis`、`work`；归组本身是一条断言 | 没有“版本”实体，无法保存归组依据，也无法并存两种分组 |
| 提取与审核活动 | `sourceAccessedAt` 记资料访问日；`review.state` 记记录审核 | 顶层 `preparedBy`、`method`、`sourceCheckedOn`、`status` | 没有“谁提取、用什么方法、何时提取”的活动记录；资料访问日不能冒充提取日或批准日 |
| 冲突与首选 | `certainty: disputed` 加摘要 | 冲突组成员、`selected`、`reason` | 不能保存“尚未选定”与“已选定并说明理由”的结构差异 |
| 未决项 | `notes` 中的散文 | `unresolved[]`，逐条列出 | 未决项无法被查询或计数；散文仍可读，但不能替代结构 |

旧字段能表达的细节也已保留：`dpm-rubbing-xin00045406` 的 `startYear: null` 和 `eraLabel: "民国"` 没被填年；`witness-jizhi-yuan-acquisition` 的 `placeId`、`placeWording` 仍为 `null`；冲突的 `selected` 仍为 `null`。9 件实物的 20 条注记中英成对（20/20），13 条事件摘要均有中文（13/13）；这些是旧档现状，本卡只读，没有改动。6 件实物有馆号，3 件原石为 `null`，也与旧档一致。

## 七、覆盖与未覆盖

本轮实际覆盖：5 部作品、9 件实物、10 条断言、10 处证据、1 个版本、1 条媒体、1 个冲突、1 个事件主语。负例覆盖坏文献、错挂实物、缺定位、冲突成员缺失、未知版本、媒体错绑六类。

未覆盖，不能由本卡推出结论：

- 摩崖、残片、失传或地点未知的实物；无坐标地点；机构迁址与馆址分离。
- 无图权或权利不清的媒体；IIIF 画布、区域坐标和字形切分。
- 人物、机构、地点作为独立实体的对齐；多跳关系；版本组含多件实物；已有首选结论的冲突。
- 断言的英文对应文本；提取与审核活动的完整记录；审核通过后的状态提升。
- 数据增长后的检索、分包和手机性能；网页呈现与交互（E 卡范围）。
- 原网页当前是否可达、馆方文字是否被正确转录、拓本是否真为明拓或民国拓。这些属于 A 卡的史料复核，程序只能检查引用是否成形。

## 八、边界与检查记录

本卡没有改动 `data/`、`src/`、`knowledge/`、生产加载器、地图或出版门槛；脚本也不被应用导入。研究校验没有接进 `npm run check`，因为输入是 PR #34 的草稿研究层，若接进生产检查，一次研究修订就会阻断无关的资料工作。等负责人接受研究层并确定唯一原稿后，再决定是否把它纳入固定检查。

已运行：

- `node scripts/research/check-ontology-pilot.mjs --base c6fd7c0 --self-test`：0 错误、0 警告，6/6 反例检出，恢复后通过。
- `npm.cmd run check`：类型检查、数据检查、知识目录检查、看板检查、测试套件均通过；`vite build` 首次因环境拒绝清理 esbuild 临时文件而失败。
- 将 `TMP`／`TEMP` 指向项目内 `.private/tmp/esbuild` 后重跑 `npm.cmd run build`：构建通过（主包 gzip 约 283 kB，与架构研究的基线估算一致）。
- `git diff --check`：无空白错误。

未运行：`npm run release`／`check:release`（正式出版门槛不在本卡范围）、浏览器与手机实测、原网页逐条重访、独立史料复核。

## 九、给负责人的决定

本卡建议：**保留研究层，暂不接入网站。** 试例已经能回答十个问题，且反例可被程序检出；但史料判断、网页阅读价值和迁移成本还没有经过 A、D 两卡的独立复核。下一步应先让 D 卡用本报告的命令重跑正常样例与反例，再决定“保留研究”“补证再试”或“授权网页试点”。需要负责人决定的是：是否合并 PR #34 与本校验、是否按 A 卡的未决项修订试例，以及是否把研究层纳入后续固定检查。

本报告是实施者自审，不是独立验收；P1／P2／P3 与接受结论由 D 卡和负责人记录。
