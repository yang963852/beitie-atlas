# Map pilot — provider evaluation and status

Check date: **2026-11-17**. Author: implementation pass for task 001.

Status at the end of this pass: **integration code written and exercised in its failure
paths; live provider rendering NOT tested, because no Tianditu key exists in this
environment.** The page deliberately shows an explanatory panel instead of a map, and the
list/detail views work without it.

## 1. Selected route: official Tianditu (天地图) JavaScript API 4.0

Reasons: mainland-first readership, a national official service with published terms, a
CGCS2000 basemap, and a documented browser key flow.

### Facts checked on 2026-11-17

| Item | Finding | Source |
| --- | --- | --- |
| Access model | A development licence (Key) is required for API and service calls: “即日起天地图API及服务接口调用都需要申请开发许可（Key）”. Registration and key creation happen in the developer console. | <https://lbs.tianditu.gov.cn/authorization/authorization.html> |
| Price | The JavaScript API is described as “免费对外开放” and needs a key before use. Commercial or high-volume terms were **not** verified. | <https://lbs.tianditu.gov.cn/api/js4.0/guide.html> |
| Script entry point | `<script src="https://api.tianditu.gov.cn/api?v=4.0&tk=KEY">` (official examples use `http://`; the page states HTTP and HTTPS are both supported). | <https://lbs.tianditu.gov.cn/api/js4.0/guide.html> |
| Coordinate system | The service catalogue lists 坐标系 CGCS2000; `vec_w` is Web Mercator, `vec_c` is geographic. | <https://www.webmap.cn/commres.do?method=tianMap&typeId=14> |
| Approval label on the portal | Homepage shows 审图号 GS（2026）4921号 and 甲测资字 11110974 on the check date. | <https://www.tianditu.gov.cn/> |
| Quota | The licence page states that the 2020 service performs API call quota management (配额管理). Exact per-key limits are **not** published on the pages checked; they must be read in the console after registration. | <https://lbs.tianditu.gov.cn/authorization/authorization.html> |
| Key types | Browser, server and Android keys exist and “不同应用类型的密钥不能混用”; an optional domain whitelist restricts a key to listed domains. The quoted wording comes from a provincial node's key guide; the national console is expected to behave the same and must be confirmed at registration. | <https://www.sdmap.gov.cn/tdtsdservice/file/noLogin/developer_management_system_files/天地图山东开发资源及tk使用说明.pdf> |

### Not verified in this pass

- Whether an individual developer account needs identity verification (实名认证) before a
  browser key is issued. Not attempted: creating an account in the owner's name is not the
  implementer's decision.
- The actual daily quota and whether this non-commercial open-source project fits the free
  tier.
- Live rendering, tile quality, mainland latency, and the exact attribution label the
  provider requires a third-party page to display.
- Whether the provider applies any internal transformation between WGS84 input and its
  CGCS2000 basemap. The documentation read here does not state it, so §3 describes only what
  this project does (nothing) and what the sources establish.
- The console page itself could not be read without logging in; it is recorded as
  “open in a browser after registration”.

## 2. What the code does

| File | Role |
| --- | --- |
| `src/map/config.ts` | Reads `VITE_TIANDITU_KEY` at build time, builds the official script URL, holds the fallback view and timeout. |
| `src/map/tianditu.ts` | Loads the official script once per session, creates the map and one marker per place, passes the stored WGS84 value through **without** a datum transformation, and removes failed scripts before a retry. |
| `src/map/markers.ts` | Builds markers from places that have coordinates and at least one object; places without coordinates are reported, not approximated. |
| `src/map/types.ts` | The adapter boundary. No provider type escapes this folder. |
| `src/components/MapPanel.tsx` | Loading, unconfigured, error, retry, place card, attribution, and a keyboard-accessible location list that always works. |

Design decisions:

- **One marker per documented institution, not per object.** Two objects at one institution
  become one marker with a list, so counts stay consistent between map and list.
- **No coordinate, no marker.** Historical places without a surveyed point (the governor's
  compound, Xincheng, the 1948 Beilin) stay in the list and produce no marker.
- **No invented transformation.** Records stay WGS84. The adapter passes the numbers to
  `T.LngLat` unchanged and does not relabel them as CGCS2000. Any datum question is described
  in §3 rather than hidden in a function name.
- **No key, no request.** When `VITE_TIANDITU_KEY` is empty the component never injects a
  script and never contacts the provider.
- **Failure is visible, never fatal.** A timeout (15 s), a blocked script, or an SDK error
  produces an error panel with a retry button; the corpus is unaffected.
- **No reverse-engineered tile URLs, no tile-URL swapping.** Only the documented JS API is
  used, so the provider's own labels and attribution stay in place.

## 3. Coordinate treatment

The records store WGS84 longitude/latitude and keep the source that supplied each point. The
adapter passes those numbers to `T.LngLat` **unchanged**. It applies no datum transformation
and does not label the stored value as CGCS2000. Nothing in the code claims an accuracy that
the sources do not support.

What is documented, and by whom:

| Claim | Source | Status |
| --- | --- | --- |
| Tianditu's map services are catalogued with 坐标系 CGCS2000, in geographic and Web Mercator variants. | Entry for 天地图 in the national catalogue, published by 国家基础地理信息中心: <https://www.webmap.cn/commres.do?method=tianMap&typeId=14> | Official catalogue, read 2026-11-17 |
| JavaScript API 4.0 `MapOptions.projection` defaults to `EPSG:900913` and also supports `EPSG:4326` (大地平面投影). | Official class reference <https://lbs.tianditu.gov.cn/api/js4.0/class.html> | Official documentation; the page is script-rendered, so the property text was read from its search description, not from a live map |
| CGCS2000 is implemented by the 2000 National GPS Geodetic Network at epoch 2000.0, aligned with ITRF97 at that epoch. | 深圳市规划和自然资源局, 2021-11-11: <https://www.sz.gov.cn/hdjl/ywzsk/ghj/zrzyl/content/post_9358232.html> | Government explainer |
| The CGCS2000 frame is defined with zero translation, rotation, and scale relative to ITRF1997 at epoch 2000.0. | UNOOSA/ICG “China Terrestrial Reference Frame 2000” template, submitted by the Chinese geodetic authority: <https://www.unoosa.org/pdf/icg/2012/template/CTRF2000.pdf> | International submission describing the national frame |

What follows, and what does not:

- CGCS2000 and WGS84 share an Earth-centred definition and a nearly identical ellipsoid. At the
  same epoch and realisation the difference is negligible at institution scale.
- They are not interchangeable statements. WGS84 coordinates are normally given at an
  observation epoch, while CGCS2000 is realised at 2000.0. Crustal motion means the difference
  grows with time. A Chinese professional-society review gives about 3 cm per year in its
  example (roughly 0.6 m across 19+ years): <https://mp.weixin.qq.com/s?__biz=Mzg5MzU0Njg1Ng==&mid=2247485595&idx=1&sn=dff31600bd7229afb519788457fa845f>.
  That article is secondary evidence for an order of magnitude, not a standard.
- Both institution points come from Wikidata P625 with no cited reference and no stated epoch.
  The Beilin point is recorded at institution precision (about 30 m). The datum question is
  well below that uncertainty, but it is not resolved by this project.

**Conclusion recorded in the data and interface:** the marker is an indicative institution
point, not a surveyed or converted position. Precision is never inferred from the number of
decimal places. If a key is supplied, the live check in §6 can show whether the two points land
on the museums; that observation tests the whole chain, not a datum transformation.

## 4. Credential model

A browser key is **public by construction**: whatever `.env` says, `VITE_*` values are
compiled into `dist/assets/*.js`. It is not a secret and must not be handled like one.

- Keep it out of version control (`.env*` is ignored, `.env.example` is committed empty).
- Restrict it by domain (whitelist) and rely on the provider's quota.
- A server-side proxy is only needed if a future provider requires a server key. This task
  adds no backend and no proxy.

## 5. One precise owner action (to enable the map)

The owner needs a Tianditu developer account and one browser key. The beginner-facing steps,
the exact file to create, what not to send in chat, and the console details that still need
verification are in **[docs/map-setup.md](map-setup.md)**. No key is required for anything else
in this task.

## 6. Test plan once a key exists

1. Put the key in `.env.local`, run `npm run build`, then `npm run preview`.
2. Confirm the map renders and two institution markers appear (Xi'an Beilin Museum, Palace
   Museum). Both points are labelled *Unverified — secondary source* in the UI, because the
   coordinates come from a secondary database.
3. In DevTools → Network, confirm requests go only to `api.tianditu.gov.cn` and the
   provider's tile hosts; no other third party appears.
4. Block `api.tianditu.gov.cn` (DevTools request blocking) and reload: the error panel must
   appear, and the list/detail must stay usable.
5. Record browser, network, date, and whether the map or the list loaded first.
6. Optional rendering test without touching real data: in development only, set
   `VITE_MAP_SYNTHETIC_DEMO=1` to add a **synthetic** marker at 0°, 0° (Null Island), labelled
   as a rendering test. It never appears in a production build and is not an artifact
   location.

Mainland desktop and mobile testing is a separate gate and requires a deployed build; a
localhost screenshot does not satisfy it.

## 7. Alternatives

| Option | Position |
| --- | --- |
| AMap (高德) | Fallback candidate only. Switching would add a second key model, the JS API 2.0 security-code (`jscode`) setup, and a new terms review. Not evaluated further because the Tianditu route remains viable pending one key. |
| Leaflet + OSM tiles | Not chosen. OSM's tile policy is intended for small-scale use, in-browser tile URLs must not be swapped between providers, and mainland reachability is unproven. No Leaflet dependency was added. |
| Static image or hand-drawn map | Rejected as the primary pilot: it cannot demonstrate a real provider integration. |

## 8. Deployment prerequisites (unchanged by this task)

- A static host serving `dist/` at a known base path. Vite's `base` is configurable; a
  sub-path build was produced and inspected (see the delivery report).
- No server component for the Tianditu browser key.
- If a later provider requires a server key, add a documented proxy as its own task.
- Provider terms, attribution, and any approval label must be rechecked for the actual
  release host before publication.
