# 知识库重建执行方案与任务索引

**状态：已完成（2026-11-24），旧库于 2026-11-25 退役。** 基线为 GitHub `main` 的 `c9aa45a`。本方案接替 `docs/research-execution-plan.zh-CN.md` 与 `docs/execution-plan-2026-11-23.md` 中与知识库有关的部分；旧研究与交付报告保留在归档 tag `archive-pre-hygiene-2026-11-25`。

同一仓库、知识库独立、全量迁移、精修五部。读者从一部碑帖出发，应能回答：它是什么、何时形成、与哪些书家有关、今天能见到哪些原石或传本、其中一件经历过什么。时间总览按作品所属时代编排；进入作品后，时间线和地图展示所选实物的有据经历。

## 一、编目原则

作品是读者入口，实物是流传经历的主体，来源支撑具体说法。

| 记录 | 作者维护 | 时间、地图和网页 |
| --- | --- | --- |
| 作品 `knowledge/works/` | 稳定 ID、题名与别名、时代、书体、有来源的年代与署名、中文简介、可选导读 | 作品目录、时代总览；没有可辨实物也可阅读 |
| 实物 `knowledge/objects/` | 一件原石、墨迹、摹本或拓本一份档案；所属作品、制作年代、馆藏号、收藏依据、审核状态、包装与图像 | 独立链接；作品页并列，切换后只看该件履历 |
| 事件 | 实物档案内按稳定事件 ID 记录出土、题跋、入藏、迁移；时间原文、地点、出处 | 文字时间线与地图共用同一组记录；日期不明仍可读 |
| 书家 `knowledge/people/` | 一人一档；作品或实物记录撰文、书写、摹写、题跋等角色及把握程度 | 书家页自动汇集关联作品并显示角色 |
| 地点与来源 `knowledge/places/`、`knowledge/sources/` | 历史称谓、今地说明、坐标依据与精度；来源复用到藏品号、页码或题跋 | 历史事件地点、现藏地点、今日参照地标分别标识 |
| 说法与异说 | 作品或实物内的 `claims`：谁在何处提出什么、支持或质疑 | 与归名、年代、字口相关的意见单独显示，不生成确定书家 |

**版本层按需启用。** 首期只在确有称名与依据时记录 `version`（如神龙本、定武本）；不为孤本填写空版本。

**文件格式。** 普通 Markdown，顶部 YAML 只放程序字段，正文写给人读。文件名即稳定 ID。每份记录带 `schemaVersion: 1`。中文模板见 [`knowledge/_templates/`](../knowledge/_templates/)。同一作品的基础档案与导读各自保留 `review.state`。

## 二、单向数据流

```
knowledge/ 作者源稿
        │
        ▼
scripts/lib/knowledge-compiler.ts（只读编译器）
        │
        ▼
data/index/knowledge-v1.json（带格式版本的数据接口）
        │
        ├── 网页 src/
        ├── 命令行校验 scripts/
        ├── 时间线与地图
        └── 完整下载包 public/download/
```

- 网页只导入 `data/index/knowledge-v1.json`；不再以 glob 直接读取 `data/works/`、`data/objects/` 或作者 Markdown。
- 编译器不导入 `src/components/`、`src/i18n/` 或 `src/App.tsx`；可共用的纯领域类型与校验规则留在 `src/domain/`。
- `data/works/`、`data/objects/`、`data/places.json`、`data/sources.json`、`data/media.json` 与 `data/knowledge-relations.json` 已于 2026-11-25 退役，不再由任何脚本或网页读取；原文件保存在 annotated tag `archive-pre-hygiene-2026-11-25`。
- 构建在源稿副本上完成；同一输入编译两次产物必须逐字节一致。

## 三、任务卡与可改范围

每张卡从当时最新的项目 `main` 开分支，提交可独立审查的 PR。先跑通两部，再扩到五部，最后切换全库。

| 卡片 | 负责人角色与依赖 | 可改范围 | 必须交付 |
| --- | --- | --- | --- |
| **A · 冻结基线与分工** | 协调者＋架构贡献者，先做 | `docs/knowledge-rebuild.md`、ADR、迁移基线（已归档）、任务索引 | 本方案、旧库清单（87 个作品入口）、ADR-004、本表 |
| **B · 知识格式与编译器** | 数据工程贡献者，依赖 A | `knowledge/_templates/`、`scripts/lib/knowledge-*`、`data/index/`、`tests/knowledge-*` | Markdown 模板、格式版本、编译器、只读接口、隔离与复现检查；两部样例同源读取 |
| **C · 五部编辑示范** | 资料贡献者，格式确定后按作品并行 | 五部作品及其实物、相关人物、编辑差异单（已归档） | 基本档、实物、书家或署名说明、带出处时间线、可定位地点、待考项；差异单列 |
| **D · 时间、地图与人物阅读** | 网页贡献者，依赖 B，可与 C 并行 | `src/components/`、`src/domain/`、`src/i18n/`、`src/styles.css`、对应测试 | 保留教室开场；作品页选实物；时间线与地图同源；书家页回作品；地图失败可读 |
| **E · 全量迁移与下载投稿** | 迁移负责人＋贡献文档作者，依赖 B | 迁移器（已随旧库退役，见归档 tag）、`scripts/knowledge-package.ts`、投稿文档 | 覆盖 87 个作品入口的迁移器；逐 ID 对照；完整 ZIP；一次真实下载包改一篇的 PR 演练 |
| **F · 切换、复核与交付** | 集成负责人＋独立审查者，依赖 C、D、E | 集成入口、任务/交付记录 | 可回退切换；旧链接、编辑链接、研究快照核对；撤下旧 JSON 生产读取；交付报告 |

**公共接口负责人：** `data/index/knowledge-v1.json` 的结构由 B 卡负责人维护，任何字段变更须同时更新编译器、校验、网页消费方与本文格式说明。**集成入口负责人：** F 卡负责人；其他卡不得自行改动 `src/domain/data.ts` 的读取边界。

## 四、验收案例

1. **颜勤礼碑**：1922 年出土只在原石履历；民国拓本保留“民国”年代精度，不继承原石移动。
2. **祭侄文稿**：并列两跋所记 1282、1283 年及各自出处；说明归为同一事件是编辑推定；交接地点留空。
3. **兰亭序**：区分神龙本与定武本；列出神龙本摹者归名及馆方质疑。
4. **礼器碑**：翁方纲关于书写人数的观点标为有出处的意见，不生成七名确定书家。
5. **张猛龙碑**：“36 页”只属于明拓册，原石与另一拓本不继承。

五项均在用户实际打开的网页验收。全量迁移逐 ID 对照字段、事件归属、出处定位、双语顺序、署名、图权、空值和审核状态。两篇现代作品直达；1962 年指字帖出版，1976 年指补跋。

## 五、发布边界

首期交付是 GitHub Pages 上标明草稿的预览。正式出版仍须逐项编辑批准、`npm run release`、清单核验与主机检查。草稿阻断能力不得因迁移关闭。

## 六、实施记录

本地实施结果、命令、浏览器验收、截图与未验证项见 [delivery 039](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/delivery-039.md)，旧库清单见 [inventory](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/baseline/inventory-2026-11-24.md)，逐项差异见 [migration parity](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/baseline/migration-parity-2026-11-24.md)，五部编辑差异见 [editorial differences](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/docs/baseline/editorial-differences-2026-11-24.md)。
