# 仓库与本地 Agent 工作流整理方案

**状态：待负责人批准。** 基线为同步后的 `origin/main`（当前 `0fc8b85`，本地 `main` 落后 7 个提交）。本方案只做仓库与工作区整理，不改读者界面、知识结论或发布门槛。

## 1. 结论摘要

1. **一套三人工作流**：Codex 只做思考与方案，TRAE 只做代码，WorkBuddy 只做资料；三者各用一个固定工作区，一个任务只对应一个分支、一个 PR、一个负责人。
2. **main 只留最新**：`main` 保留当前来源、现行文档、最近任务 040–043；001–039 的任务卡、交付报告、审查、迁移基线与研究材料移出 `main`，由 annotated tag `archive-pre-hygiene-2026-11-25` 保留。
3. **退役旧库**：先打归档 tag，再删除 `data/works/`、`data/objects/` 等旧 JSON 和迁移/盘点/对照脚本；网页与校验继续只读 `data/index/knowledge-v1.json`。
4. **清分支与工作区**：远端只保留 `main` 和仍有开放 PR 的分支；本地只保留主工作区，删除 7 个已合并的临时 worktree、过期分支、测试副本和缓存（当前 `.private` 约 4.5 GB）。
5. **不重写历史**：删除只发生在当前 `main` 的工作树上，历史提交、release tag 和归档 tag 都可恢复；GitHub 仓库对象体积不会因此显著变小。

## 2. 现状分析（已核实）

| 项目 | 现状 | 问题 |
| --- | --- | --- |
| 本地 `main` | `3b91527`，落后 `origin/main` 7 个提交 | 本地不是最新，清理前必须先同步 |
| 远端分支 | 19 个；12 个已合并；`dependabot/npm_and_yarn/multi-...` 有开放 PR #31 | 已合并分支残留，来源混杂 |
| 本地分支 | 大量已合并分支 + `docs/readme-refresh`（README 提交未推送）+ 多个检查点 | 不易判断哪一个还活着 |
| worktree | 7 个已注册 worktree（worktree-040/042/a/b/d、direct-pr-verification、review-pr29）+ WorkBuddy 自带 1 个 | 全部已合并或已过期，占空间且容易误改 |
| `.private` | 约 4.5 GB；79 个浏览器配置约 2.2 GB；大量 `atlas-*`、`library-*`、`npm-cache`、`arch-*` | 测试副本与缓存没有回收 |
| 旧 JSON | 85 个作品 + 95 个实物 + places/sources/media 等，约 490 KB | 已被 Markdown 知识库取代，仍被文档描述为“冻结基线” |
| 迁移脚本 | `migrate-legacy.ts`、`knowledge-inventory.ts`、`knowledge-parity.ts`、`lib/dataset.ts`、迁移摘要 fixture | 一次性迁移已完成，继续留在 main 会让人误以为还要维护 |
| 文档 | 40 个 delivery、42 个 task、baseline 约 458 KB、大量历史截图 | 入口过多，新贡献者不知道哪份是现行规则 |
| GitHub 设置 | `delete_branch_on_merge=true`；`main` 已保护；Pages 只从 `main` 部署 | 方向正确，需补齐“只保留 main + 开放 PR”的执行 |
| 校验链路 | `check:data` 与 release gate 已改用 `compileKnowledge`；旧 JSON 只被 inventory/parity/migrate 读取 | 删除旧 JSON 不会影响网页、构建和正式门槛 |

## 3. 目标工作流

### 3.1 角色

| Agent | 负责 | 不负责 | 交付物 |
| --- | --- | --- | --- |
| Codex | 读代码与资料、比较方案、写任务卡、复核 PR | 不直接改产品代码；不决定合并 | 任务卡/方案、评审意见、Issue 或 PR 评论 |
| TRAE | 网页、编译器、测试、构建与发布脚本 | 不改 `knowledge/` 资料；不改归档 | 可运行代码 + `npm run check` 结果 + PR |
| WorkBuddy | `knowledge/` 作者源稿、来源、实物与事件、读帖笔记 | 不改网页与编译器；不改冻结/归档数据 | 知识 Markdown + 生成页 diff + PR |

### 3.2 固定工作区

| 工作区 | 路径 | 写入范围 | 分支前缀 |
| --- | --- | --- | --- |
| TRAE 主工作区 | `c:\Users\zhangyang\Desktop\AI_working\碑帖之间` | 代码、文档、当前任务 | `trae/<NNN>-<slug>` |
| WorkBuddy 工作区 | `C:\Users\zhangyang\WorkBuddy\Worktrees\碑帖之间\`（应用自带，一场会话一个） | 仅 `knowledge/` 与投稿资料 | `wb/<NNN>-<slug>` |
| Codex 工作区 | 默认只读主工作区；需要写方案时用 `.private/worktrees/codex` | 任务卡、方案、评审记录 | `codex/<NNN>-<slug>` |

规则：

- 同一时间每个 Agent 只有一个活动工作区和一条活动分支；不同 Agent 不共用工作区。
- 主工作区只给 TRAE；Codex 默认只读，不写主工作区；WorkBuddy 不碰主工作区。
- WorkBuddy 的 `Worktrees/碑帖之间/` 是应用管理的 Git worktree，是唯一允许位于仓库外的例外；不要在其中创建项目输出。
- `main` 只用于同步、只读检查和合并后拉取，不在 `main` 上直接提交。

### 3.3 分支与 PR 生命周期

- 分支名：`trae/NNN-slug`、`wb/NNN-slug`、`codex/NNN-slug`；外部贡献者继续用 `task/slug`。
- 每个任务从 `origin/main` 开分支；分支存活不超过 7 天。超期要么完成，要么打 `archive-branch-*` tag 后关闭。
- 一个任务 = 一条分支 = 一个 PR = 一个负责人。PR 写清范围、证据、跑过的检查、未验证项。
- 合并后由 GitHub 自动删除 head branch；本地在合并后 `git switch main && git pull --ff-only`，再删除本地分支和 worktree。
- 不 force-push 已推送的分支；不直接推 `main`；不替负责人决定合并。
- Codex 只评审、不改被评审分支；若必须修，另开一条 `codex/` 分支或由原负责人修改。

### 3.4 日常循环

1. 协调者建 Issue 或 `tasks/NNN-*.md`，写清读者结果、范围、证据、验收。
2. Codex 读 `AGENTS.md`、`docs/START-HERE.md` 和相关代码，产出任务卡或方案；不写代码。
3. TRAE 或 WorkBuddy 在自己的工作区执行：
   ```powershell
   git fetch origin --prune
   git switch -c trae/043-repo-hygiene origin/main
   # 或 wb/043-knowledge-topic / codex/043-plan-topic
   ```
4. 完成任务后本地检查：
   - 代码：`npm.cmd run check`
   - 知识：`npm.cmd run knowledge:compile && npm.cmd run knowledge:generate`，再跑 `npm.cmd run check`
5. 推送并开 PR；CI 必须通过；Codex 或协调者评审；实施者自审要标为 self-review。
6. 协调者决定合并；Pages 自动从 `main` 部署预览。
7. 合并后同步 `main`，删除分支与 worktree；里程碑写 `docs/delivery-NNN.md` 并更新看板。

### 3.5 禁止事项

- 不在主工作区同时做两个任务；不在别人的 worktree 中改文件。
- 不把 `node_modules`、`dist`、`.env.local`、地图密钥、浏览器配置提交到 Git。
- 不把 `knowledge/` 作者源稿直接复制进 `src/`；网页只读编译接口。
- 不为了“干净”重写已推送历史；归档用 tag，不用 rebase 公共分支。
- 不删除仍被开放 PR 引用的分支。

## 4. 仓库清理方案

### 4.1 先打归档 tag

在同步后的 `origin/main` 上创建 annotated tag：

```powershell
git fetch origin --prune
git switch main
git merge --ff-only origin/main
git tag -a archive-pre-hygiene-2026-11-25 -m "Archive before repository hygiene: milestones 001-039, baseline and retired legacy corpus"
git push origin archive-pre-hygiene-2026-11-25
```

tag 必须推送成功后才能删除任何文件或分支；推送失败就停止清理。

### 4.2 退役旧 JSON 与迁移工具

删除：

- `data/works/`、`data/objects/`
- `data/places.json`、`data/sources.json`、`data/media.json`
- `data/knowledge-relations.json`、`data/yan-qinli-journey.json`
- `scripts/lib/dataset.ts`
- `scripts/migrate-legacy.ts`
- `scripts/knowledge-inventory.ts`
- `scripts/knowledge-parity.ts`
- `scripts/research/fixtures/knowledge-migration-digests.json`
- `scripts/research/check-ontology-pilot.mjs`（确认无其他引用后）

同步修改：

- `package.json` 删除 `knowledge:inventory`、`knowledge:parity`。
- `scripts/check-isolation.ts` 从 `compilerFiles` 移除已删脚本；保留（或简化）对旧路径的禁止规则，防止重新引入。
- `scripts/check-data.ts` 的报错文案从“data/ 中没有作品/实物”改为“编译后的知识库中没有作品/实物”。
- `docs/knowledge-rebuild.md`、`AGENTS.md`、`templates/task-brief.md` 删除“冻结旧 JSON”的现行要求，改为“旧库已于 2026-11-25 退役，归档于 tag”。

依据：`check:data`、release gate、网页和构建都已使用 `compileKnowledge`；旧 JSON 只被上述一次性迁移脚本读取，迁移报告记录 0 项未解释差异。

### 4.3 文档只留最新

保留在 `main`：

- 现行规则与入口：`AGENTS.md`、`README.md`、`README.en.md`、`README.zh-CN.md`、`CONTRIBUTING.md`、`CHANGELOG.md`（重写）、`LICENSE`、`NOTICE.md`
- 现行 docs：`START-HERE.md`、`CONTRIBUTE.zh-CN.md`、`atlas-workflow.md`、`design-system.md`、`engineering-plan.md`、`release.md`、`map-setup.md`、`iteration-board.md`（重写）、`knowledge-rebuild.md`（更新旧库表述）
- 新增：`docs/agent-workflow.zh-CN.md`、`docs/archive.md`
- 最近任务：`tasks/040-*.md` 至 `tasks/043-*.md`、`docs/delivery-040.md` 至 `docs/delivery-043.md`
- 近期证据：`docs/research/classics-selection-2026-11.md`；`docs/screenshots/039-1440.png`（README 配图）和 `040-*`、`041-*`、`042-*` 截图

从 `main` 删除（tag 中保留）：

- `tasks/001-*.md` … `tasks/039-*.md`
- `docs/delivery-001.md` … `docs/delivery-039.md`
- `docs/review-001.md`、`docs/review-002.md`、`docs/review-022.md`、`docs/editorial-review-025.md`
- `docs/可行性与协作方案.md`、`docs/research-execution-plan.zh-CN.md`、`docs/execution-plan-2026-11-23.md`
- `docs/map-pilot.md`、`docs/map-options.md`、`docs/canonical-coverage.md`、`docs/source-audit.md`
- `docs/baseline/`、`docs/archive/`（旧的两个 JSON）
- `docs/research/` 中除 `classics-selection-2026-11.md` 以外的研究文档与 `ontology-pilot.json`
- `docs/screenshots/` 中除上述保留项外的历史截图

重写：

- `docs/iteration-board.md`：只保留 040–043 行和现行决策；顶部写明 001–039 已归档到 tag，并给出 tag 链接。
- `CHANGELOG.md`：只保留 `v0.2.0-beta.1` / 内部测试第一版一节，其余指向 GitHub Releases 和归档 tag。
- `docs/archive.md`：一页式历史索引，说明归档范围、tag 浏览方式、单文件恢复命令 `git checkout archive-pre-hygiene-2026-11-25 -- <path>`。

### 4.4 更新所有指向归档文件的链接

删除后逐一检查并改写这些现行文档中的引用：

| 文件 | 需要改的内容 |
| --- | --- |
| `docs/START-HERE.md` | 删除“frozen legacy JSON”句；`delivery-021` 链接改为 tag 链接；加入 agent 工作流入口 |
| `docs/release.md` | `delivery-021` 链接改为 tag 链接 |
| `docs/atlas-workflow.md` | `delivery-018`、`research/ontology.md` 改为 tag 链接或删去 |
| `docs/engineering-plan.md` | 旧 JSON 说明、`map-options.md`、`delivery-036`、ADR-004 文字 |
| `docs/knowledge-rebuild.md` | 第 2 节旧库条目、第 3 节迁移卡、第 6 节 delivery/baseline 链接 |
| `templates/task-brief.md` | 删除“Do not edit the frozen legacy JSON” |
| `README.md` / `README.en.md` | 删除“data/ 其余旧 JSON”行；加一行归档入口 |
| `AGENTS.md` | 旧库规则改为归档说明；新增本地工作区与分支生命周期 |
| `.agents/skills/*`、`.github/*` | 检查是否引用已删文档，按需改 tag 链接 |

链接审计：对保留的 Markdown 提取相对链接，逐个确认文件存在；`npm run check:docs` 必须通过。

### 4.5 GitHub 分支与设置

清理顺序：

1. `git fetch origin --prune` 后列出远端分支，与 `origin/main` 比对。
2. 已合并分支：直接删除远端分支。
3. 有独有提交的分支：先建 `archive-branch-<name>-2026-11-25` tag 并推送，再删除。
4. 保留 `main`；保留开放 PR #31 的 head branch，直到该 PR 合并或关闭。
5. 本地同步后删除所有已合并本地分支；有独有提交的先打 tag。
6. 确认 `delete_branch_on_merge=true`、`main` 需要 PR 和 required check `Preview quality checks`；缺失则在 GitHub 设置中补齐。
7. 保留 release tag：`v0.1.0-alpha.1`、`v0.1.0-alpha.2`、`v0.2.0-beta.1`。

### 4.6 README 先行 PR

本地 `docs/readme-refresh` 已有提交 `ab41567`（两个 README）。先把它变成独立 PR：

```powershell
git switch docs/readme-refresh
git rebase origin/main
git push -u origin docs/readme-refresh
gh pr create --base main --head docs/readme-refresh --title "docs: refresh the repository README and project overview" --body "Restructure the Chinese and English READMEs; update repository metadata separately."
```

CI 通过、负责人合并后，再从最新 `origin/main` 开 `trae/043-repo-hygiene`。后续清理 PR 基于包含 README 的 main。

## 5. 本地清理方案

### 5.1 清 worktree

先关闭 WorkBuddy 中已完成的会话，再逐个移除（全部已确认 clean 且已合并）：

```powershell
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/worktree-040"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/worktree-042"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/worktree-a"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/worktree-b"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/worktree-d"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/direct-pr-verification"
git worktree remove "C:/Users/zhangyang/Desktop/AI_working/碑帖之间/.private/tmp/review-pr29-38d73a6"
git worktree remove "C:/Users/zhangyang/WorkBuddy/Worktrees/碑帖之间/main-57a0db19"
git worktree prune
```

若提示 locked，先 `git worktree unlock <path>`；只有确认没有未提交改动后才允许 `--force`。

### 5.2 清本地分支

```powershell
git switch main
git pull --ff-only
git branch --merged main
# 删除已合并分支（保留 main 与当前任务分支）
git branch -d <branch> ...
# 对未合并分支先确认 unique commits；有则打 archive 本地 tag 后再删
```

保留：`main`、当前 `trae/043-repo-hygiene`。`docs/readme-refresh` 合并后删除。`feat/040-library-reading-style` 的检查点提交已由 PR #43 + README PR 覆盖，确认后删除。

### 5.3 清 `.private`

- 删除 `.private/tmp` 下除当前任务 worktree 外的全部测试副本与缓存：`036-*`、`atlas-*`、`library-*`、`refined-*`、`classroom-*`、`card-*`、`arch-*`、`npm-cache`、`review29-npm-cache`、`node-compile-cache`、`esbuild*`、`pip-cache`、`tsx-*`、`maintenance-build-tmp`、`edge-profile`、`msedge*`、`research` 克隆等。
- 删除 `.private/workspace-archive`（当前为空）。
- `.private/browser` 保留最近修改的 1 个配置，其余删除（测试用，可重建）。
- 保留主工作区的 `node_modules`；`dist/` 可删，构建会重建。
- 目标：`.private` 从约 4.5 GB 降到 500 MB 以内。

清理后运行：

```powershell
git worktree list
git branch -vv
git status --short --branch
git gc --prune=now
```

## 6. 具体改动文件清单

| 文件 | 动作 | 原因 |
| --- | --- | --- |
| `docs/agent-workflow.zh-CN.md` | 新增 | 三角色、三工作区、分支生命周期、日常循环、交接与清理清单 |
| `docs/archive.md` | 新增 | 唯一历史索引，指向归档 tag |
| `AGENTS.md` | 修改 | 新增本地工作区规则；旧库改为归档说明；明确归档不算改写证据 |
| `docs/START-HERE.md` | 修改 | 删除旧 JSON 句、归档链接、工作流入口 |
| `docs/release.md` | 修改 | 历史交付链接改 tag |
| `docs/atlas-workflow.md` | 修改 | 历史研究/交付链接改 tag |
| `docs/engineering-plan.md` | 修改 | 旧库、历史 provider 评估、ADR 引用 |
| `docs/knowledge-rebuild.md` | 修改 | 旧库退役；迁移任务标记完成；链接改 tag |
| `docs/iteration-board.md` | 重写 | 只留 040–043 与现行决策 |
| `CHANGELOG.md` | 重写 | 只留当前 release，历史指向 tag/Releases |
| `README.md`、`README.en.md` | 修改 | 删除旧 JSON 行，加入归档与工作流入口 |
| `templates/task-brief.md` | 修改 | 删除冻结旧 JSON 要求 |
| `package.json` | 修改 | 删除 inventory/parity 命令 |
| `scripts/check-isolation.ts`、`scripts/check-data.ts` | 修改 | 移除已删脚本与旧文案 |
| `data/…`、`scripts/…` | 删除 | 见 4.2 |
| `tasks/001–039`、`docs/delivery-001–039`、旧 docs/screenshots | 删除 | 见 4.3 |
| `tasks/043-repository-hygiene.md` | 新增 | 本次整理的任务卡 |
| `docs/delivery-043.md` | 新增 | 记录 revision、命令、结果、限制与 tag |

## 7. 实施顺序

1. **README PR**：rebase、推送、开 PR、CI、合并。
2. **同步与归档**：`git fetch --prune`、`main` fast-forward、创建并推送 `archive-pre-hygiene-2026-11-25`。
3. **开任务分支**：`git switch -c trae/043-repo-hygiene origin/main`；先写 `tasks/043-repository-hygiene.md`。
4. **写工作流**：新增 `docs/agent-workflow.zh-CN.md`，更新 `AGENTS.md`、`START-HERE.md`。
5. **退役旧库**：删除 4.2 的数据与脚本，更新 `package.json`、隔离检查、数据检查与相关文档。
6. **归档文档**：删除 4.3 的旧任务/交付/研究/截图，重写看板、CHANGELOG，新增 `docs/archive.md`，修复所有链接。
7. **跑检查**：`npm.cmd run knowledge:compile`、`npm.cmd run check`；`npm.cmd run check:release` 预期仍因草稿失败并记录。
8. **交付**：写 `docs/delivery-043.md`、更新看板 043 行；提交、推送、开 PR；记录 self-review 与限制。
9. **合并后**：同步 `main`，删除远端/本地已合并分支，移除 worktree，清 `.private`，`git gc`。
10. **设置复核**：确认自动删除 head branch、`main` 保护与 required check、开放 PR 保留、归档 tag 可访问、Pages 预览正常。

建议提交拆分：

```text
docs: define local agent workspaces and branch lifecycle
chore: retire the legacy JSON corpus and migration tools
docs: archive completed milestones and trim current docs
docs: record task 043 delivery and archive tag
```

## 8. 验收

- [ ] `archive-pre-hygiene-2026-11-25` 已推送，GitHub 上可浏览 `docs/delivery-039.md` 等归档文件。
- [ ] `npm.cmd run check` 通过；`check:docs` 只校验保留的 040–043。
- [ ] `npm.cmd run check:release` 仍按预期拒绝草稿，门槛未被放宽。
- [ ] 保留 Markdown 的相对链接全部可解析；旧文件引用已改为 tag 或删除。
- [ ] `data/` 只剩 `data/index/knowledge-v1.json`；旧迁移脚本与 package 命令已删除。
- [ ] 远端只保留 `main` + 开放 PR #31 的 head branch；本地只保留 `main` + 当前任务分支。
- [ ] `git worktree list` 只剩主工作区；`.private` 小于 500 MB。
- [ ] Pages 从合并后的 `main` 部署成功；站点与下载包可打开。
- [ ] 看板 043 状态为 `Delivered`，交付报告记录 revision、命令、限制与归档 tag。

## 9. 风险与回滚

| 风险 | 处理 |
| --- | --- |
| 归档 tag 推送失败 | 停止一切删除；先解决权限或网络 |
| 误删仍有独有提交的分支 | 先 `git log origin/main..branch` 检查；有独有提交就先打 `archive-branch-*` tag |
| `check:docs` 失败 | 按看板规则补齐/删除行，不放宽校验 |
| 旧 Issue/PR 中的文档链接 404 | 在 `docs/archive.md` 说明用 tag 浏览；不改写历史链接 |
| WorkBuddy worktree 被占用 | 先在 WorkBuddy 关闭会话，再 unlock/remove |
| 本地缓存删除后需要重建 | 缓存可重建；不删主工作区的 `node_modules`、源码或 `.env.local` |
| 仓库 clone 体积未明显下降 | 本次不重写历史；如要真正瘦身，另立历史重写决策 |

回滚：从 tag 恢复文件

```powershell
git checkout archive-pre-hygiene-2026-11-25 -- data/works docs/delivery-039.md
```

或 revert 清理提交；不删除 tag，不重写已推送历史。

## 10. 假设与决策

1. `main` 保留最近任务 040–043；001–039 全部归档，不在 main 保留副本。
2. 保留三个 release tag；新增一个 annotated 归档 tag，不新增长期 archive 分支。
3. 旧 JSON 与迁移脚本按“打 tag 后删除”执行；迁移结论以 delivery 039 的 0 项未解释差异为依据。
4. 保留开放 PR #31，不把它当作清理对象；其余已合并远端分支删除。
5. WorkBuddy 的应用管理 worktree 路径是唯一仓库外例外，写入 `AGENTS.md` 并在工作流文档中说明。
6. README 刷新作为独立 PR 先合并，避免与清理 PR 混在一起。
7. 分支前缀按 Agent 区分；外部贡献者仍用 `task/`。
8. 不重写 Git 历史，不删除 release tag，不修改发布门槛与知识结论。
