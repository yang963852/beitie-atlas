---
schemaVersion: 1
titleZh: 作品题名
titleEn: English title
aliases: []
studyCategory: bei
dynastyId: tang
dynastyQualifier: null
# 日期只写有出处的部分。meaning 说明这个年份是创作、刊行还是补跋。
date:
  kind: single
  start: 779
  month: null
  end: 779
  endMonth: null
  era: null
  original: 来源原文的年代写法
  certainty: documented
  meaning: composition
  note: 来源如何给出这个年份
script: null
# 至少一条。没有署名时写 role: unknown，不要留空。
attribution:
  - role: author-and-calligrapher
    name: 姓名
    nameEn: Name
    person: person-id
    certainty: documented
    sources:
      - src-example
    note: null
    noteZh: null
sources:
  - src-example
review:
  state: draft
  note: 还缺什么证据
  noteZh: 还缺什么证据
# 可选：有出处的异说、学术意见或编辑推定。
claims: []
# 可选：作品导读。没有导读时删除整段。
# 正文写「## 导读 / ### 中文 / ### English」；七段（01 概述 … 07 研究与文献）用 #### 标题，
# 是 docs/knowledge-plan.md 第四节的编辑规范，不是 YAML 字段。
# 03 的审美评价与 05 的临习建议须由有书法实践的人审读；审读前 state: draft。
guide:
  state: draft
  timelineYear: 779
  people: []
  objects: []
  sources: []
---

# 作品题名

## 背景

### 中文

写给读者看的简短背景。每句事实都要能回到 `sources` 里的出处。

### English

The same background in English, without adding a new claim.

## 待考

### 中文

- 尚未确定的年代、别名、书体或馆藏问题。

### English

- The same open questions in English.

## 导读

### 中文

从一件实物、一个字或一次观察进入作品的读法。

### English

The same reading path in English.
