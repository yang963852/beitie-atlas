# 碑帖之间 · Between Steles

**简体中文** · [English](README.en.md) · [知识库目录](knowledge/README.md) · [中文投稿与试读指南](docs/CONTRIBUTE.zh-CN.md)

临《颜勤礼碑》时，我们看到的是哪一份拓本？碑文写给谁？碑背那个「故」字，在不同版本里还能辨出哪些笔画？碑帖之间为临帖者整理从先秦到当代的作品、书家和传世实物，让读者循着一次观察找到原始出处。

**[打开网站](https://yang963852.github.io/beitie-atlas/)** · [读 Markdown 知识库](knowledge/README.md) · [下载完整知识库 ZIP](https://yang963852.github.io/beitie-atlas/download/beitie-knowledge.zip) · [提交资料](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml) · [反馈问题](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml)

## 在网站里能做什么

- **从案头进入**：一张摊开的帖引你进入年代长河；桌上的帖影直达《兰亭序》神龙本的实物记录。
- **读一件作品**：从[《颜勤礼碑》](https://yang963852.github.io/beitie-atlas/#/work/yan-qinli-bei)开始，背景、书家、传世实物分开呈现；原石与民国拓本各有履历，不互相顶替。
- **看年代长河**：按作品所属时代浏览[全部作品](https://yang963852.github.io/beitie-atlas/#catalogue)，先秦至当代。
- **查馆藏地图**：在[馆藏地图](https://yang963852.github.io/beitie-atlas/#/collections)按今天的收藏地找实物；没有可靠坐标的地点只列文字，不猜位置。
- **找书家与读帖笔记**：在[知识库](https://yang963852.github.io/beitie-atlas/#/library)按作品、书家、笔记或实物档案进入，例如[颜真卿](https://yang963852.github.io/beitie-atlas/#/person/yan-zhenqing)。

**当前收录**（`npm run knowledge:compile`，2026-11-25）：117 部作品 · 126 件实物 · 46 处地点 · 184 条来源 · 75 条事件。

## 三条编辑原则

- **作品与实物分开**：原石的出土经历只写在原石履历里，不复制给拓本或翻刻。
- **冲突并存**：相矛盾的著录分别记述、分别注明出处，不强行选一个首选说法。
- **未知留白**：没有来源的年份、坐标和当代使用情况留空并标明待考，不猜、不编。

撰稿与审核步骤见[编辑流程](docs/atlas-workflow.md)。

## 知识库与网站怎样相连

`knowledge/` Markdown 作者源 → 只读编译器 → `data/index/knowledge-v1.json` → 网站、时间线、地图与下载包。

- `knowledge/` 是唯一作者源稿，可直接在 GitHub 或 Obsidian 中编辑。
- 网站不直接读作者 Markdown，编译器也不反向导入网页代码；隔离由 `npm run check:isolation` 检查。
- 同一输入编译两次，产物逐字节一致，由 `npm run check:reproducible` 验证。

细节：[架构与数据流](docs/engineering-plan.md#data-model-and-invariants) · [负责人架构导读与五幅图](docs/engineering-plan.md#负责人架构导读)

## 参与

| 想做什么 | 怎么开始 |
| --- | --- |
| 改一篇文章、补一条馆藏出处 | 在浏览器里编辑对应 Markdown，或填[资料投稿表](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml)。可只用中文 |
| 在 Obsidian 里改一篇再提交 | [下载知识库 ZIP](https://yang963852.github.io/beitie-atlas/download/beitie-knowledge.zip)，按原路径提 PR |
| 改网站或编译器 | Fork 后在分支上修改，向 `main` 提 PR；先看[上手与交接](docs/START-HERE.md) |
| 反馈问题 | 按[五分钟试读](docs/CONTRIBUTE.zh-CN.md#五分钟试读)走一遍，再填[反馈表](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml) |
| 复刻为自己的知识库 | Fork 后替换 `knowledge/`、站点标题与部署地址；MIT 许可，保留 `NOTICE.md` 的第三方权利说明。见[上手与交接](docs/START-HERE.md#reusing-this-repository) |

欢迎直接提 PR，无需预先开 Issue；中文说明完全可以。[贡献指南](CONTRIBUTING.md) · [中文操作指南](docs/CONTRIBUTE.zh-CN.md)

## 本地运行

需要 Node.js 24（见 [.nvmrc](.nvmrc)）与 npm；Windows PowerShell 中用 `npm.cmd`。

```sh
git clone https://github.com/yang963852/beitie-atlas.git
cd beitie-atlas
npm ci
npm run dev
```

`npm run dev` 会先编译知识库、生成总目并打包 ZIP。提交前运行 `npm run check`：类型、数据、接口、隔离、复现、文档、测试与预览构建一次跑完。天地图底图可选，没有密钥时地图退回经纬度示意，配置步骤见[地图设置](docs/map-setup.md)。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `knowledge/` | 作者源稿：作品、实物、人物、地点、来源、读帖笔记 |
| `scripts/` | 编译器、校验、知识库打包与发布门槛 |
| `src/` | React 网站：阅读、时间线、地图、知识库 |
| `data/index/knowledge-v1.json` | 编译器生成的带版本接口，网站只读这一份 |
| `docs/` | 现行操作文档：上手、编辑、设计、架构、发布、地图与归档 |

## 状态与限制

- 网站公开在 GitHub Pages 上，当前内容为**1.2 版**：全部条目已通过发布门槛与编辑确认；存疑与异说仍按原样留在各条的「待考」与「异说」中，不作确定性改写。发布流程见[发布手册](docs/release.md)。
- 真实底图依赖天地图网络服务；无密钥或被拒绝时显示点位示意图。各地网络能否打开须在当地实测，项目不作保证。
- 引文、馆藏图片与地图服务的权利依各自依据处理。

## 许可与致谢

原创代码、文档与原创编辑内容采用 MIT 许可证。[许可证](LICENSE) · [权利与致谢](NOTICE.md)

[doublett523](https://github.com/doublett523) 设计并实现了案头落墨开场、年代长河、馆藏地图和知识库编辑入口。[贡献记录 #29](https://github.com/yang963852/beitie-atlas/pull/29)
