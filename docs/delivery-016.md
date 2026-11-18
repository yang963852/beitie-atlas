# Delivery 016 | Chinese-first GitHub project home

Base revision `926bc15e74050f415f1017c35b275c5c2530c134`. The commit introducing this report identifies the documentation revision.

- `README.md` is the primary Simplified Chinese introduction. `README.en.md` provides the English equivalent, and `README.zh-CN.md` keeps older links working.
- Both introductions link to the atlas, issue tracker, setup, contribution workflow, release process and license. The existing screenshot is explicitly labelled as a local preview capture.
- `docs/START-HERE.md` and `CHANGELOG.md` describe the current public draft preview. The GitHub About section uses a Chinese description, the Codex Sites address and seven relevant topics.

Local Markdown link checks and `git diff --check` passed. `npm.cmd run check:data` reported 33 works, 36 objects, 15 places and 54 sources with zero errors. The atlas returned HTTP 200. This documentation task did not change application code or deploy a new Site version.
