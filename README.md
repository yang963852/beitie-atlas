# 碑帖之间 · Between Steles

**简体中文** · [English](README.en.md)

**[打开在线图鉴](https://beitie-atlas.partedlute2.chatgpt.site/)** · [反馈问题或补充资料](https://github.com/yang963852/beitie-atlas/issues)

一部以文字著录清代及以前传世书法的碑帖目录。按朝代浏览碑刻、法帖和墨迹，按作品名、书家或馆藏编号检索。每件原石、拓本或摹本独立记录年代、收藏地点和出处。

收录时限以作品形成时间为准。古碑的后世拓本保留自己的制作年代。资料缺项标为未知，审核状态见各条详情。

![碑帖之间三栏图鉴，中央为天地图底图](docs/screenshots/011-live-map-1440.png)

*本地预览实拍。在线版使用天地图，底图不可用时仍可通过坐标示意和地点列表查看记录。*

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

React、TypeScript 和 Vite 构建静态应用，JSON 管理作品、实物和出处，天地图提供底图，Vitest 与 GitHub Actions 负责自动检查，Codex Sites 托管公开预览。

| 要做什么 | 从这里开始 |
| --- | --- |
| 接手开发、查找目录和命令 | [维护者与 AI 交接](docs/START-HERE.md) · [项目规则](AGENTS.md) |
| 补充出处、纠正馆藏或提交代码 | [贡献指南](CONTRIBUTING.md) · [资料与协作流程](docs/atlas-workflow.md) |
| 查看当前进度和发布条件 | [迭代看板](docs/iteration-board.md) · [变更记录](CHANGELOG.md) · [发布手册](docs/release.md) |

原创代码、文档及原创编辑贡献采用 [MIT 许可证](LICENSE)。馆藏图片、引文与地图服务适用各自的使用条款。[权利与致谢说明](NOTICE.md)
