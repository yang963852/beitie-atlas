# 本地 Agent 工作流

自 1.2 版发布起，本地 Agent 改为一个任务一条短期分支：每个任务都从当前 `main` 新建 `task/NNN-slug`，在固定工作区里完成，开一个 PR，合并后删除。`main` 仍然只接收经负责人合并的检查结果。本文是协调者的操作说明；项目范围内的硬性规则仍以 [AGENTS.md](../AGENTS.md) 为准。轻量流程不变：自审即可，`npm run check` 通过并由负责人合并就是发布门槛，不再要求独立审阅、交付报告或验收归档。

## 1. 分支

| 分支 | 用途 | 谁提交 | 怎样进入 main |
| --- | --- | --- | --- |
| `main` | 唯一发布分支，Pages 从这里部署 | 不直接提交 | 只接受 PR |
| `task/NNN-slug` | 单个任务：代码、测试、构建脚本，或 `knowledge/` 资料 | TRAE / WorkBuddy / 外部贡献者 | 完成后开 PR，由负责人合并，合并后删除 |

- Codex 默认只读，不推送分支；它把方案写进 Issue、任务卡或聊天，需要落盘时由实现者提交。
- 一条分支只做一个任务，合并即删；不要复用旧分支，也不要维护按 agent 命名的长期分支。
- 每次开始前从最新 `main` 新建任务分支（在各自的工作区里执行）：
  ```powershell
  git fetch origin --prune
  git switch -c task/NNN-slug origin/main
  ```
  任务号沿用 Issue 或任务卡的编号，slug 用简短英文，例如 `task/057-task-branches`。
- 如果任务期间 `main` 前进了，开 PR 前先合并一次：
  ```powershell
  git fetch origin --prune
  git merge origin/main
  ```
- 不直接推 `main`；不 force-push；不替负责人决定合并。

## 2. 工作区

| Agent | 固定工作区 | 允许写入 |
| --- | --- | --- |
| TRAE | `.private/worktrees/trae` | `src/`、`scripts/`、`tests/`、当前任务文档 |
| WorkBuddy | `.private/worktrees/workbuddy` | `knowledge/`、来源与读帖资料 |
| Codex | 主工作区只读；需要写方案时用 `.private/worktrees/codex` | 任务卡、方案、评审意见 |

- 工作区目录固定，分支随任务变化：每个任务在目录里新建 `task/NNN-slug`；PR 合并后切回一个干净的 `origin/main`，等待下一个任务：
  ```powershell
  git fetch origin --prune
  git switch --detach origin/main
  ```
- 主工作区（本仓库的根目录，下文用 `<项目根目录>` 表示）用于协调、查看和临时 WIP；不要让它同时承担 TRAE 和 WorkBuddy 的提交。
- WorkBuddy 应用会自动创建会话 worktree（路径由应用生成）。下一次会话请打开 `.private/worktrees/workbuddy`，或把会话提交推成一条 `task/NNN-slug` 分支。
- 不在别人的工作区改文件；不把 `node_modules`、`dist`、浏览器配置或密钥提交到 Git。

## 3. 日常循环

1. 负责人决定当前做什么，写清读者结果、范围与证据；验收示例可选。
2. Codex 读代码和资料，产出方案或任务卡；不改产品代码。
3. TRAE / WorkBuddy 在自己的工作区新建 `task/NNN-slug` 分支实现。
4. 本地检查：
   - 代码：`npm.cmd run check`
   - 知识：`npm.cmd run knowledge:compile && npm.cmd run knowledge:generate`，再跑 `npm.cmd run check`
5. 推送任务分支，开 PR 到 `main`；写范围、证据、实际检查、未验证项。
6. 负责人查看 CI 和 diff，决定合并；自审即可，不要求独立审阅。
7. 合并后同步 `main`，删除已合并的任务分支（本地与远端）。看板与交付记录可选；需要发布时更新 CHANGELOG 并打 tag。

## 4. 交接

| 从 | 交付给 | 形式 |
| --- | --- | --- |
| Codex | TRAE / WorkBuddy | 任务卡或 Issue：目标、文件、证据、停止点（验收示例可选） |
| TRAE | 负责人 | PR：改动、`npm run check` 结果、截图（UI）、限制 |
| WorkBuddy | 负责人 | PR：改动的 Markdown、`knowledge:compile` 结果、来源与待考项 |
| 负责人 | 仓库 | 合并、按需打发布 tag、线上冒烟 |

## 5. 清理规则

- 已合并的任务分支在合并当天删除（本地与远端）；固定 worktree 保留。
- 每个任务结束后清掉 `.private/tmp` 中该任务的副本、截图和缓存；`.private` 保持在 500 MB 以内。
- 任务超过 7 天未合并：先提交检查点，再由负责人决定继续、关闭或转成 Issue。
- 历史记录的归档可选；负责人明确要求时再打 `archive-*` annotated tag，并从 `main` 移除。
- 已归档记录的本地副本可放在 `.private/workspace-archive/`，不进入 Git。
- 当前任务直接看 Issue/PR；迭代看板可选。验收后的任务卡与交付记录不要求保留。
