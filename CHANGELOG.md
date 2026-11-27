# Changelog

Current release: **v1.2.0 · 1.2 版**.

## v1.2.0 · 1.2 版

The 1.2 edition makes the library easier to edit and easier to query without changing the published data interface. Authors now write flat `schemaVersion: 2` properties, so every record can be edited in Obsidian's property panel; `knowledge/` is the vault and ships its record templates, property types and reading CSS, while per-machine state stays ignored. Search matches every term across a record's titles, aliases, calligraphers, places and catalogue number, so terms may come from different fields. Two tools serve contributors and agents: `npm run knowledge:query` prints one record with its sources, and `/llms.txt` summarises the site, data and rights for machine readers. The compiled interface remains `beitie-knowledge/1`, and the release gate is unchanged. [Knowledge library](knowledge/README.md) · [Engineering decisions](docs/engineering-plan.md)

## Unreleased

The compiled interface `data/index/knowledge-v1.json` leaves version control. `npm run knowledge:build` regenerates it, and `dev`, `build`, `check`, `typecheck` and `test` run that build themselves, so a clone no longer carries a generated file that conflicts on every content change. The GitHub catalogue and `knowledge/README.md` stay tracked as the reader-facing projection. [Engineering plan](docs/engineering-plan.md)

## v1.1.0 · 1.1 版

The 1.1 edition publishes the whole library: 117 works, 126 physical witnesses, 46 places, 184 sources and 75 provenance events. Every record passes the release gate, so the draft state, the per-entry review labels and the preview draft notice no longer appear to readers. Editorial uncertainty stays in each record's 待考 and claims sections, not in workflow notes. The version is shown as 1.1 on the site. [Knowledge library](knowledge/README.md) · [Status report](docs/knowledge-status.md)

## v0.2.0-beta.1 · 内部测试第一版

The public Pages preview adds a Markdown knowledge library for readers and contributors, with Yan Zhenqing and Shen Yinmo as the first person-led reading paths. Works and physical witnesses retain distinct identities and sources. Contributors can submit evidence in Chinese directly on GitHub, or claim a small web task and hand it to their local agent. The coordinator decides merges. The beta accepts drafts and has its own feedback form. [Knowledge library](knowledge/README.md) · [Chinese submission and testing guide](docs/CONTRIBUTE.zh-CN.md) · [Milestone task](https://github.com/yang963852/beitie-atlas/blob/archive-pre-hygiene-2026-11-25/tasks/036-internal-beta.md)

Earlier entries and dated iteration records are retained in the annotated tags listed in [the archive index](docs/archive.md) and in GitHub Releases.
