# 053 · 补 10 部核心作品导读

这是 [知识库下一阶段建构方案](../docs/knowledge-buildout.md) 的 Batch 1。完整路线、后续批次与指标见该方案。

状态：Queued
执行：WorkBuddy
合并：项目负责人
基线：`origin/main` @ `784efd6`（2026-11-26；开始前再同步一次）
范围：`knowledge/works/` 下 10 个作品 Markdown 的 `guide` 字段与 `## 导读` 正文；生成目录随编译更新。

## 目标

给 10 部已有较全出处的核心作品补上读者可直接使用的导读。每篇导读要让读者：

1. 知道这是什么作品、谁在何时为何而作，今天看到的是原石、拓本还是摹本；
2. 知道在本站先点哪件实物、再看哪条来源；
3. 知道哪些年代、作者、版本问题仍未定，不把待考写成定论。

不新增作品、实物、人物或来源；不写没有出处的审美评价和临习处方。

## 为什么是这 10 部

这 10 部覆盖先秦到元、篆隶行楷，且现有条目已有 2 条以上来源或较完整的背景与待考，能在不编新事实的前提下写出可用导读。

| # | 作品 | 文件 | 时代 / 书体 | 现有来源 | 实物 |
| --- | --- | --- | --- | --- | --- |
| 1 | 石鼓文 | `knowledge/works/stone-drum-inscriptions.md` | 先秦 / 大篆 | 2 | 原石十件、故宫明拓册 |
| 2 | 曹全碑 | `knowledge/works/cao-quan-bei.md` | 东汉 / 隶书 | 3 | 原石 |
| 3 | 张迁碑 | `knowledge/works/zhangqian-bei.md` | 东汉 / 隶书 | 2 | 原石 |
| 4 | 石门颂 | `knowledge/works/shimen-song.md` | 东汉 / 隶书 | 2 | 摩崖 |
| 5 | 爨宝子碑 | `knowledge/works/cuan-baozi-bei.md` | 东晋 / 隶楷之间 | 3 | 原石 |
| 6 | 兰亭序 | `knowledge/works/lanting.md` | 东晋 / 行书 | 2 | 神龙本、定武本 |
| 7 | 万岁通天帖 | `knowledge/works/wansui-tongtian-tie.md` | 唐 / 摹本 | 3 | 唐摹卷 |
| 8 | 虞恭公碑 | `knowledge/works/yugong-gong-bei.md` | 唐 / 楷书 | 3 | 原石、南宋拓本 |
| 9 | 玄秘塔碑 | `knowledge/works/xuanmi-ta-bei.md` | 唐 / 楷书 | 2 | 原石、明初拓册 |
| 10 | 三门记 | `knowledge/works/sanmen-ji.md` | 元 / 楷书 | 2 | 纸本稿 |

暂不列入这一批：九成宫醴泉铭、祭侄文稿、书谱、黄州寒食诗帖、集王圣教序。它们目前各只有 1 条来源或背景过短，先补来源再写导读，避免把常识写成“有出处”。

## 统一格式

### 1. YAML

在作品 Markdown 的 YAML 末尾加 `guide`，结构照现有《颜勤礼碑》《多宝塔感应碑》：

```yaml
guide:
  state: reviewed
  people: []
  objects: []
  sources: []
```

- `people`：正文实际链接到的 `knowledge/people/` id；没有就空数组。
- `objects`：正文实际链接到的实物 id；没有就空数组。
- `sources`：正文实际用到的来源 id，必须已存在于 `knowledge/sources/`。
- `state` 写 `reviewed`：本任务只写有出处的事实与阅读路径，自审后由负责人合并。若加入审美评价或临习建议，必须改为 `draft` 并停手，等专业审读。
- 不要加 `timelineYear` 等新字段；现有导读没有用到的字段不增。

### 2. 正文

在 `## 待考` 之后加：

```markdown
## 导读

### 中文

第一段……

第二段……

第三段……

### English

Paragraph one…

Paragraph two…

Paragraph three…
```

- 中文原稿，英文是同一内容的翻译，不增事实，不机翻占位。
- 每篇 3–5 段，每段 2–4 句；比现有《颜勤礼碑》导读稍长即可，不写成长论文。
- 每段至少一个可点来源；用现有 `sourceRefs` 的 URL。
- 站内链接用相对路径：
  - 人物：`../people/wang-xizhi.md`
  - 实物：`../catalogue/<work-id>.md#<object-id>`
  - 笔记：`../notes/<note>.md`
- 不写“最”“第一”“必学”“几天见效”等无出处的判断；古人评语必须署名并给出篇名或出处；没有就不写。
- 不描述未见图版的具体点画、字位、行数；需要图版时写“待补图版”，不要猜。

### 3. 样例（曹全碑，只示范语气与长度）

```markdown
## 导读

### 中文

《曹全碑》是东汉中平年间为曹全所立的碑，今藏西安碑林。碑上留下受颂者的姓名，却没有留下撰文者与书丹者的姓名；这一点先看作品条目里的署名栏。[西安碑林博物馆条目](https://beilin-museum.com/index.php?m=home&c=View&a=index&aid=145)

读这件作品，先分清原石与拓本。本站记录的是[曹全碑原石](../catalogue/cao-quan-bei.md#stele-cao-quan)，故宫另有明初拓本的著录。原石与拓本各有自己的制作年代与收藏，不能把纸上的墨色当成石面的特征。[故宫明初拓本条目](https://www.dpm.org.cn/collection/impres/228534.html)

年代有一个小分歧：西安碑林现行条目与故宫条目都作 185 年，碑林另一条目作 186 年。作品条目把两说并列，不替读者选一个。读到这里，可以先记住这个差异，再看碑阴所列的捐资立碑者。

### English

The Stele of Cao Quan was erected for Cao Quan in the Eastern Han and is now held at the Xi’an Beilin Museum. The stone preserves the name of the man it honors, but names neither the author of its text nor its calligrapher; the attribution field records that absence. [Xi’an Beilin Museum entry](https://beilin-museum.com/index.php?m=home&c=View&a=index&aid=145)

Read the stone and the rubbing as two separate things. This site records [the original stone](../catalogue/cao-quan-bei.md#stele-cao-quan); the Palace Museum catalogues a Ming rubbing separately. Each has its own production date and holding, and ink on paper cannot be treated as a feature of the stone surface. [Palace Museum rubbing entry](https://www.dpm.org.cn/collection/impres/228534.html)

The date has a small disagreement: the current Beilin entry and the Palace Museum entry both give 185, while another Beilin entry gives 186. The work record keeps both readings rather than choosing one. With that difference in mind, look next at the donors listed on the reverse.
```

## 每篇的可用事实与边界

只可使用各作品 Markdown 现有 `background`、`待考`、`attribution` 与来源条目里的事实。下面列出可写角度和不能越过的线。

### 1. 石鼓文

- 文件：`knowledge/works/stone-drum-inscriptions.md`
- 来源：
  - `src-dpm-stone-drums` https://www.dpm.org.cn/collection/impres/234438.html
  - `src-dpm-stone-drums-ming` https://www.dpm.org.cn/collection/impres/228598.html
- 实物：`stone-drums-original-set`、`dpm-rubbing-shigu-xin00045770`
- 人物：无
- 写什么：十件鼓形石、篆书诗篇、出行与田猎内容；故宫著录为秦国遗物但确切年代有争议；原石十件与明拓册是两件不同的实物，读的时候先分清石与纸。
- 不要写：指定某个王或具体年份；称“最早的石刻”而无出处；描述未见图版的点画与石面损泐。
- 建议链接：`../catalogue/stone-drum-inscriptions.md#stone-drums-original-set`、`../catalogue/stone-drum-inscriptions.md#dpm-rubbing-shigu-xin00045770`。

### 2. 曹全碑

- 文件：`knowledge/works/cao-quan-bei.md`
- 来源：
  - `src-beilin-caoquan` https://beilin-museum.com/index.php?m=home&c=View&a=index&aid=145
  - `src-beilin-caoquan-alternate` https://www.beilin-museum.com/index.php?a=index&aid=2996&c=View&lang=en&m=home
  - `src-dpm-caoquan` https://www.dpm.org.cn/collection/impres/228534.html
- 实物：`stele-cao-quan`
- 人物：无
- 写什么：东汉为曹全立碑；碑上无撰文者与书丹者；185/186 两说并列；碑阴列捐资立碑的属吏王敞、王毕等。原石与故宫明初拓本分开读。
- 不要写：给碑指定书丹人；替读者选 185 或 186；用“秀逸”“秀丽”等评语而不给出处。
- 建议链接：`../catalogue/cao-quan-bei.md#stele-cao-quan`。

### 3. 张迁碑

- 文件：`knowledge/works/zhangqian-bei.md`
- 来源：
  - `src-ltfc-zhuyunge` https://g2.ltfc.net/work/SUFA/67d64a1899a6320270c19860
  - `src-taian-zhangqian-holding` https://tsgw.taian.gov.cn/art/2025/5/19/art_48253_10316874.html
- 实物：`stele-zhangqian`
- 人物：无
- 写什么：东汉中平三年（186）为县令张迁立碑；碑文未署撰文者与书丹者；碑文记“賃師孫興，刊石立表”，即刻工孙兴；故吏韦萌等立石，碑阴列捐资题名四十一人；泰安市博物馆活动记录将原石列于馆藏。
- 不要写：把书丹归给某位名家；称原石在西安碑林；描述未见图版的刀口与字口。
- 建议链接：`../catalogue/zhangqian-bei.md#stele-zhangqian`。

### 4. 石门颂

- 文件：`knowledge/works/shimen-song.md`
- 来源：
  - `src-cssn-shaanxi-beike` https://cssn.cn/skgz/bwyc/202403/t20240301_5736431.shtml
  - `src-hantai-shimen-thirteen` https://www.htq.gov.cn/hzshtqzf/zjht/lswh/201707/312e445fc8eb26fd26e26ed8d7f0edf8.shtml
- 实物：`cliff-shimen-song`
- 人物：无（王升只有姓名文本，没有人物页）
- 写什么：东汉建和二年（148），汉中太守王升撰颂，表彰杨孟文开通石门；刻辞原在崖壁，后连石凿取，移藏汉中市博物馆；“石门十三品”的背景。
- 不要写：说摩崖仍在原址；补道路走向、开凿工法而无出处；用“雄放”等评语而不给出处。
- 建议链接：`../catalogue/shimen-song.md#cliff-shimen-song`。

### 5. 爨宝子碑

- 文件：`knowledge/works/cuan-baozi-bei.md`
- 来源：
  - `src-yn-dct-cuan` https://dct.yn.gov.cn/zfxxgk/fdzdgknr/qtgk/zxtablqk/202404/t20240410_2381763.html
  - `src-qjgov-cuan-museum` https://www.qj.gov.cn/html/2020/csmp_0417/83745.html
  - `src-ynkg-cuanbaozi` https://www.ynkgs.cn/view/ynkgPC/1/248/view/1514.html
- 实物：`stele-cuan-baozi`
- 人物：无
- 写什么：碑自署“大亨四年”，省文旅厅与曲靖市政府读作 405 年，省文物考古研究所页面作 404 年；1778 年出土、1852 年重新出土、移入武侯祠、1937 年移入曲靖中学碑亭；1961 年列首批全国重点文物保护单位；书体为隶书向楷书过渡；公布宽度有 0.68 米与 0.86 米两说。
- 不要写：替读者选 404 或 405；补撰书人姓名；用“方整古拙”等评语而不说明是来源用语；把宽度两说合成一个数。
- 建议链接：`../catalogue/cuan-baozi-bei.md#stele-cuan-baozi`。

### 6. 兰亭序

- 文件：`knowledge/works/lanting.md`
- 来源：
  - `src-catalogue-lanting` https://www.dpm.org.cn/collection/handwriting/228279.html
  - `src-dpm-233468` https://www.dpm.org.cn/collection/impres/233468.html
- 实物：`witness-lanting`（神龙本）、`dingwu-zhan`（定武本）
- 人物：`wang-xizhi`、`feng-chengsu`（神龙本传冯承素摹，人物页存在）
- 写什么：永和九年（353）王羲之写序；原迹不存，今天看的是唐摹神龙本与定武刻拓两条传本；神龙本“传冯承素摹”，不要把“传”字去掉；两件实物各有自己的制作与收藏。
- 不要写：说原迹存世；把神龙本直接定为冯承素真迹；用“天下第一行书”而不给出处；描述未见图版的笔势细节。
- 建议链接：`../people/wang-xizhi.md`、`../people/feng-chengsu.md`、`../catalogue/lanting.md#witness-lanting`、`../catalogue/lanting.md#dingwu-zhan`。

### 7. 万岁通天帖

- 文件：`knowledge/works/wansui-tongtian-tie.md`
- 来源：
  - `src-gmw-wansui` https://museum.gmw.cn/2017-12/15/content_27109986_6.htm
  - `src-chinanews-wansui` https://www.chinanews.com/cul/2018/02-13/8448541.shtml
  - `src-lnm-wansui` https://www.lnmuseum.com.cn/
- 实物：`wansui-tongtian-scroll`
- 人物：`wang-xizhi`、`wang-xianzhi`
- 写什么：万岁通天二年（697），王方庆进献其先祖王羲之、王献之等一门二十八人法书十卷；弘文馆以勾填法摹写留内府；今仅存此一卷，收七人书翰十通；历经明无锡真赏斋火、清乾隆间乾清宫火两次火劫；1922 年由溥仪携往长春，今藏辽宁省博物馆；卷上无摹手署款。
- 不要写：称其为王氏原迹；给两次火劫补年份或损伤评估；把二十八人全部列出；称摹手姓名。
- 建议链接：`../people/wang-xizhi.md`、`../people/wang-xianzhi.md`、`../catalogue/wansui-tongtian-tie.md#wansui-tongtian-scroll`。

### 8. 虞恭公碑

- 文件：`knowledge/works/yugong-gong-bei.md`
- 来源：
  - `src-dpm-yugong-song` https://www.dpm.org.cn/collection/impres/228414.html
  - `src-dpm-yugong-nansong` https://www.dpm.org.cn/collection/impres/234129.html
  - `src-nlc-shike-xulu-19` https://www.nlc.cn/upload/attachments/2026-02-14/40e09fcb.pdf
- 实物：`stele-yugong`、`rubbing-yugong-nansong`
- 人物：无（欧阳询没有人物页，不要硬加 `guide.people`）
- 写什么：温彦博墓碑，贞观十一年（637）十月立于醴泉昭陵；正书三十六行、行七十七字，篆额四行十六字；碑之下半入宋已断裂，故无全文拓本；传世最旧之本仅存八百余字，全文约二千八百余字；原石与故宫藏南宋拓本分列两件实物。
- 不要写：说原石完整存世；把“约二千八百余字”当成某件拓本的实际存字；把欧阳询的“晚年风格”写成事实而没有出处。
- 建议链接：`../catalogue/yugong-gong-bei.md#stele-yugong`、`../catalogue/yugong-gong-bei.md#rubbing-yugong-nansong`。

### 9. 玄秘塔碑

- 文件：`knowledge/works/xuanmi-ta-bei.md`
- 来源：
  - `src-beilin-xuanmita` https://beilin-museum.com/index.php?m=home&c=View&a=index&aid=148
  - `src-dpm-259370` https://www.dpm.org.cn/collection/impres/259370.html
- 实物：`stele-xuanmi-ta`、`dpm-xuanmi-ta-bei-026`
- 人物：无（柳公权没有人物页）
- 写什么：唐会昌元年（841）立碑；裴休撰文，柳公权书丹并篆额；邵建和、邵建初兄弟刻石；西安碑林藏原石，故宫另藏明初拓册；石与纸各有来历。
- 不要写：把裴休写成书丹者；把原石与拓本混为一件；用“柳体”“骨力”等评语而不给出处。
- 建议链接：`../catalogue/xuanmi-ta-bei.md#stele-xuanmi-ta`、`../catalogue/xuanmi-ta-bei.md#dpm-xuanmi-ta-bei-026`。

### 10. 三门记

- 文件：`knowledge/works/sanmen-ji.md`
- 来源：
  - `src-tnm-sanmen` https://www.tnm.jp/modules/r_collection/index.php?controller=dtl&colid=TB1461
  - `src-colbase-sanmen` https://colbase.nich.go.jp/collection_items/tnm/TB-1461?locale=zh
- 实物：`sanmen-scroll`
- 人物：无（赵孟頫没有人物页）
- 写什么：苏州玄妙观重修三门的碑文；记文为牟巘所撰，赵孟頫誊写并篆额；此卷是纸本原稿，不是碑石；馆方未记书写年份，国家数据库据碑文与赵氏官职推断为四十九至五十六岁，本记录不换算为公元年；馆方称其运笔以唐李邕为法。
- 不要写：说碑石存世或给出碑石位置；给精确书写年份；把四十九至五十六岁写成确定年龄；补尺寸；“以李邕为法”只能作为馆方说法引用。
- 建议链接：`../catalogue/sanmen-ji.md#sanmen-scroll`。

## 工作方式

1. 在 `.private/worktrees/workbuddy` 的 `workbuddy/work` 上工作；开始前 `git fetch origin --prune`，`git merge origin/main`。
2. 一次只改这 10 个作品文件，不顺手改其他记录。新建或改动前先读该文件全文与它引用的 `knowledge/sources/` 条目。
3. 每写完一篇，先自查：
   - 每个事实句能否在现有 `background`、`待考`、`attribution` 或所引来源中找到？
   - `guide.people`、`guide.objects`、`guide.sources` 是否与正文实际链接一致？
   - 中文与英文是否一一对应，英文有没有新增事实？
   - 有没有无出处的“最”“第一”“必学”“几天见效”？
4. 全部写完后运行：

```powershell
npm.cmd run knowledge:compile
npm.cmd run knowledge:generate
npm.cmd run check
npm.cmd run check:release
```

5. 提交生成目录的 diff（`knowledge/catalogue/`、`knowledge/README.md`）与 10 个源文件；不要手改 `data/index/knowledge-v1.json`。
6. 开 PR 到 `main`，标题用 `feat: add ten core work guides`，正文列出 10 个文件、每篇用到的来源、仍然留空的问题。自审即可，负责人合并。

## 验收

- 10 个作品文件都有 `guide` 字段和 `## 导读` 中英正文。
- `npm run check` 通过；`npm run check:release` 通过，没有新增 draft。
- 生成目录出现 10 篇新导读，`npm run check:knowledge` 不报 drift。
- 每篇至少 3 段中文、3 段英文，每段至少一个来源链接。
- 没有新增作品、实物、人物、来源；没有改 `src/`、`scripts/`、`data/index/`。
- 没有无出处的审美评价、临习处方、年代、尺寸或坐标。

## 如果卡住

- 来源页打不开：用作品条目已有的事实和来源 URL，不补新事实；在 PR 里注明“页面未能打开，未新增断言”。
- 某个事实只有常识、没有来源：不写。留给后续补来源的任务。
- 想写“某某风格”“某某笔法”：先找古人评语或馆方原文；找不到就删掉，改成可核的观察或阅读路径。
- 不确定 `guide` 字段：照 `knowledge/works/yan-qinli-bei.md` 的现有写法，不发明新字段。
