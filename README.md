# 碑帖之间 · Between Steles

**简体中文** · [English](README.en.md)

**[在线图鉴 · GitHub Pages 试览](https://yang963852.github.io/beitie-atlas/)** · [反馈问题或补充资料](https://github.com/yang963852/beitie-atlas/issues)

临帖时，我们面对的是怎样传下来的一行字？《玄秘塔碑》的原石藏在西安，故宫另藏它的明初拓册。同一篇碑文，石与纸各有去处。碑帖之间为书法学习者整理清代及以前的著名碑帖，从案头的一笔一画出发，循地图访其所藏，循著录读其来历。

按「全部／碑／帖」浏览，亦可按书家检索。「碑」收碑志、摩崖等刻辞，「帖」收尺牍、墨迹及汇刻法帖。拓自哪一类作品，便随哪一类著录。

![碑帖之间卷首](docs/screenshots/027-1440.png)

图为任务 027 的桌面卷首。 [版本与交接](docs/START-HERE.md) · [逐条审核清单](docs/editorial-review-025.md)

## 本地运行

准备 Git 和 Node.js 24，执行以下命令，然后打开终端显示的地址。

```bash
git clone https://github.com/yang963852/beitie-atlas.git
cd beitie-atlas
npm ci
npm run dev
```

Windows 可用 `npm.cmd` 替代 `npm`。浏览资料无需地图密钥，接入真实底图见[天地图配置](docs/map-setup.md)。提交改动前运行 `npm run check`。

## 技术与项目文档

React、TypeScript 和 Vite 构建静态应用，JSON 管理作品、实物和出处，天地图提供底图，Vitest 与 GitHub Actions 负责自动检查。GitHub Pages 是项目唯一的网站托管平台。

| 要做什么 | 从这里开始 |
| --- | --- |
| 接手开发、查找目录和命令 | [维护者与 AI 交接](docs/START-HERE.md) · [项目规则](AGENTS.md) |
| 补充出处、纠正馆藏或提交代码 | [贡献指南](CONTRIBUTING.md) · [资料与协作流程](docs/atlas-workflow.md) |
| 查看当前进度和发布条件 | [迭代看板](docs/iteration-board.md) · [变更记录](CHANGELOG.md) · [发布手册](docs/release.md) |

原创代码、文档及原创编辑贡献采用 [MIT 许可证](LICENSE)。馆藏图片、引文与地图服务适用各自的使用条款。[权利与致谢说明](NOTICE.md)
