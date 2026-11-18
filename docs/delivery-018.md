# Delivery 018 | Simpler lookups, a wider corpus, and a definition of citable sources

Base revision `29adb942ed2da3a901db4bcca75bbc623e182a04`. The commit introducing this report identifies the implementation revision. Task record: [task 018](../tasks/018-simplify-and-widen-corpus.md).

## Code

| Change | Why |
| --- | --- |
| `data.ts` builds id maps once with the dataset; `getWork`/`getObject`/`getPlace`/`getSource` are map lookups | Every row of every render resolved ids with a linear `find`. The corpus is small, but four lookups per row is the kind of cost that only shows up after it is annoying to remove |
| `pickText` moved from `ObjectDetail.tsx` to `domain/text.ts` | The map panel imported it from the detail view, so two unrelated components were coupled through a helper neither owned |
| `search.ts` uses `getWork`/`getPlace` instead of re-scanning the arrays | Same change, one caller |
| `Source.url` may be `null`; `Source.kind` is `web` or `book` | A printed catalogue is citable evidence, and the old schema demanded a URL. That either blocked the evidence or invited an invented link. A book source now needs publisher, year and a locator instead |
| Source list renders a printed source as text, not a link | A link that goes nowhere is worse than a citation you have to look up |

The notes section also gained a scope label per group (`本条实物` / `所属作品` / `收藏地点`). Task 017 merged three layers of notes into one list, and a gap stated at object level and again at place level read like a duplicate. The label says which record is talking.

## Corpus

Four steles that were missing, all draft, all from institutional pages read during this task:

| Record | Period | Holding | What the pages establish |
| --- | --- | --- | --- |
| 爨宝子碑 | 东晋 405 | 曲靖爨文化博物馆（曲靖一中） | Date, dimensions, 1778 find, 1852 move to 武侯祠, 1937 pavilion |
| 爨龙颜碑 | 南朝宋 458 | 陆良薛官堡 | Date, dimensions, character counts, 1827 protective hall |
| 鲜于璜碑 | 东汉 165 | 天津博物馆 | Holding, 827 characters, May 1973 excavation at 武清高村 |
| 龙藏寺碑 | 隋 586 | 正定隆兴寺 | Date, in-situ holding, 张公礼 as writer, heading and face layout |

东晋 was an empty period before this task. Corpus totals moved from 33/36/15/54 to **37 works, 40 objects, 19 places, 62 sources, 25 events**.

Four conflicts were recorded rather than resolved:

- 爨宝子碑's year is 405 on the provincial culture department and municipal government pages and 404 on a provincial archaeology institute page. The structured year is 405 and the alternative is in the notes.
- The same stele's width is published as 0.68 m and 0.86 m. The structured figure follows the two government pages.
- 鲜于璜碑's dimensions are left empty: both museum pages quote a rubbing (242 × 83 cm), which is not the stone.
- 龙藏寺碑's dimensions are left empty: one page gives an overall height of 3.24 m, another a face of 1.56 × 0.89 m plus a 0.42 m heading, and the two do not reconcile.

## Documents

`docs/atlas-workflow.md` gains a "What counts as a source" table: museum/library/heritage/government pages and printed catalogues are citable; inscription-collecting apps, forums and encyclopedia entries are leads, not evidence. The reason is stated in the document: an app page has no stable per-object address, no editorial method, and no way to tell whether its date came from the stone or from another website.

## Verification

| Check | Outcome |
| --- | --- |
| `npm.cmd run check` | Passed: type check, data check (37 works / 40 objects / 19 places / 62 sources, 0 errors, 1 aggregated translation warning), board check, 106 tests, preview build |
| New records render | 爨宝子碑 appears under a new 东晋 group with its disputed date tagged 争议 and two sources; evidence: [list at 1440](screenshots/018-list-1440.png), [detail at 1440](screenshots/018-detail-cuan-1440.png) |
| Notes grouping | Three labelled groups with 3/3/2 bullets, no overflow at 390: [note at 390](screenshots/018-notes-cuan-390.png), [at 1440](screenshots/018-notes-cuan-1440.png) |
| Printed-source rule | Covered by three validator tests: accepted with a page locator, rejected without one, rejected when it also claims a URL |

## Limitations

- **No coordinates were added.** All four places are recorded without a point, so they appear in the place list and not on the map. This is deliberate: none of the pages states a surveyed point.
- **The basemap did not render in the local preview.** Tianditu tiles failed to load because the browser key is now restricted to the deployed origin, so the screenshots show the marker overlay without tiles. That is a configuration limit of the local preview, not a change in this task; the tile-failure state still shows no message to the reader, which remains an open issue.
- Four records is a small dent. The corpus still has no 北宋 beyond one rubbing source, no 辽金, one Ming and one Qing work.
- Nothing was marked `reviewed`; the strict gate still rejects all of them.
- Apps were used only for names and leads. No app page is cited anywhere in the data.
