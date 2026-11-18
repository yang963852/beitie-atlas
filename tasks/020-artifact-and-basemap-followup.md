# Task 020 | Fix artifact input handling and basemap recovery

Base revision: `58816a4b3365905085f70112e89543a5cb7cf3c7`.

- Pass the dispatch path as data, validate it, and use the normalized path for both artifact modes.
- Wait for basemap tiles after the provider mounts; distinguish them from marker and annotation images and clear the fallback on recovery.
- Leave the corpus, release gate and deployed Site unchanged. Acceptance belongs to an independent reviewer or the owner at merge.
