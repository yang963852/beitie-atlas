# Rights and attribution

The MIT license covers this project's original application code, documentation,
and original editorial contributions to the data. It does not grant rights in
third-party quotations, linked museum content, underlying photographs, maps,
provider SDKs, trademarks, or dependencies. Preserve source references and
qualifications when reusing records. Draft records are research material, not
certified collection information.

The compiled knowledge interface can carry media records. Every media record must document creator,
license, credit, source and permission evidence before it enters the build. Source-page availability alone
does not establish reuse permission. Dependencies retain their own licenses.

## Bundled interface images

`src/assets/` ships seven WebP files that the interface loads. They are media, not
source code, so the MIT grant above does not settle their rights by itself. The
table records what the repository actually documents, with the commit or pull
request that introduced the file. "Not recorded" means the repository holds no
author, licence or permission statement for that file. It is not a public-domain
claim, and it is not an assumption that the project owns the file.

| File | What it is | Creator and licence as recorded | Evidence |
| --- | --- | --- | --- |
| `shenlong-opening.webp` | Opening columns of the Shenlong copy of the Lanting Preface, cropped from a Wikimedia Commons JPEG and mounted on the opening desk. | Tang copy traditionally attributed to Feng Chengsu, after Wang Xizhi. The media record says "Public Domain Mark 1.0 (PD-Art on Wikimedia Commons)". | `knowledge/objects/witness-lanting.md`, media `media-shenlong-opening` (`rightsEvidence` is the Commons file at oldid 1087138769, acquired 2026-11-23); crop geometry in `docs/source-audit.md` (archived tag `archive-pre-hygiene-2026-11-25`); PR #26. |
| `wood-grain.webp` | WebP diffuse (colour) derivative of a scanned wood texture, used as the desk material map. | Dimitrios Savva and Rico Cilliers, Poly Haven "Wood Table 001", CC0. | `docs/source-audit.md` (same archived tag): "The wood diffuse and OpenGL normal maps are WebP derivatives of Wood Table 001 by Dimitrios Savva and Rico Cilliers", with https://polyhaven.com/a/wood_table_001 and https://polyhaven.com/license; PR #26. |
| `wood-normal.webp` | WebP OpenGL normal map derived from the same Poly Haven scan, used as the desk normal map. | Same as `wood-grain.webp`. | Same as above; the file is loaded as `normalMap` in `src/components/classroom-scene.ts`. |
| `copying-desk.webp` | Decorative overhead desk artwork for the first opening scene; it depicts no collection object. | Generated in-project with the built-in ImageGen tool, and the generation prompt is recorded. No third-party source and no separate licence are recorded. | `docs/delivery-031.md` (archived tag `archive-pre-hygiene-2026-11-25`); commit `06e13e4`, PR #19. |
| `ink-wash.webp` | Procedural alpha ink wash for the ink bloom on the opening desk. | Project-made procedural texture. No third-party source and no separate licence are recorded. | `docs/delivery-031.md` ("The ink texture is a procedural alpha wash"); commit `06e13e4`, PR #19. |
| `classroom-desk.webp` | Landscape static poster behind the WebGL classroom desk, shown before the canvas and when WebGL or motion is unavailable. | Who rendered the poster, with which tool, and under what terms is **not recorded**. The poster depicts the Shenlong crop; the PD-Art declaration above covers that crop, not the composite poster. | Introduced in commit `f4a629a` and re-rendered in `0f9e70a` (PR #26) and `38d73a6` (PR #29); `docs/source-audit.md`: "The two static desk posters also depict the crop." |
| `classroom-portrait.webp` | Portrait static poster for the same desk, selected by `max-aspect-ratio: 17/20`. | Same as `classroom-desk.webp`; not recorded. | Same as above; selected in `src/components/opening-desk.css`. |

### Rights still to establish

- `classroom-desk.webp` and `classroom-portrait.webp`: the repository records them
  as static renders of the same desk and states that they include the Shenlong
  crop, but not their author, tool or terms. The maintainer must record the
  creation method and licence, or replace them with a re-render whose provenance
  is documented. The PD-Art status of the embedded crop does not license the
  composite.
- `copying-desk.webp` and `ink-wash.webp`: the repository records in-project
  generation, not a third-party rights holder. It does not state whether the
  generator's output terms allow redistribution under the repository licence.
  Confirm those terms and, where appropriate, state that these files are covered
  by the project licence.
- `shenlong-opening.webp`: the media record combines "Public Domain Mark 1.0"
  with the Commons PD-Art tag. The archived evidence review
  (`docs/research/card-a-evidence-review.zh-CN.md`, row 7, P3) noted that these
  are different tools and asked for the wording to be corrected at rights review.
  Check the Commons file page's actual declaration when the record is next
  reviewed.

These rows repeat what the repository records; they do not re-verify the external
sources. The Commons acquisition date (2026-11-23) is not a fresh verification
date, and source-page availability is not reuse permission.

Interaction inspiration: https://github.com/DeanChensj/jiangshan-map (GPL-3.0).
No code or assets from that project were intentionally incorporated. Review
any future copying for license compatibility before inclusion.

Design and collaboration references are credited in CONTRIBUTING.md and
docs/design-system.md; project policies are original adaptations.
