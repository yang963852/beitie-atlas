# Delivery 028 | GitHub Pages basemap

Base `b4475ed`; branch `codex/028-pages-basemap`. The owner confirmed the Pages host whitelist and supplied the browser key. It was encrypted and stored as the repository Actions secret `TIANDITU_BROWSER_KEY`. The Pages workflow sends it to the publication build only; automated tests stay keyless. The key is not tracked in Git. A published browser key is necessarily visible to site visitors. No Codex Sites deployment or corpus change is part of this task.

Local self-review: `npm.cmd run check` passed all 123 tests and the preview build; `git diff --check` was clean. GitHub check, deployed revision and hosted tile verification are tracked in the task PR.
