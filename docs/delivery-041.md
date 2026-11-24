# Delivery 041 · 经典碑帖选目与增补

**状态：本地实施与自检完成；未提交、未推送、未部署。**

本次不改编译器、不改网页组件、不改 schema，只按既有格式增补作者源。选目方法与评估矩阵见 [research/classics-selection-2026-11.md](research/classics-selection-2026-11.md)。

## 范围

- 先按朝代与书体盘点现有 87 部作品，找出整段空白（五代十国、南宋、民国）与书体断链（小楷源头、唐篆、狂草、瘦金书、北齐摩崖、明末长卷行草、吴昌硕一路）。
- 新增 11 部作品、11 件实物、2 处地点、15 条来源；每条实物只登记自己的载体、年代与收藏，不把原石履历抄给拓本或重刻。
- 新增作品全部为 `draft`，保留待考与证据限制；正式出版门槛仍会拦截。

## 入选与增补

| 作品 | 时期 | 书体 | 书者 | 实物载体 | 收藏 |
| --- | --- | --- | --- | --- | --- |
| 宣示表 | 三国·曹魏 | 小楷 | 钟繇（表文）；传王羲之临本摹刻 | 宋拓合册 | 故宫博物院 |
| 张玄墓志 | 北魏 | 楷书 | 未署名 | 何绍基旧藏剪裱拓本 | 上海博物馆 |
| 泰山经石峪金刚经 | 北齐 | 隶楷 | 未署名 | 摩崖原石 | 泰山经石峪（原地） |
| 灵飞经 | 唐 | 小楷 | 传钟绍京 | 四十三行墨迹册 | 大都会艺术博物馆 |
| 三坟记 | 唐 | 小篆 | 李阳冰 | 宋时重刻碑 | 西安碑林博物馆 |
| 古诗四帖 | 唐 | 狂草 | 传张旭 | 纸本长卷 | 辽宁省博物馆 |
| 韭花帖 | 五代 | 行楷 | 杨凝式 | 清内府藏本 | 无锡博物院 |
| 秾芳诗帖 | 北宋 | 瘦金书 | 赵佶 | 绢本长卷 | 台北故宫博物院 |
| 陆游自书诗卷 | 南宋 | 行草 | 陆游 | 纸本长卷 | 辽宁省博物馆 |
| 王铎行草书自书诗卷 | 明 | 行草 | 王铎 | 纸本长卷 | 故宫博物院 |
| 吴昌硕临石鼓文轴 | 民国（1915） | 篆书 | 吴昌硕 | 纸本立轴 | 故宫博物院 |

三处整段空白由此补上：五代十国（韭花帖）、南宋（陆游）、民国（吴昌硕）。吴昌硕一轴书于 1915 年，按“书写年份归档”的既有规则归民国；馆方仍标清，记录中已注明分歧。

## 改动文件

新增：

- `knowledge/works/`：11 个作品源稿。
- `knowledge/objects/`：11 个实物源稿。
- `knowledge/places/`：`place-wuxi-museum.md`、`place-taishan-jingshiyu.md`。
- `knowledge/sources/`：15 条来源，其中 11 条为馆方或政府页面，4 条为报纸或研究文章并在 `note` 中说明用途。
- `docs/research/classics-selection-2026-11.md`、`tasks/041-classics-selection.md`、本报告。
- `docs/screenshots/041-*.png`：浏览器验收截图。

更新：

- `knowledge/README.md`、`knowledge/catalogue/`：由 `knowledge:generate` 生成，未手改。
- `data/index/knowledge-v1.json`：由 `knowledge:compile` 生成。
- `docs/canonical-coverage.md`：把已补条目移入“已收录”，保留未决问题。
- `docs/iteration-board.md`、`README.md`、`README.en.md`：语料数量与看板。
- `tests/knowledge.test.ts`、`tests/knowledge-examples.test.ts`：作品与实物计数 87/96 → 98/107。
- `tests/app.test.tsx`：期间分组新增五代十国、南宋、民国三组。

## 实际命令与结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run knowledge:compile` | 98 works, 107 objects, 38 places, 160 sources, 70 events, 1 media；0 errors，38 warnings（与增补前同为 38，新增记录未增加警告） |
| `npm.cmd run knowledge:generate` | 99 个页面，0 个待刷新 |
| `npm.cmd run check:data` | 0 errors，38 warnings；唯一未引用来源仍为既有的 `src-beilin-xiao-beilin` |
| `npm.cmd run check:interface` | 编译接口与源稿一致 |
| `npm.cmd run check:knowledge` | 通过，0 个待刷新 |
| `npm.cmd run check:isolation` | 通过 |
| `npm.cmd run check:reproducible` | 通过：518 个源文件，两次编译输出一致 |
| `npm.cmd run check:docs` | 通过：40 行看板，任务与交付文件均有记录 |
| `npm.cmd test` | 18 个测试文件、156 项测试通过 |
| `npm.cmd run knowledge:package` | 523 个文件、540.4 KiB；工作区未提交时 `sourceRevision` 记为未记录 |
| `npm.cmd run build` | 构建通过（6.52 s）；仅有既存的 chunk 体积提示 |

## 浏览器验收

构建后以 `vite preview` 预览，用无头 Edge 经 DevTools 设备模拟取真实 CSS 宽度：

- `#/work/xuanshi-biao`（1440）：标题、署名两行（撰钟繇、摹王羲之传）、背景、实物选择卡与实物详情、参考出处均显示；与既有《张迁碑》页结构一致。
- `#/work/jiuhua-tie`（390、768）：正文完整换行，按钮在屏内，实物卡与来源列表无横向溢出。
- `#/work/wangduo-zishu-shi`（390、1440）：十一个字的长标题正常换行，无重叠；参考出处与实物区块对齐。
- `#/library`（390）：期间分组显示“先秦 1、秦 3……三国 2”，新增条目进入列表。

截图：[390 韭花帖](screenshots/041-390.png) · [768 韭花帖](screenshots/041-768.png) · [1440 宣示表](screenshots/041-1440.png) · [390 王铎](screenshots/041-wangduo-390.png) · [1440 王铎](screenshots/041-wangduo-1440.png) · [390 知识库](screenshots/041-library-390.png)。

## 未完成或未验证

- **11 条记录均为草稿**，未经独立编辑复核；正式出版门槛仍拒绝出版。
- **未调阅原件、未做拓本对勘、未新增图像。** 所有著录来自馆方、政府页面或有说明的报刊/研究文章。
- **三坟记的重刻问题未决**：碑林页面按 767 年原刻描述，另有报刊称今碑为宋时重刻；记录按“现存重刻”登记，重刻年份待查。
- **张玄墓志行款未决**：二十行与十二行两说并存，字数亦有出入。
- **韭花帖字数未决**：无锡博物院两篇文章分别作六十三字与六十五字。
- **宣示表的“宋拓”未逐开鉴定**；册内七种小楷刻帖是否同为宋拓，需看原件或影印全册。
- **古诗四帖的尺寸与内容**依报纸报道，未据馆方尺寸著录复核。
- **未验证中国大陆公共网络可达性**；本地预览不等于公开主机验证。
- **未提交、未推送、未部署 Pages。**

## 复核要点

1. 先读 [选目报告](research/classics-selection-2026-11.md) 第 6、7 节，按清单逐条核对。
2. 优先处理三处可能影响史实表述的问题：三坟记重刻、张玄墓志行款、韭花帖字数与真伪。
3. 确认吴昌硕一轴的归档规则：按书写年份归民国，还是随馆方标清；两种做法只能选一种，并在 `docs/atlas-workflow.md` 或决策记录中写明。
4. 若要把任何一条转为 `reviewed`，须由编辑而非实施者改状态。
