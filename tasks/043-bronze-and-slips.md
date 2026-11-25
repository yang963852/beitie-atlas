# Task 043 — Add bronze inscriptions and bamboo slips

Extend the library beyond steles and modelbooks at the owner's instruction: add
representative bronze inscriptions and bamboo-slip manuscripts with citable museum
or government evidence. Keep the existing authoring schema; add a physical-object
type only where the carrier cannot be described by the current ones.

Scope:

- Add five bronze inscriptions from the Western Zhou to the Warring States and five
  slip manuscripts from the Warring States to Sun Wu, each with its own physical
  object, holding and date.
- Add `bronze-vessel` as an object type; label it in both interface languages and
  include it in the surviving-original filter. Keep bamboo slips under
  `ink-manuscript`.
- Add the places and sources each record needs. Do not invent coordinates for
  institutions whose pages give no point.
- Keep attribution at “unrecorded” for anonymous casters and scribes; do not assign
  a calligrapher to a bronze or a slip.
- Record disputed counts and findspots as bilingual notes.
- Write the selection report, regenerate the catalogue, run `npm run check`, and
  record the outcome in a delivery report.
