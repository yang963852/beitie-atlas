# 历史归档

2026-11-26 起，`main` 只保留当前来源、现行操作文档和当前里程碑。已完成的任务卡、交付报告、验收截图、批次研究，以及已完成的计划、台账、提案和一次性审计，保存在 annotated tag 中；`main` 不保留副本。

归档中的计划、提案与审计按当时状态冻结，不再随现行文档更新。需要继续某项工作时，先恢复对应文件，再按新的任务范围改写。

## archive-agent-records-2026-11-27

2026-11-27 为清理公共仓库中的本地 Agent 名称创建。包含：

- `tasks/052-repository-slimming.md`、`tasks/053-core-work-guides.md`（2 份任务卡）
- `docs/delivery-052.md`（交付报告）
- `scripts/research/inputs/ontology-pilot.a5e56b1.json`（研究输入）
- `knowledge/notes/duobao-reading.md` 的原始题注（当前版本已改为项目整理）

查看与恢复：

- 浏览归档目录：<https://github.com/yang963852/beitie-atlas/tree/archive-agent-records-2026-11-27>
- 查看单个文件：`git show archive-agent-records-2026-11-27:tasks/053-core-work-guides.md`
- 恢复文件：`git checkout archive-agent-records-2026-11-27 -- tasks/053-core-work-guides.md`

更早的分支与 Agent 分工表述仍保留在 `pre-refactor-2026-11-27` 快照中。

## archive-milestones-040-051-2026-11-26

2026-11-26 为精简仓库创建。包含：

- `tasks/040-*.md` … `tasks/051-*.md`（12 份任务卡）
- `docs/delivery-040.md` … `delivery-046.md`、`delivery-049.md` … `delivery-051.md`（10 份交付报告）
- `docs/screenshots/`（53 张 039–044 验收截图）
- `docs/research/`（2 份批次研究）
- `docs/project-plan.md`、`knowledge-plan.md`、`knowledge-ledger.md`、`knowledge-rebuild.md`、`learning-interface.md`、`work-page-redesign.md`、`repository-audit.md`（已完成的计划、台账、提案与一次性审计）

查看与恢复：

- 浏览归档目录：<https://github.com/yang963852/beitie-atlas/tree/archive-milestones-040-051-2026-11-26/docs>
- 查看单个文件：`git show archive-milestones-040-051-2026-11-26:docs/delivery-051.md`
- 恢复文件：`git checkout archive-milestones-040-051-2026-11-26 -- docs/knowledge-plan.md`

`knowledge-plan.md` 中仍生效的来源规则与七段导读规范已迁入 [中文投稿指南](CONTRIBUTE.zh-CN.md#来源六条硬规则)。

## archive-pre-hygiene-2026-11-25

2026-11-25 创建。任务 001–039 的任务卡、交付报告、审查、迁移基线与研究材料已从 `main` 移出，保存在该 tag。

- 浏览归档目录：<https://github.com/yang963852/beitie-atlas/tree/archive-pre-hygiene-2026-11-25/docs>
- 查看单个文件：`git show archive-pre-hygiene-2026-11-25:docs/delivery-039.md`
- 恢复文件：`git checkout archive-pre-hygiene-2026-11-25 -- <path>`

## 现行文档

从 [START-HERE](START-HERE.md)、[编辑流程](atlas-workflow.md)、[设计系统](design-system.md)、[工程方案](engineering-plan.md)、[发布手册](release.md) 和[投稿指南](../CONTRIBUTING.md)进入。
