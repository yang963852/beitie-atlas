# Delivery 015 | Restore the original interactive atlas

Base revision `a2da8daa1d742047fa6668b14aaa46a66462ebe2`. The commit introducing this report identifies the implementation revision.

- Restored the Sites manifest to `dist/` and removed the temporary overview source and build command. The original React workspace and map interaction code are reused directly. The owner confirmed that the 36 physical records may be shown in a public preview with their draft notice.
- The formal release gate and record review states are retained. The previous reviewed layout evidence remains in [delivery 014](delivery-014.md).
- The browser key in `.env.local` returned both JavaScript and image tiles for the planned Sites referrer and the unrelated negative-control referrer. It needs a domain restriction before public bundling. Keep the key out of Git and verify actual rendered tiles after enabling it. The keyless preview uses the existing coordinate overview.
- `npm.cmd run check` passed type checking, data validation, 98 tests and the keyless preview build. No layout or interaction source files changed in this task.

No new coordinates or claims were added. Current marker counts and the unverified institution-level coordinates retain the limits documented in the corpus. Mainland access checks remain outstanding.

## Live basemap follow-up

After the owner saved the bare hostname in the national Tianditu console, a tile request for the deployed origin returned HTTP 200 and `image/png`. An unrelated origin received HTTP 403. The check build passed all 98 tests with the restricted browser key. Codex Sites version 4 deployed from Site source revision `90477486297f33eea44277180b15fee8c149996a`. The public homepage returned HTTP 200 and served exactly the verified JavaScript bundle. Browser rendering inspection timed out. The rollback target is the keyless atlas preview in Site version 3.
