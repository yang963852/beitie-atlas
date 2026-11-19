# Delivery 031 | The copying desk

Branch codex/031-desk-opening; base 40c6bf5. The animation lasts 3.4 seconds. The three opening records cover an original stone ensemble, a transmitted manuscript copy and a stele with its own journey. The preview uses the existing collection map, descriptive text and bibliography. Locations and historical records remain backed by the catalogue.

Changed: OpeningDesk.tsx, opening-desk.css, App.tsx, MapPanel.tsx, styles.css, the two WebP assets, design system, task and iteration board. Codex self-review; acceptance belongs to the owner at merge. Public mainland network and independent reader testing remain unverified.

## Artwork

The desk is decorative artwork generated with the built-in ImageGen tool. The ink texture is a procedural alpha wash. Neither depicts a collection object. Final files: src/assets/copying-desk.webp and src/assets/ink-wash.webp.

Generation prompt: Landscape 3:2, overhead photorealistic editorial still life of a Chinese calligrapher's work table in soft directional northern window light. Deep warm smoked elm grain horizontally across the frame. Leave the large middle 72% completely empty exposed wood for a handscroll that will be composited by HTML. Along the far right margin a genuine dark oval Duan inkstone with a small pool of ink and two slim bamboo calligraphy brushes, inked fine tips, angled vertically; at upper left edge only the corner of a folded muted celadon brocade book cover with a tied dark-blue thread. At lower right edge a small offcut of xuan paper with a few abstract practice strokes, no legible inscriptions. Quiet tactile close-up, crop some objects at frame edge, fine paper fibres, restrained scholarly atmosphere. Do not depict scroll in middle, no lettering, typography, logos, UI, large black areas or watermark.

Local verification: npm.cmd run check passed type, data, board, 124 tests and the preview build. Existing 40 data warnings and the Vite chunk-size warning remain. Chrome covered a keyless map, reduced motion, keyboard entry and Escape with focus restoration, the full record link, refresh, and English. The main suite exercised provider failure. Screenshots include [unrolling](screenshots/031-unroll.png), [ink](screenshots/031-ink.png), [390 px](screenshots/031-390.png), [768 px](screenshots/031-768.png), [1440 px](screenshots/031-1440.png), [native 200% zoom](screenshots/031-zoom.png) and [the mobile dialog](screenshots/031-preview.png).
Implementation revision 06e13e494d684d3a9139b518aecc3dcad1ee5b5d. [PR #19 and source merge result](https://github.com/yang963852/beitie-atlas/pull/19). GitHub Pages follows checked main.
