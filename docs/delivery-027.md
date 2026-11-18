# Delivery 027 | Scroll opening and provenance leads

- Base: `c95307876bcf48df65853f1b9aadf25799130047`. Branch: `codex/027-opening-and-provenance`.
- Changed: opening layout, keyboard navigation and share-link entry in `src/`; nine object records and five source records in `data/`; preview workflow in `.github/workflows/pages.yml`; source-merge and hosting procedure in `AGENTS.md` and `docs/`.
- Provenance scope: 16 events or leads for the original Stone Drums, the original Duobao and Xuanmi steles, and the specific Lanting, Boyuan, Kuaixue, Jizhi, Hanshi and Songfeng witnesses. No new coordinates or changes to current collection assertions. The expanded records are drafts, not reviewed custody chains. For Jizhi, the two acquisition years in the colophons are intentionally not reconciled.
- This change does not replace the prior formal edition or publish to the existing Codex Site by itself. GitHub Pages is a secondary public preview without a Tianditu key. Mainland access is not inferred from local tests.

## Self-review

`npm.cmd run check` passed type, data, board and all 123 tests, then built the preview. The data audit had no errors and retained 40 warnings; Vite reported its existing bundle-size warning. The strict audit reported 75 draft errors as expected. A separate keyless build at `/beitie-atlas/` loaded its subpath assets and displayed the map fallback. Test coverage for key absence and provider errors passed; a live tile feed is not required on the Pages mirror.

Chrome captures: [390 px](screenshots/027-390.png), [768 px](screenshots/027-768.png), [1440 px](screenshots/027-1440.png), [200% reflow equivalent](screenshots/027-zoom-equivalent.png), and [the entered catalogue](screenshots/027-1440-catalogue.png). No horizontal overflow was observed. Enter moves focus into the catalogue without changing the URL; reloading the mobile Jizhi link restores the record and shows both acquisition years. The reflow test uses a 720 CSS px viewport at 2× device scale, not native browser zoom. This is the implementer's self-review under standing source-merge authorization, not independent editorial acceptance.
