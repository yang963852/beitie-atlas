# 中文投稿与试读指南

[项目首页](../README.md) · [知识库目录](../knowledge/README.md) · [网站 · 1.1 版](https://yang963852.github.io/beitie-atlas/)

## 直接提 PR

欢迎直接修改文章、资料或代码。PR 是把你的修改交给维护者审查的地方，无需预先开 Issue，也无需申请仓库写权限。主要审查人和维护人是 [@yang963852](https://github.com/yang963852)。

- **只改一篇文章**：按下方的浏览器步骤操作。
- **改代码或多个文件**：从本仓库创建 Fork，在自己的分支完成修改后打开 **Compare & pull request**。目标仓库选 `yang963852/beitie-atlas`，目标分支选 `main`，来源选自己的 Fork 和修改分支。说明改了什么、怎样核对，即可提交。后续修改继续推送同一分支。

## 直接编辑一篇文章

从[知识库](../knowledge/README.md)进入署名文章，点 GitHub 文件右上角的铅笔，修改正文或附上来源，再切到 **Preview** 检查。点 **Commit changes**，选择创建分支并提交 **Pull request**；首次参与时按 GitHub 提示创建自己的 Fork。在 PR 中写明改了哪一句、依据在哪里。若编辑的是标有「生成」的目录或实物资料，可在 PR 中修改对应的来源记录，并按下文更新生成页。只掌握线索时，也可以用资料投稿表附上该页链接。

读帖观察欢迎中文原稿。请写明观察人、具体版本、哪一字或哪一行、别人怎样复看。第三方图片可给原始链接；申请收录图片时附作者、来源、许可和署名方式。保留相冲突的著录和各自出处。一般投稿只走一条路径即可。

想新写一篇，可以在 [作品](../knowledge/works)、[书家](../knowledge/people)、[读帖笔记](../knowledge/notes)或[实物](../knowledge/objects)目录点 **Add file → Create new file**，用小写英文字母、数字与短横线起一个便于引用的文件名，以 `.md` 结尾。先复制对应的[中文模板](../knowledge/_templates/)，把 `schemaVersion: 1` 保留在顶部。作品与实物的日期、署名、出处和审核状态写在 YAML；背景、待考和导读写进正文。参考[现有作品](../knowledge/works/yan-qinli-bei.md)，正文用下列结构：

```markdown
---
schemaVersion: 1
titleZh: 作品题名
studyCategory: bei
dynastyId: tang
date:
  kind: single
  start: 779
  end: 779
  certainty: documented
attribution:
  - role: author-and-calligrapher
    name: 姓名
    certainty: documented
    sources: [src-example]
sources: [src-example]
review:
  state: draft
  note: 还缺什么证据
---

# 作品题名

## 背景

### 中文

……（有英文译文时放在 `### English`）

## 待考

### 中文

- ……（可省略译文，不要机器翻译）
```

没有署名时写 `role: unknown`，不要留空。日期没有来源时留空并在待考说明，不猜年份。

新建、改题或调整审核状态可能使知识总目需要更新。编辑可在同一投稿 PR 运行 `npm run knowledge:compile && npm run knowledge:generate` 并提交生成结果；如果投稿人使用 Fork，由编辑与投稿人协商分支更新或关联整理 PR。你可以始终只用浏览器。

## 下载完整知识库，改一篇再提 PR

[下载完整知识库 ZIP](https://yang963852.github.io/beitie-atlas/download/beitie-knowledge.zip)。压缩包随已检查的 `main` 生成，附源提交号、中文总目、作者 Markdown、生成目录、内部链接和权利说明。

1. 解压，用 Obsidian 或任意 Markdown 编辑器打开。先读根目录的 `开始阅读.md`。
2. 只改你要改的那一篇，例如 `knowledge/works/yan-qinli-bei.md`。文件名是稳定 ID，不要改名。
3. 在自己的 GitHub Fork 中按原路径上传这个文件，向 `yang963852/beitie-atlas` 的 `main` 提 PR。
4. 只提交你改动的源稿。`knowledge/catalogue/`、`knowledge/README.md` 和 `manifest.json` 是生成文件，由项目维护者重新生成。

## 只用浏览器提交资料

1. 登录 GitHub，打开[资料投稿表](https://github.com/yang963852/beitie-atlas/issues/new?template=knowledge.yml)。题目写「作品或人物＋想补充的事」。
2. 用自己的话写一件事。馆藏网页附链接和段落，书刊附作者、书名、版本、页码或图版。只知道线索时，在出处栏写「待查」，说清哪一点有疑问。
3. 点 **Create** 提交，记下弹出的 Issue 编号。资料编辑在原帖认领，回帖附整理后的条目、PR 链接、待补证据或暂缓收录的理由。署名可用 GitHub 名或笔名。

例如，故宫藏《颜勤礼碑》拓册的馆藏号为「新00045406」。如果要补制作年代，可以写「故宫藏品简介著录为民国拓本，具体拓年待考」，注明该页的对象名称、简介段和链接。把这条证据归给故宫这件拓册，原石另有自己的经历。[故宫藏品著录](https://www.dpm.org.cn/collection/impres/234175.html)

## 五分钟试读

1. 打开[网页知识库](https://yang963852.github.io/beitie-atlas/#/library)，找到[颜真卿](https://yang963852.github.io/beitie-atlas/#/person/yan-zhenqing)，从书家页进入[《颜勤礼碑》](https://yang963852.github.io/beitie-atlas/#/work/yan-qinli-bei)。刷新一次，看看能否回到同一条目。
2. 打开作品下的一件实物，找它的持藏出处。换到另一件，对比实物名称、年代和记载。再回知识库，选择「书家」，搜「沈尹默」，查一条与他有关的人物关系及所附依据。
3. 任选手机或电脑，试试键盘 Tab、浏览器返回或放大页面。遇到问题点[反馈问题](https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml)，写下出问题的网址、设备或浏览器、操作步骤、实际结果和预期。也欢迎告诉我们哪段叙述最难读。

目前人物与作品专题按选题逐步增加，条目以馆方与印本著录为据；部分年代、藏址与当代临习使用情况仍待来源核实。真实底图依赖网络和地图服务；没有坐标的实物仍可查阅文字、来源和已知地点。各地网络能否打开须在当地实际测试。网站读者都能打开这个公开的 Pages 地址；「1.1」指本次内容版次。
