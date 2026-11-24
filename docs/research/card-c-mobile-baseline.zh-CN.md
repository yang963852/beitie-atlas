# 手机阅读基线（C 卡交付）

**2026-11-24 · 测量人：本次实施 Agent · 只读测量，未改 `data/`、`src/`**

固定版本：项目 `main` = `c6fd7c0`（`origin/main`）。PR #33 `5ba0b51`、#34 `a5e56b1` 当时均 OPEN，与本卡无关。构建产物 `dist/` 为本地 `npm run build` 结果，未提交。

一句话结论：**读一页正文只要 290 kB、模拟手机 0.8 秒可读**；时间轴为一条装饰性的"墨河"多付 177 kB；首页首屏约 334 kB 就能读，但默认会再下 704 kB，其中最大的一件不是 three（177 kB），而是《兰亭》帖影一张图（383 kB）。各条路径共同的首屏成本，是一个 **277 kB 的入口包**；语料在其中占多少，本次没有从构建产物中分离测量，不能由单文件 gzip 求和代替。

---

## 一、条件与方法

| 项 | 取值 |
| --- | --- |
| 构建 | `c6fd7c0`，`npm run build`（Vite 7.3.8），本机 `localhost:4173` 静态服务，文本资源 gzip，`Cache-Control: no-store` |
| 浏览器 | Chrome 157.0.8103.79，`--headless=new`，SwiftShader 软渲染（无 GPU） |
| 手机模拟 | 390×844，DPR 2，`mobile:true`，**CPU 4× 节流**（近似中端手机，非真机） |
| 桌面参照 | 1440×900，DPR 1，CPU 1× |
| 缓存 | 每次运行新建标签页，`Network.setCacheDisabled(true)`；不做 HTTP 缓存复用 |
| 网络 | 本机回环、无限速、无 RTT；另以 DevTools "Fast 3G"（150 ms RTT、1.6 Mbps）模拟一次 |
| 次数 | 每格 3 次冷启动，取中位数；原始值见 `.private/tmp/card-c/*.json`（未提交） |
| 地图键 | 有键版本（`.env.local`）与无键版本（`VITE_TIANDITU_KEY=""`）各构建一次 |

**"首次可读正文"怎么判**：在文档开始执行前注入 rAF 轮询，目标元素出现、盒子宽高大于 0、且（文本类目标）文字非空即记 `performance.now()`。各路径的目标分别是：

- 首页：`#opening-title a`（海报上的入口）
- 时间轴：第一条 `.atlas-card`
- 直达详情：`#detail-title`
- 搜索：`.results__list`；交互终点是 `.results__count` 从"95 / 95 条"变为"2 / 95 条"
- 馆藏地图：`.map--live` 或 `.map--fallback` 出现（面板挂载，不等瓦片）

这是**页面已布局、内容已在 DOM 里**的时刻，早于实际绘制，故 FCP/LCP 另列。地图页会出现"可读 0.4 s、FCP 0.98 s"的顺序，原因即此。

**传输量**：取 CDP `Network.loadingFinished.encodedDataLength` 求和，含响应头；跨域资源（天地图瓦片）没有 `Timing-Allow-Origin`，页面侧 `transferSize` 一律为 0，故页面侧数字只用于同源核对。"首屏"指**探针读到目标可读的那一刻**立即采样的累计传输量；脚本另记 `load` 时的累计量作对照，两者不混用。

**采样时点复测（2026-11-24）**：修订后的脚本把采样点从 `load` 之后移到探针读到可读的当次循环。用同一构建重跑五条路径（原始值见 `.private/tmp/card-c/baseline-recheck.json`）后，五条路径的 `transferAtReadable` 与 `transferAtLoad` 相同——这些运行中 `load` 早于目标可读，因此旧表的字节值碰巧等于可读累计，但旧实现的采样时点仍在 `load` 之后，标签与代码不符。现实现已改正；原表首屏列无需改数。复测的时间值不替换原基线，原三次记录仍是本报告的时间证据。

---

## 二、构建体积：估算与实测

| 文件 | 原始 | 构建报告 gzip | 实测传输 |
| --- | --- | --- | --- |
| `index-*.js`（入口，含全部视图与语料） | 912.55 kB | 283.43 kB | **277 kB** |
| `index-*.css` | 47.05 kB | 10.97 kB | 11 kB |
| `three.module-*.js`（按需） | 704.74 kB | 181.09 kB | 177 kB |
| `classroom-scene-*.js`（按需） | 15.67 kB | 7.06 kB | 7 kB |
| `index.html` | 0.92 kB | 0.65 kB | — |
| `shenlong-opening.webp` | 391.95 kB | — | 383 kB |
| `wood-grain.webp` | 130.59 kB | — | 128 kB |
| `classroom-desk.webp` | 208.24 kB | — | 本次未请求 |
| `classroom-portrait.webp` | 45.89 kB | — | 45 kB |
| `wood-normal.webp` | 8.65 kB | — | 9 kB |

构建报告的 gzip 估算偏保守约 2%（283 对 277），原因是服务端用 gzip level 6、且估算含 map 之外的全部输出；做预算时可直接用这个数，另加每个请求约 0.2–0.5 kB 的响应头。

**语料体积的三种口径，不能互相替代**：`data/` 下 185 个 JSON 共 490 kB 原始；按单文件 gzip 求和约 233 kB；把同一批文件拼接后一次 gzip 约 111 kB。入口包的 277 kB 是 Vite 构建后单个 JS 文件的传输量，语料模块在其中的真实占比没有从构建产物中分离测量。因此本报告不推算"语料占入口包 84%"或"应用代码与视图约 44 kB"；这两个数字已撤回。若要判断分包收益，须用同一构建配置做只拆出语料的单变量对照构建，而不是用上述任一压缩口径反推。

---

## 三、五条路径的实测（手机模拟，无限速，冷缓存）

| 路径 | 可读 | FCP | LCP | DCL | 首屏 | 总计 | 请求 | 长任务合计 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 首页 `/`（海报） | **447 ms** | 464 | 464 | 287 | **334 kB** | **1038 kB** | 9 | 6870 ms |
| 时间轴 `#catalogue` | **797 ms** | 880 | 880 | 285 | 289 kB | 467 kB | 4 | 830 ms |
| 直达详情 `#/object/witness-jizhi` | **795 ms** | 880 | 880 | 255 | 289 kB | **290 kB** | 3 | 713 ms |
| 搜索实物 `#/catalogue`（记录页） | **993 ms** | 1020 | 1020 | 283 | 289 kB | 290 kB | 3 | 1005 ms |
| 馆藏地图 `#/collections` | **408 ms**（面板） | 976 | 6152 | 287 | 289 kB | 345 kB | 20 | 1101 ms |

补充读数：

- **搜索交互**：输入"兰亭"到计数变为"2 / 95 条"用了 **38 ms**（三次 36/38/39），无网络请求。
- **首页两段成本**：海报可读 447 ms 时只下了 334 kB；此后到场景就绪（`.desk[data-scene="desk"]`）另有 **704 kB**，中位 **6394 ms**（软渲染，见限制）。点击入口到时间轴首卡出现 **4786 ms**。
- **地图**：面板 408 ms 可读，但 LCP 中位 **6152 ms**（三次 976 / 6152 / 7304）。应用提示"底图未能加载，通常是密钥或域名白名单限制"，点位与列表仍可用。瓦片 12 张（9 张图像完成加载）、供应商脚本 46 kB（含在 345 kB 内）。

---

## 四、条件对照

| 条件 | 路径 | 可读 | 总计 | 说明 |
| --- | --- | --- | --- | --- |
| 默认 | 首页 | 447 ms | 1038 kB | three + 教室图 + 帖影全下 |
| 阻断 `three.module` | 首页 | 655 ms | **379 kB** | 场景停在 poster；进入时间轴 3496 ms（默认 4786） |
| `prefers-reduced-motion: reduce` | 首页 | 390 ms | **335 kB** | 不加载 three、不播幕布；进入时间轴 **388 ms** |
| 默认 | 时间轴 | 797 ms | 467 kB | 墨河拉 three |
| 阻断 `three.module` | 时间轴 | 843 ms | **290 kB** | 可读时间在噪声内（三次 778–934 ms），功能正常 |
| Fast 3G | 直达详情 | **2479 ms** | 290 kB | DCL 1929 ms；可读由 0.8 s 推到 2.5 s |
| 桌面 1440 | 直达详情 | 300 ms | 345 kB | 桌面版式同时挂载地图面板，多 55 kB（供应商脚本 + 瓦片） |
| 有键（域名受限） | 馆藏地图 | 408 ms | 345 kB | `.map--live`，底图失败，点位可用 |
| **无键** | 馆藏地图 | 428 ms | **290 kB** | `.map--fallback`，不发供应商请求 |

三处可以直接引用的差额：

1. **three 的成本**：首页 659 kB（1038→379）、时间轴 177 kB（467→290）。前者还带来约 1.3 s 的进入延迟与 6.3 s 的长任务差额（软渲染下放大，见限制）。
2. **开场动画的成本**：动效全开时点击到时间轴 4786 ms；折掉 three 3496 ms；再折掉幕布（reduce）388 ms。也就是约 **2.84 s 是幕布本身**（`.desk__veil` 的 `animation: desk-veil .49s 2.35s`，即 2.35 s 延迟加 0.49 s 动画），另有约 **1.3 s** 来自 3D 占住主线程。
3. **地图供应商的成本**：有键比无键多 55 kB、17 个额外请求，而底图仍可能因白名单失败。

---

## 五、结论

1. **阅读正文的基线很轻**：290 kB、模拟手机 0.8 s、Fast 3G 2.5 s。四条路径中只有它是"一次请求就够"。
2. **时间轴的 177 kB 是装饰**：墨河不承载信息；阻断后页面功能与可读时间都没变。它占该页传输量 38%。
3. **首页的增量不在 three**：704 kB 增量里，帖影 383 kB、木纹 128 kB、小木纹 9 kB 共 520 kB 是图，three 177 kB，教室组件 7 kB。若要减首页，先压图再看引擎。
4. **地图的失败态代价**：底图失败时 LCP 从 1.0 s 推到 6–7 s，虽然点位可用。失败提示文案本身是清楚的。
5. **入口包是所有路径的共同首付**：277 kB；语料在其中的占比本次未测，不能把单文件 gzip 求和当作包内占比。

### 一项最值得继续测的瓶颈

**入口包 277 kB（语料占比未测）**。它在四条阅读路径上都要先付，Fast 3G 的 2.5 s 可读主要由它决定；首页 1038 kB 里它也占 27%。下一次值得测的不是"要不要拆"，而是**在同一构建配置下只拆出语料，做单变量对照构建**，看四条路径的首屏传输与 Fast 3G 可读时间各降多少——这是可测的量，拆不拆、怎么拆按卡片另行决策。

---

## 六、限制

- **没有真机**。390×844、DPR 2、CPU 4× 是模拟；没有触摸滚动、真实内存压力与省电降频。3D 相关数字尤其不可当手机实测：headless 用 SwiftShader 软渲染，场景就绪 6.4 s、长任务 6.9 s 是上限，不代表真机。
- **本机回环没有网络成本**。除 Fast 3G 一节外，传输量可信、时间不可外推到 4G/5G；Fast 3G 也只加固定 RTT 与带宽，没有丢包、TLS 握手抖动与运营商差异。
- **大陆公网可达性未测**，留空。地图在本机可发出请求，不等于目标读者可加载底图；本机还遇到底图被拒（应用提示白名单），无法判断线上是否同样。
- **3 次样本**。除地图 LCP（976–7304 ms）外，各格波动在 ±10% 内；地图 LCP 的中位数不宜单独引用，应看区间。
- **语料占比未测**：233 kB 是 `data/` 各文件单独 gzip 求和，111 kB 是同批文件拼接后一次 gzip；两者都不是入口包内语料模块的大小，不能据此推算 84% 或 44 kB。要得到包内占比，需另做单变量对照构建或构建产物分析。
- 未测：知识库路由、专题流传页、离线/弱网重试、真实设备的内存与掉帧、CDN 与 HTTP/2 多路复用。
- 天地图 `tk` 会被打进前端 bundle（公开信息）；原始 JSON 里的瓦片 URL 含该参数，本报告不转载。

---

## 七、复现

```bash
# 1. 构建（本机 esbuild 临时目录权限异常，需把 TEMP 指到项目内）
TEMP="$PWD/.private/tmp/esbuild-tmp" TMP="$TEMP" TMPDIR="$TEMP" npm run build

# 2. 四条路径 × 3 次（脚本自起静态服务与 Chrome，无新增依赖；Node ≥ 22）
node scripts/perf/measure.mjs --tag baseline --runs 3

# 3. 对照条件
node scripts/perf/measure.mjs --tag no-three --runs 3 --paths home,timeline --block-three
node scripts/perf/measure.mjs --tag reduced  --runs 3 --paths home --reduced --block-three
node scripts/perf/measure.mjs --tag fast3g   --runs 3 --paths object --throttle fast3g
node scripts/perf/measure.mjs --tag desktop  --runs 3 --paths object --desktop

# 4. 无地图键：以空值重建后只测地图
VITE_TIANDITU_KEY="" npm run build
node scripts/perf/measure.mjs --tag nokey --runs 3 --paths map
```

结果写在 `.private/tmp/card-c/<tag>.json`（`.private/` 已忽略）。脚本默认端口 4173（静态服务）与 9333（DevTools），可用 `--port`、`--cdp-port` 改；`CHROME_PATH` 可指定浏览器。
