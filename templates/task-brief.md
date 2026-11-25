# Bounded task brief

Use this in a coordinated Issue. A small PR may state the applicable items in its description.

| Field | Assignment |
| --- | --- |
| Outcome | Give the result a reader or contributor can observe. |
| Track and people | Knowledge or web, lead, reviewer and coordinator. |
| Scope | Name the work, person, witness, files or paths involved and the base revision. |
| Evidence | Cite the source and passage, or give current steps and expected behaviour. |
| Acceptance | Give one observable example, required checks and relevant failure conditions. |
| Handoff | State whether to return a note, a reviewed diff or a PR. Name the person deciding the merge. |

**Knowledge example.** Verify the production-period wording for the Palace Museum Yan Qinli rubbing 新00045406, citing the catalogue paragraph. Leave an exact year open if the source gives only a period. Edit `knowledge/objects/dpm-rubbing-xin00045406.md`, run `npm run knowledge:compile`, and submit the single-witness note in Chinese. Do not reintroduce the retired legacy JSON corpus. [Museum entry](https://www.dpm.org.cn/collection/impres/234175.html)

**Web example.** From `#/person/yan-zhenqing`, reach `#/work/yan-qinli-bei`, refresh and follow a return link with the keyboard. Keep the links readable without a map key. Record the result in a PR for the coordinator.

> 请先读仓库的 AGENTS.md、docs/START-HERE.md 和分配的 Issue。用中文简述读者要得到什么、哪些文件或条目在范围内、怎样验收。完成本任务，列出所用出处或实际测试结果、还存在的问题和下一位接手人。按任务单提交，不替发起人决定合并或出版。
