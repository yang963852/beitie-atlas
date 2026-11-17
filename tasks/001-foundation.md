# Task 001 — Foundation and mainland map pilot

Copy this brief into WorkBuddy and give it access only to this project folder. This is the first implementation task, not a request to build the entire product at once.

You are the implementation engineer for **碑帖之间 / Between Steles**. The owner is a programming beginner. Codex will review your actual files and run results. Write code, identifiers, technical documentation, and initial UI in English; explain progress to the owner in clear Chinese. Preserve Chinese original object titles.

## Read first

Read `README.md`, `docs/engineering-plan.md`, and `docs/source-audit.md`. Preserve them. Read the owner guide if you need context. The product is a mainland-first map of original steles and selected rubbings, with sourced provenance.

## Objective

Create a small, reproducible foundation and a real map pilot. Prove that an object can be represented correctly, a documented institution can be located, and provider/network prerequisites are understood. Do not expand into the complete release.

This task covers the **local engineering portion of M0**. Passing this task alone does not complete M0: a subsequent test deployment and mainland-network verification are required. Report local engineering status and the overall M0 gate separately.

## Required work

1. Inspect the folder and development environment. Reuse existing Git initialization if present. Never initialize, stage, or upload the parent workspace. Preserve existing planning documents.
2. Set up React + TypeScript + Vite with npm and a lockfile. Choose supported stable dependencies, record the Node version, and document start/build/check commands. On this Windows machine `npm.cmd` is available.
3. Implement minimal domain types and runtime data checks. Support work/object separation, source references, optional coordinates with explicit CRS/precision, current collection assertions, uncertain dates, and event-level evidence.
4. Create two draft object records for the Yan Qinli original stone and the numbered Palace Museum rubbing using the audited sources. Draft is not equivalent to approved release data. Their present collections and histories must remain independent. Unknown data must stay unknown.
5. Evaluate official Tianditu access for the actual selected service first: account, key, allowed use, browser/domain restrictions, attribution/approval labels, coordinate system, quota, and deployment prerequisites. Use the official API/service, not reverse-engineered tile URLs. Record the result in `docs/map-pilot.md` with links and the check date.
6. If an owner-held account/key is required, give one precise setup request. Continue the data model, page, and failure-state work while access is pending. Do not invent credentials, sign up in someone else's name, or silently switch providers. Evaluate AMap only if the preferred route proves unsuitable; record why. Follow production credential guidance, including a small proxy if required, before claiming it is production-ready.
7. Build one screen with a results list, minimal object detail, and the selected map adapter. Resolve and cite one institution coordinate, with source CRS and precision. If it cannot be verified, keep the coordinate null and mark the map-point acceptance item incomplete. A clearly separate synthetic point may test rendering but must never appear as an actual artifact location.
8. Keep the list/details usable when the map cannot load or configuration is absent. Add a clear error/loading state. Keep provider attribution visible. Use system fonts; bundle ordinary application dependencies locally, while respecting provider rules that require online SDK loading.
9. Provide a portable production build with a configurable base path. Document a minimal hosted-pilot plan for mainland desktop and mobile access. Do not claim public access was tested using a localhost screenshot.

## Acceptance

- The owner can follow the documented start steps and open the page.
- Type check, data validation, and production build run with actual reported results.
- Original stone and rubbing have different object IDs, types, and collection assertions; key claims link to sources.
- Missing dates and coordinates stay missing; no guessed location is presented as verified.
- A real provider-backed map and one supported institution marker are demonstrated when credentials are available; otherwise report those items as incomplete.
- A blocked provider does not break list/detail reading.
- No private credential is committed or embedded in a browser bundle. Distinguish intentionally public browser keys with domain restrictions from actual secrets; frontend environment variables are public after building.
- Provide the exact preview address, changed-file list, test outcomes, screenshots if available, and outstanding limitations in `docs/delivery-001.md`, following the report template.
- Mainland public access is a separate gate requiring an accessible test deployment and owner testing. If that has not happened, say so explicitly.

## Out of scope

No complete UI redesign, full corpus import, accounts, comments, AI-generated history, database, historical border layers, external image scraping, paid service purchases, or production launch in this task. Keep source data independent of the map SDK. Do not copy GPL source into a project intended for a different license.

## Handoff

Finish with a short Chinese explanation of what works, what the owner can open, what was actually checked, and what remains. Ask the owner to return to Codex with the updated project folder and `docs/delivery-001.md` for review. A self-reported “done” without files and test evidence is not acceptance.
