# Delivery 024 | Calligraphy through the Qing

Sites version 7 deployed successfully to the [public catalogue](https://beitie-atlas.partedlute2.chatgpt.site/). GitHub revision `6b15362f397049934dde6c928d07f77cd2b4433a` and Sites revision `1336a4d768d8db81afd4842489d587bd08689d71` share the same tracked tree. The upload used the locally tested preview artifact. Version 6 is the rollback point. The strict gate rejected 58 draft records.

Branch `codex/024-bei-tie-catalogue`, base `79386874b3047b74cf3a9126274c54bf8b13f05e`.

The catalogue adds twenty draft works and twenty witnesses from the Palace Museum and National Palace Museum catalogues, with twenty source records and one institution. The 1929 小碑林记 record is retained in the historical archive. Later rubbings of earlier compositions remain eligible. The resulting preview contains 64 works, 69 objects, 22 places and 94 sources.

The domain, search, two interface dictionaries, detail layout, browser description, READMEs, engineering plan and coverage inventory reflect the expanded scope. Catalogue numbers and sizes display an explicit unknown when unverified. Long editorial notes and the bibliography use native keyboard-operable disclosures. Frontend Design was installed from Anthropic's skills repository for the local design pass.

The implementer's checks passed type, data, board, 120 tests, and the Vite build. Data validation retains warnings about original date wording and translations. Local Edge checks opened the 兰亭序 permalink, operated a disclosure with Enter, and checked for horizontal overflow. Screenshots show [390](screenshots/024-detail-390.png), [768](screenshots/024-detail-768.png), [1440](screenshots/024-detail-1440.png), and the [720 CSS pixel equivalent at double density](screenshots/024-detail-720.png). Native browser zoom and live map tile rendering were not verified.
