# Delivery 026 | Calligraphy at the copying desk

Branch `codex/026-study-catalogue`, based on `9e419d5d686d33d1a4a0bf00c69988a01e35b1ba`. Includes task 025. The owner requested direct merge and publication as a labelled preview.

Seven works and eight witnesses from Palace Museum object entries bring the preview to 71 works and 77 objects. Three works have explicit transmission events. The two differently filed rubbings of the Xuanmi stele and the Mochitang modelbook exercise the distinction between work category and material type. No new coordinates or image rights were assumed. All new work and object records remain drafts.

## Implementation and self-review

Every work has a validated study category. Both the results list and map use the intersection of category and search. Keyboard controls exposed 53 inscription witnesses, 24 modelbook/manuscript witnesses and 77 overall. The Chinese reading text includes 32 newly edited background paragraphs alongside the original English and seven new work entries. The introductory copy, bilingual READMEs and engineering contract describe the learning purpose.

The corpus additions cite eight Palace Museum entries. Each object links its own holding evidence. The original Xuanmi stone in Xi’an and the Beijing rubbing share a represented work and have separate catalogue records. The origin of the surviving hand in the Mid-Autumn and Imperial Summons letters remains qualified.

Windows checks: `npm.cmd run check` passed type, data, board, 121 tests and preview build. `npm.cmd run check:release` returned 1 for 73 draft work/object records. The data check retained 28 warnings. The build reported a JavaScript chunk above 500 kB. Browser checks exercised Enter, switching all three categories and reloading the Zhang Han permalink. No horizontal page overflow was observed at [390](screenshots/026-390.png), [768](screenshots/026-768.png), [1440](screenshots/026-1440.png) or [native 200% zoom](screenshots/026-zoom200.png). Mainland carrier access remains unverified for this revision.

Implementation revision `c4f7fe748b3ce73aeeaad876117491f27e222f3f`. Changed files are enumerated in the [task comparison](https://github.com/yang963852/beitie-atlas/compare/9e419d5...codex/026-study-catalogue).
