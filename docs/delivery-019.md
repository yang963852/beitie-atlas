# Delivery 019 | A refused basemap says so, and the stack question gets an answer

Base revision `5d4be9c658a274046d7ca52d235036f4b8ae9d95`. Task record: [task 019](../tasks/019-tile-failure-and-stack-rationale.md).

## The finding that was actually a defect

A browser key restricted to another origin returns 403 for every tile. The Tianditu SDK reports nothing, so the reader saw a blank grid of broken image icons with the markers floating over it and no explanation. That is indistinguishable from "this site is broken", and it is exactly the state a first-time visitor on a misconfigured host would meet.

- `src/map/tiles.ts` watches the container's images rather than the provider's internals: a first `error` before any `load` reports a failure, and a four-second silence with images present reports one too. It reports once, and its cleanup removes both listeners and the timer.
- `MapPanel` shows a notice above the map and falls back to the coordinate schematic, so the reader sees labels and points instead of broken images.
- Four seconds rather than fifteen: tiles either arrive quickly or they are refused; a long wait only prolongs the state the notice exists to explain.

## The finding that was configuration

Five Dependabot pull requests were open, and one of them proposed TypeScript 7, Vite 8 and `@vitejs/plugin-react` 6 as a single group. Those are breaking upgrades dressed as routine maintenance. `.github/dependabot.yml` now ignores semver-major for every package; minor and patch still arrive weekly. The five open pull requests are left for the owner to close — they predate the rule and merging any of them would have to be a deliberate decision.

## The question

`docs/engineering-plan.md` gains "Why this stack, and what it can still absorb": the site is JavaScript (TypeScript is erased at build time), why React earns its place here rather than hand-written DOM code, why a server-rendered framework would add a runtime and a second data path to solve a problem the corpus does not have, and a table of what changes at each growth step — including the two conditions that would force a rewrite.

The same explanation, in Chinese and without jargon, was written for the owner outside the repository; the repository keeps the English version because that is the documentation language here.

## Verification

| Check | Outcome |
| --- | --- |
| `npm.cmd run check` | Passed: type check, data check (37 works / 40 objects, 0 errors), board check, 112 tests, preview build |
| `tests/map-tiles.test.ts` | Five cases: error before load, quiet after a load, silent timeout with images present, no images at all, single report plus cleanup |
| `tests/map-panel.test.tsx` | Drives a stub provider whose only tile errors: the notice appears, the schematic replaces the canvas, and `data-map-tiles="blocked"` is set |
| Live browser | **Not verified.** The Tianditu script did not load from this network during the pass (`window.T` undefined after 20 s), so the refused-tile state could not be reached with the real provider. An earlier run happened to show the notice over broken tiles; that screenshot was discarded rather than presented as evidence of the current state |

## Limitations

- A mocked provider is not the provider. The wiring is tested; the real 403 path is inferred from one earlier observation and still needs a check on a host where the key is not whitelisted.
- Tile refusal is detected, not fixed. The key's whitelist and quota remain an owner-side configuration.
- No data, no coordinate and no review state changed in this task.
