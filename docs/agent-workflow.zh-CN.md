# 本地 Agent 工作流

2026-11-25 起，仓库使用两条长期分支承接本地 agent 的产出，`main` 只接收经负责人合并的检查结果。本文是协调者的操作说明；项目范围内的硬性规则仍以 [AGENTS.md](../AGENTS.md) 为准。2026-11-26 起采用轻量流程：自审即可，`npm run check` 通过并由负责人合并就是发布门槛，不再要求独立审阅、交付报告或验收归档。

## 1. 分支

| 分支 | 用途 | 谁提交 | 怎样进入 main |
| --- | --- | --- | --- |
| `main` | 唯一发布分支，Pages 从这里部署 | 不直接提交 | 只接受 PR |
| `trae/work` | TRAE 的长期工作分支：代码、测试、构建脚本 | TRAE | 完成后开 PR，由负责人合并 |
| `workbuddy/work` | WorkBuddy 的长期工作分支：`knowledge/` 资料、来源、实物与事件 | WorkBuddy | 完成后开 PR，由负责人合并 |

- Codex 默认只读，不推送分支；它把方案写进 Issue、任务卡或聊天，需要落盘时由 TRAE 提交。
- 一个分支同一时间只做一个任务。任务完成就开 PR、合并、同步，再开始下一个；不要把多个任务堆在长期分支上。
- 每次开始前先同步：
  ```powershell
  git fetch origin --prune
  git switch trae/work        # 或 workbuddy/work
  git merge origin/main
  ```
- 合并后再次同步长期分支，避免它与 `main` 越走越远：
  ```powershell
  git switch trae/work
  git merge origin/main
  git push
  ```
- 不直接推 `main`；不 force-push 长期分支；不替负责人决定合并。

## 2. 工作区

| Agent | 固定工作区 | 允许写入 |
| --- | --- | --- |
| TRAE | `.private/worktrees/trae`（分支 `trae/work`） | `src/`、`scripts/`、`tests/`、当前任务文档 |
| WorkBuddy | `.private/worktrees/workbuddy`（分支 `workbuddy/work`） | `knowledge/`、来源与读帖资料 |
| Codex | 主工作区只读；需要写方案时用 `.private/worktrees/codex` | 任务卡、方案、评审意见 |

- 主工作区（本仓库的根目录，下文用 `<项目根目录>` 表示）用于协调、查看和临时 WIP；不要让它同时承担 TRAE 和 WorkBuddy 的提交。
- WorkBuddy 应用会自动创建会话 worktree（路径由应用生成）。下一次会话请打开 `.private/worktrees/workbuddy`，或把会话提交转推到 `workbuddy/work`。
- 不在别人的工作区改文件；不把 `node_modules`、`dist`、浏览器配置或密钥提交到 Git。

## 3. 日常循环

1. 负责人决定当前做什么，写清读者结果、范围与证据；验收示例可选。
2. Codex 读代码和资料，产出方案或任务卡；不改产品代码。
3. TRAE / WorkBuddy 在自己的工作区分支上实现。
4. 本地检查：
   - 代码：`npm.cmd run check`
   - 知识：`npm.cmd run knowledge:compile && npm.cmd run knowledge:generate`，再跑 `npm.cmd run check`
5. 推送长期分支，开 PR 到 `main`；写范围、证据、实际检查、未验证项。
6. 负责人查看 CI 和 diff，决定合并；自审即可，不要求独立审阅。
7. 合并后同步 `main` 和长期分支，删除临时 worktree/分支。看板与交付记录可选；需要发布时更新 CHANGELOG 并打 tag。

## 4. 交接

| 从 | 交付给 | 形式 |
| --- | --- | --- |
| Codex | TRAE / WorkBuddy | 任务卡或 Issue：目标、文件、证据、停止点（验收示例可选） |
| TRAE | 负责人 | PR：改动、`npm run check` 结果、截图（UI）、限制 |
| WorkBuddy | 负责人 | PR：改动的 Markdown、`knowledge:compile` 结果、来源与待考项 |
| 负责人 | 仓库 | 合并、按需打发布 tag、线上冒烟 |

## 5. 清理规则

- 已合并的临时分支和 worktree 在合并当天删除；长期分支不删。
- 每个任务结束后清掉 `.private/tmp` 中该任务的副本、截图和缓存；`.private` 保持在 500 MB 以内。
- 任务超过 7 天未合并：先提交检查点，再由负责人决定继续、关闭或转成 Issue。
- 历史记录的归档可选；负责人明确要求时再打 `archive-*` annotated tag，并从 `main` 移除。
- 已归档记录的本地副本可放在 `.private/workspace-archive/`，不进入 Git。
- 当前任务直接看 Issue/PR；迭代看板可选。验收后的任务卡与交付记录不要求保留。
