# Delivery 039 · Markdown knowledge base rebuild

**状态：实施与复核完成，负责人已授权合并及预览上线。** 初次交付基线 `c9aa45a`，实施提交 `2023e6c`，本轮集成提交 `cc536b6`、`820b77b`（分支 `codex/knowledge-rebuild-review`，[PR #41](https://github.com/yang963852/beitie-atlas/pull/41)）。下文保留初次自检，复核结论见末节。

## 范围

按 [knowledge-rebuild.md](knowledge-rebuild.md) 的 A–F 六张卡完成本地实现：

- **A 基线**：旧库清单 87 个作品入口、ADR-004、任务索引与可改范围。
- **B 编译器**：`knowledge/` Markdown 作者源、`scripts/lib/knowledge-compiler.ts` 只读编译、`data/index/knowledge-v1.json` 版本化接口、隔离与复现检查。
- **C 五部**：颜勤礼碑、祭侄文稿、兰亭序、礼器碑、张猛龙碑的实物、事件、署名/意见与差异单。
- **D 阅读**：作品页选实物并只看该件履历；书家页自动汇集关联作品与角色；主张/异说单独显示；今日参照地标与历史地点分开。
- **E 迁移**：87 个作品入口、96 件实物、36 个地点、145 条来源、70 条事件、1 条媒体；逐 ID 对照 0 项未解释差异；完整 ZIP 与中文投稿指南。
- **F 切换**：网页只读编译接口；旧 JSON 冻结为迁移基线；隔离、复现、正式门槛和数据校验均接到同一编译器。

## 实际命令与结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd run knowledge:compile` | 87 works, 96 objects, 36 places, 145 sources, 70 events, 1 media；0 errors，38 warnings；写入 `data/index/knowledge-v1.json` |
| `npm.cmd run check:data` | 0 errors，38 warnings（日期缺原文 37、未引用来源 1） |
| `npm.cmd run check:interface` | 编译接口与源稿逐字节一致 |
| `npm.cmd run check:knowledge` | 88 个生成页，0 个待刷新 |
| `npm.cmd run check:isolation` | 通过：网页只读接口，编译器不导入 UI |
| `npm.cmd run check:reproducible` | 通过：468 个源文件，两次编译输出一致，只读副本未被改写 |
| `npm.cmd run check:docs` | 通过：39 行看板，任务与交付文件均有记录 |
| `npm.cmd test` | 18 个测试文件、155 项测试通过 |
| `npm.cmd run check` | 通过；含 data、interface、catalogue、isolation、docs、155 tests、ZIP、preview build |
| `npm.cmd run check:release` | 按预期失败：127 项草稿错误，正式出版仍被阻断 |
| `npm.cmd run knowledge:inventory` | 旧库基线：85 JSON 作品 + 2 篇仅有 Markdown = 87；95 实物、69 事件、33 地点、141 来源、1 媒体 |
| `npm.cmd run knowledge:parity` | 0 项未解释差异；85 作品一致 + 2 新增，88 实物一致 + 7 已知编辑 + 1 新增 |
| `npm.cmd run knowledge:package` | 473 个文件、482.0 KiB；工作区有未提交源稿时 `sourceRevision` 记为未记录，CI 构建记录 `GITHUB_SHA`；ZIP 可解压，含 `开始阅读.md`、`manifest.json`、`knowledge/`、`LICENSE`、`NOTICE.md` |

## 浏览器验收

构建预览 `vite preview`（无 Tianditu 密钥）：

- `#/work/yan-qinli-bei`：原石与民国拓本可切换；原石显示 1922 年出土、立于前院、1928 年迁新城、1948 年入碑林；民国拓本无 1922 年事件。Tab 可到两个实物按钮，可见焦点环，Enter 可切换。
- `#/object/witness-jizhi`：1282 与 1283 并列，各有独立来源；编辑推定 claim 明示“归为同一次得卷是编辑推定，交接地点未详”。
- `#/object/witness-lanting`：版本“神龙本”、冯承素（传）争议署名、支持与质疑两条 claim 均可见。
- `#/object/stele-liqi`：翁方纲“七人书写”标为学术意见，并注明不据此生成七名确定书家；`liqi-ming-44512` 不再继承这条意见，其“拓自原石”关系待证。
- `#/object/rubbing-zhang-menglong-bei`：“三十六页”标为来源记载，并注明只属于此明拓册。
- `#/person/yan-zhenqing`：“关联作品与角色”列出 6 部作品，颜勤礼碑角色为“撰文并书丹”，链接回到 `#/work/yan-qinli-bei`。
- `#/work/shen-yinmo-dakai-jia`：1962 年标为“刊行”，无编造实物。
- `#/work/zhao-puchu-shen-colophon`：1976 年标为“题跋”，并列上海博物馆赵跋实物。
- `#/collections`：无密钥时显示“底图未能加载……”与“经纬度点位示意 · 无底图”，31 个地点仍可读。

截图：[390](screenshots/039-390.png) · [768](screenshots/039-768.png) · [1440](screenshots/039-1440.png) · [200% 缩放等效](screenshots/039-zoom.png)。

## 初次交付时未完成或未验证

- **未提交、未推送、未开 PR、未部署 Pages。** ZIP 中的 `sourceRevision` 仍是基线 `c9aa45a`；提交后重新生成才会指向新提交。
- **五部精修尚未经独立编辑复核。** 本报告和测试均为实施者自检；P1 级史实问题应由独立编辑按 [atlas-workflow.md](atlas-workflow.md) 复核。
- **1440/768 截图由无头 Edge 按窗口宽度生成；200% 用 720 CSS px + 2× 设备像素比等效模拟。** 未在真实 200% 浏览器缩放下逐项操作。
- **无 Tianditu 浏览器密钥。** 未验证真实底图加载；只验证了无密钥回退。
- **未验证中国大陆公共网络可达性。** 本地预览不等于公开主机验证。
- **38 条警告仍在**：37 条日期缺来源原文、1 条未引用来源 `src-beilin-xiao-beilin`。迁移未擅自改写。
- **正式门槛仍拒绝出版**：127 项草稿错误 = 旧库 117 + 两篇现代作品基础档 2 + 赵跋实物 1 + 四位新人物页 4 + 本次更订转待审的三件实物 3。草稿阻断能力保留。
- 旧 JSON、`data/knowledge-relations.json` 与 `data/yan-qinli-journey.json` 仍留在仓库，作为迁移基线；网页不再读取。删除或移动到归档目录须由负责人决定。

## 回退

切换集中在 `src/domain/data.ts`、`src/domain/knowledge.ts`、`scripts/lib/release-gate.ts`、`scripts/knowledge-*.ts` 和 `data/index/`。回退时恢复旧读取提交即可；`knowledge/` 源稿和五部编辑成果可保留，旧 JSON 未被改写。

## 初次交付时的审查请求

实施者自检通过。请负责人指定独立编辑复核五部案例，并决定合并、提交与预览部署。P1 阻断合并；P2 在指定迭代内修复；P3 可选。

## 复核与集成

负责人委托 Codex 在分支 `codex/knowledge-rebuild-review` 审核、修正 Trae 的交付，Trae 完成本轮集成与全量复检；负责人授权合并与预览上线。编辑复核对照五部作品的馆藏著录与题跋定位，具体更订见[编辑差异](baseline/editorial-differences-2026-11-24.md)。礼器原石承载翁方纲关于书者的意见，张猛龙明拓册承载三十六页的记录，两册不再声称拓自某件具体底石。三件有实质修订的实物转回待审，旧批准保留在基线记录中。未查验实物，馆方部分网页通过官方索引核对。

技术复核恢复迁移中遗失的人物、读帖笔记关联和出处，区分编译漂移、证据缺失及地图坐标缺失，修订读者页面中的归名、现藏和审核状态；主张必须有出处与定位，地点坐标必须成对，ZIP 在有未提交源稿时不标注提交号。复核发现的 P1 问题为礼器意见归属与两件拓本的无证底石关系，均已在合并前修正；无遗留 P2。P3 为 38 条数据警告、真实底图密钥和真实 200% 缩放未验证。

上述复核由另一实施代理完成并修订，属于实施方工具复核而非外部独立编辑验收；合并决定由负责人作出。必需 CI、合并提交及 Pages 工作流见 PR #41。当前仅交付标注草稿的预览；本轮正式门槛实查为 127 项草稿阻断、38 条警告。