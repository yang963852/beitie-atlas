# 交付 038 · 两项研究与 A–D 卡复审上线报告

2026-11-24。负责人委托 Codex 审查、合并并核验 GitHub Pages。合入范围为架构研究、本体研究、执行方案和 A–D 四份交付。网站沿用内部测试预览模式；读者使用原有目录与实物链接，研究报告和试例在 GitHub 阅读。

## 合并清单

| PR 与分支 | 交付内容 | 复审结果 |
| --- | --- | --- |
| [33](https://github.com/yang963852/beitie-atlas/pull/33) · codex/architecture-guide | [中文架构导读](engineering-plan.md)，README 和成员指南入口 | 核对静态构建、领域关系、演进条件与决策记录。 |
| [34](https://github.com/yang963852/beitie-atlas/pull/34) · codex/domain-ontology-study | [本体研究](research/ontology.md)、[五件试例](research/ontology-pilot.json)和编辑流程入口 | 新样例把两跋归为同一次得卷明确标成编辑推定，保留两个年份、各自定位与空首选值。 |
| [35](https://github.com/yang963852/beitie-atlas/pull/35) · codex/research-execution-plan | [执行方案与验收条件](research-execution-plan.zh-CN.md) | A–D 完成本轮；E 网页试点与 F 扩样仍属后续决策。 |
| [36](https://github.com/yang963852/beitie-atlas/pull/36) · codex/card-a-evidence-review | [五件证据复核](research/card-a-evidence-review.zh-CN.md) | 故宫《颜勤礼碑》拓本只给民国，具体年份未知。1922 年仅可用于明确写出底石假设的内部推论。 |
| [37](https://github.com/yang963852/beitie-atlas/pull/37) · research/ontology-validation | [数据校验报告](research/ontology-validation.zh-CN.md)、研究校验器和历史固定输入 | 九件实物的审核计数为五件 reviewed、四件 draft；把张猛龙明拓册的 36 页写到原石会触发错误。 |
| [38](https://github.com/yang963852/beitie-atlas/pull/38) · codex/card-c-performance-baseline | [模拟手机基线](research/card-c-mobile-baseline.zh-CN.md)和测量脚本 | 分别在页面 load 事件和读到可读探针时保存累计量。首页三次从 295,758 字节到 341,823 字节，相差 46,065 字节。语料占包体比例留待对照构建实测。 |
| [39](https://github.com/yang963852/beitie-atlas/pull/39) · review/card-d-decision | [独立复核与负责人决策单](research/card-d-review.zh-CN.md) | 原评审对 A/B 独立；其决策单记录的是当时版本。最后一项冲突组归属说明已在 #34 补齐，旧时间字段的展示由后续试点处理。 |

## 复核口径

- 研究样例由五部作品、九件实物、十条说法组成。依据代码和原始记录复核；C 卡取数来自既有模拟测量。本次未重复实施真机性能试验，也未重新查验实物。
- Codex 对此前编写的两份研究、执行方案和本次补写的内容作自审；A/B 原提交有 D 卡独立评审。合并决定来自负责人本次明确授权。研究验收与逐件史料的正式编辑批准分别记录。
- 正式出版仍须指定语料版本、逐项编辑审核、严格构建及清单核验。地图瓦片与大陆桌面、移动网络连通性本轮未测。

## 集成版本和上线验收

研究集成版本为 `c086e00b8ffea0b6a1428b2c474f9af3cefa012f`，基线为 `c6fd7c0`。七个 PR 均已合入 main。部署的构建和发布任务均成功。[集成差异及文件清单](https://github.com/yang963852/beitie-atlas/compare/c6fd7c0...c086e00) · [Pages 部署 45345346765](https://github.com/yang963852/beitie-atlas/actions/runs/45345346765)

| 检查 | 实际结果 |
| --- | --- |
| `npm.cmd run check` | 集成版本本地通过，17 个测试文件、144 项测试通过；资料校验 0 错误、39 条警告，预览构建成功。构建工具仍提示部分脚本体积较大。 |
| `node scripts/research/check-ontology-pilot.mjs --base c6fd7c0 --self-test` | 集成版本默认读取修订后的研究样例。0 错误、0 警告，7/7 反例被检出，恢复样例后通过。研究基线参数指向样例所描述的既有生产语料版本。 |
| `npm.cmd run check:release` | 正式出版检查因 117 条草稿阻断而拒绝。生产语料在本轮源代码差异中未改动。 |
| 公开站点 | 从当前网络访问首页、入口脚本、样式均为 HTTP 200，HTML 含 preview 标记。390 像素宽的浏览器实际渲染出“内部测试第一版”；从公开深链接刷新后分别读到“颜真卿《祭侄文稿》”与“兰亭序（唐摹神龙本，传冯承素摹）”。 |
| 部署维护提示 | Actions 报告部分 Pages 动作从 Node 20 兼容运行到 Node 24；本次构建与部署均成功。 |

[在线预览](https://yang963852.github.io/beitie-atlas/) · [《祭侄文稿》实物](https://yang963852.github.io/beitie-atlas/#/object/witness-jizhi) · [《兰亭序》神龙本](https://yang963852.github.io/beitie-atlas/#/object/witness-lanting)
