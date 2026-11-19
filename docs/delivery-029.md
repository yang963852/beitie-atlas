# Delivery 029 | Yan Qinli reading

Branch: `codex/029-yan-qinli-story`. Base: `a7c7aa0`. Implementation and editorial self-review by Codex. Independent editorial approval remains open.

Changes: bilingual prose in `data/yan-qinli-story.json`, reading component in `src/components/YanQinliStory.tsx`, integration in `ObjectDetail.tsx`, responsive diagram styles, task and board. Rechecked the Beilin catalogue, the 2007 Beilin article and Palace Museum entry 新00045406 on 2026-11-19. The draft appears only in preview, with per-paragraph citations. The historical diagram expresses the reported direction relative to the Drum Tower. The precise historical coordinates, rubbing year and accession date remain unknown.

Local checks: `npm.cmd run check` passed type, data, board, 123 tests and the preview build. Data reported 40 existing warnings. Vite retained its bundle size warning. Chrome exercised the keyless fallback, Enter on the place disclosure and witness link, refresh on the album, return to the stone and switching to English. Provider failure is covered by the existing tests; no live provider failure was induced. Reader interviews, independent editorial review and mainland network checks were not run.

Chrome captures: [390 px](screenshots/029-390.png), [768 px](screenshots/029-768.png), [1440 px](screenshots/029-1440.png), and [native 200% zoom](screenshots/029-zoom.png). At 200% Chrome reported a 720 CSS pixel viewport on a 1440 pixel surface. No horizontal overflow in the four captures.

Implementation revision: `dcbfb3b82b25ab3a657b69cc4a17b09e0e0ac1c1`. [PR #17 and its merge result](https://github.com/yang963852/beitie-atlas/pull/17) tracks the source merge. GitHub Pages follows checked main. No Codex Site upload or formal release is part of this task.
