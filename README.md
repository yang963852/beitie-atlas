# 碑帖之间 · Between Steles

**简体中文** · [English](README.en.md) · [项目理念](docs/PROJECT.md) · [知识库目录](knowledge/README.md) · [中文投稿与试读指南](docs/CONTRIBUTE.zh-CN.md)

**从案头一帖，走向更广阔的书法世界。**

碑帖之间是一个由书法爱好者共同建设的、开放共享的书法知识项目。
我们从临习的碑帖出发，认识作品、书家与时代，追寻原石、墨迹、摹本与拓本的流传，在阅读、书写、思考和交流中逐渐理解书法之美。
我们希望让书法走向大众。无论是否具有专业背景，无论是否追求艺术成就，每个人都可以通过书法认识历史、感受美、表达自己，并丰富精神生活。
项目主要面向书法初学者与爱好者，以经典碑帖为建设起点，提供可靠的公共知识与学习参考。

**人人为我，我为人人。**
我们因热爱而相聚，也欢迎每一位热爱书法的人，将自己的发现、经验与思考分享给后来者。

[访问网站](https://yang963852.github.io/beitie-atlas/) · [了解项目理念](docs/PROJECT.md) · [参与共建](docs/CONTRIBUTE.zh-CN.md) · [浏览知识库](knowledge/README.md)

完整理念只保存在[项目理念](docs/PROJECT.md)（[English](docs/PROJECT.en.md)）；本页与其他文档只作简要介绍，不另立版本。

## 在网站里能做什么

- **从案头进入**：一张摊开的帖引你打开[访碑图](https://yang963852.github.io/beitie-atlas/#/collections)；桌上的帖影直达《兰亭序》神龙本的实物记录。
- **读一件作品**：从[《颜勤礼碑》](https://yang963852.github.io/beitie-atlas/#/work/yan-qinli-bei)开始，背景、书家、传世实物分开呈现；原石与民国拓本各有履历，不互相顶替。
- **看碑帖长卷**：在[编年](https://yang963852.github.io/beitie-atlas/#catalogue)里按作品所属时代浏览全部作品，先秦至当代。
- **查访碑图**：在[访碑图](https://yang963852.github.io/beitie-atlas/#/collections)按今天的收藏地或原址找现存实物；没有可靠坐标的地点只列文字，不猜位置。
- **找书家与读帖笔记**：在[读帖](https://yang963852.github.io/beitie-atlas/#/library)按作品、书家、笔记或实物档案进入，例如[颜真卿](https://yang963852.github.io/beitie-atlas/#/person/yan-zhenqing)。
- **认识项目**：从首页或导航进入[关于我们](https://yang963852.github.io/beitie-atlas/#/about)与[参与共建](https://yang963852.github.io/beitie-atlas/#/join)。

**当前收录**：以下计数快照由 `npm run check:docs` 对照编译接口核对；审核状态、来源缺口与日期问题见[知识库状态页](docs/knowledge-status.md)（`npm run knowledge:status` 生成）。

<!-- knowledge-counts:begin -->
| 类别 | 数量 |
| --- | ---: |
| 作品 | 158 |
| 实物 | 168 |
| 人物 | 59 |
| 地点 | 53 |
| 来源 | 345 |
| 事件 | 123 |
| 笔记 | 24 |
<!-- knowledge-counts:end -->

## 三条编辑原则

- **作品与实物分开**：原石的出土经历只写在原石履历里，不复制给拓本或翻刻。
- **冲突并存**：相矛盾的著录分别记述、分别注明出处，不强行选一个首选说法。
- **未知留白**：没有来源的年份、坐标和当代使用情况留空并标明待考，不猜、不编。

撰稿与审核步骤见[编辑流程](docs/atlas-workflow.md)。我们提供知识与学习引导，但不替代人与人之间的教育；技术也服务于人的学习、表达与协作。

## 参与

碑帖之间因共同的热爱而存在。无论学习阶段、专业背景或技术能力，都可以参与；普通爱好者的投稿优先，技术流程放在后面。

| 想做什么 | 怎么开始 |
| --- | --- |
| 分享临帖中的观察、经验或疑问 | 用[资料投稿表](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml)写一件事，可只用中文；见[中文投稿说明](docs/CONTRIBUTE.zh-CN.md) |
| 补一条馆藏出处、纠正一处文字 | 在浏览器里直接改对应 Markdown，或填[资料投稿表](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml)，写明出处与具体段落、页码或馆号 |
| 反馈阅读、导航或操作问题 | 按[五分钟试读](docs/CONTRIBUTE.zh-CN.md#五分钟试读)走一遍，再填[反馈表](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) |
| 不会使用 GitHub | 先整理好文字，请熟悉 GitHub 的朋友代为提交，或在已有的公开 Issue 中留言，由维护者在公开渠道协助整理 |
| 参与网站「关于」「共建」页所写的讨论与活动 | 利用开放资源自行学习、研究、交流；也可在公开 Issue 中分享所得 |
| 改网站或编译器 | Fork 后在分支上修改，向 `main` 提 PR；先看[上手与交接](docs/START-HERE.md) |
| 复刻为自己的知识库 | Fork 后替换 `knowledge/`、站点标题与部署地址；MIT 许可，保留 `NOTICE.md` 的第三方权利说明。见[上手与交接](docs/START-HERE.md#reusing-this-repository) |

**现有投稿入口的实情**：网站是 GitHub Pages 上的静态站点。实物记录里的「补充或纠正这条记录」只生成一段可阅读、可复制的文字，并在你点击时打开 GitHub 的预填投稿页；页面本身不保存、不发送内容，也没有站内投稿后台、账号体系或公开的专用联系方式。公开提交后，编辑核对可打开的来源，才决定是否收录。

欢迎直接提 PR，无需预先开 Issue；中文说明完全可以。[贡献指南](CONTRIBUTING.md) · [中文投稿与试读指南](docs/CONTRIBUTE.zh-CN.md)

## 知识库与网站怎样相连

`knowledge/` Markdown 作者源 → 只读编译器 → `data/index/knowledge-v1.json` → 网站、时间线、地图与下载包。

- `knowledge/` 是唯一作者源稿，可直接在 GitHub 上编辑，也可用任意 Markdown 编辑器修改。
- 网站不直接读作者 Markdown，编译器也不反向导入网页代码；隔离由 `npm run check:isolation` 检查。
- 同一输入编译两次，产物逐字节一致，由 `npm run check:reproducible` 验证。

细节：[架构与数据流](docs/engineering-plan.md#data-model-and-invariants) · [负责人架构导读与五幅图](docs/engineering-plan.md#负责人架构导读)

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `knowledge/` | 作者源稿：作品、实物、人物、地点、来源、读帖笔记 |
| `docs/PROJECT.md`、`docs/PROJECT.en.md` | 唯一权威的中英文项目理念 |
| `scripts/` | 编译器、校验、知识库打包与发布门槛 |
| `src/` | React 网站：案头、阅读、时间线、地图、知识库、关于与共建 |
| `data/index/knowledge-v1.json` | 编译器生成的带版本接口，网站只读这一份；构建时生成，不入库 |
| `docs/` | 现行操作文档：上手、编辑、设计、架构、发布、地图与归档 |

## 本地运行

需要 Node.js 24（见 [.nvmrc](.nvmrc)）与 npm；Windows PowerShell 中用 `npm.cmd`。

```sh
git clone https://github.com/yang963852/beitie-atlas.git
cd beitie-atlas
npm ci
npm run dev
```

`npm run dev` 会先编译知识库、生成总目并打包 ZIP。提交前运行 `npm run check`：类型、数据、接口、隔离、复现、文档、测试与预览构建一次跑完。天地图底图可选，没有密钥时地图退回经纬度示意，配置步骤见[地图设置](docs/map-setup.md)。

## 状态与限制

- 网站公开在 GitHub Pages 上，`main` 的每次通过检查的合并都会部署，因此线上内容可能晚于最近一次正式版。界面页脚与知识库题记显示正式版次（来自 `package.json` 的 `version`）和当前构建修订：全部条目已通过发布门槛与编辑确认；存疑与异说仍按原样留在各条的「待考」与「异说」中，不作确定性改写。正式版本、标签与回滚规则见[发布手册](docs/release.md)。
- 真实底图依赖天地图网络服务；无密钥或被拒绝时显示点位示意图。各地网络能否打开须在当地实测，项目不作保证。
- 引文、馆藏图片与地图服务的权利依各自依据处理。

## 许可与致谢

原创代码、文档与原创编辑内容采用 MIT 许可证。[许可证](LICENSE) · [权利与致谢](NOTICE.md)

[doublett523](https://github.com/doublett523) 设计并实现了案头落墨开场、年代长河、馆藏地图和知识库编辑入口。[贡献记录 #29](https://github.com/yang963852/beitie-atlas/pull/29)
