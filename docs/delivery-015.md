# Delivery 015 | Restore the original interactive atlas

Base revision `a2da8daa1d742047fa6668b14aaa46a66462ebe2`. The commit introducing this report identifies the implementation revision.

- Restored the Sites manifest to `dist/` and removed the temporary overview source and build command. The original React workspace and map interaction code are reused directly. The owner confirmed that the 36 physical records may be shown in a public preview with their draft notice.
- The formal release gate and record review states are retained. The previous reviewed layout evidence remains in [delivery 014](delivery-014.md).
- The browser key in `.env.local` returned both JavaScript and image tiles for the planned Sites referrer and the unrelated negative-control referrer. It needs a domain restriction before public bundling. Keep the key out of Git and verify actual rendered tiles after enabling it. The keyless preview uses the existing coordinate overview.
- `npm.cmd run check` passed type checking, data validation, 98 tests and the keyless preview build. No layout or interaction source files changed in this task.

No new coordinates or claims were added. Current marker counts and the unverified institution-level coordinates retain the limits documented in the corpus. Mainland access checks remain outstanding.
