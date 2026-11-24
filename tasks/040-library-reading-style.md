# Task 040 · A reading-room setting for the knowledge library

- **Outcome:** The library index and entry pages read like a printed catalogue: warm laid paper, Song serif prose, Kai captions, a vermilion seal accent, ruled dynasty shelves and a centred title leaf. Reading measure, contrast, focus and touch targets stay within the design system.
- **Base revision:** `1d0de8f` (`main`, 2026-11-24).
- **Scope:** `src/components/KnowledgeLibrary.tsx`, `src/components/knowledge-library.css`, a duplicate-date correction in `src/components/ProvenanceEvents.tsx`, the design-system note, this task, delivery 040 and the iteration board.
- **Non-goals:** Changing editorial records, the compiler, the interface shape, the atlas routes, or the light/dark theme decision. No downloaded web fonts. No new dependency.
- **Design direction:** The reader is at a copying desk, so the library uses the material language of a thread-bound book rather than the blue atlas chrome. Decorative devices stay functional: rules separate shelves, numerals order entries, the seal marks identity, and the vermilion accent marks navigation and selection.
- **Evidence:** Screenshots at 390, 768 and 1440 CSS px, a 720 CSS px / 2× device-pixel-ratio zoom equivalent, and an English-locale capture in [delivery 040](../docs/delivery-040.md).
- **Checks:** `npm.cmd run check`; browser keyboard selection, search and empty state, language switch, sticky masthead, contrast, and horizontal-overflow checks at all three widths.
- **Review:** Implementer self-review; the coordinator decides acceptance and authorized the merge and preview.
