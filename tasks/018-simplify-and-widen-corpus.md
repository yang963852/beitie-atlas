# Task 018 | Simplify the code, widen the corpus, and define citable sources

Base revision `29adb942ed2da3a901db4bcca75bbc623e182a04`. The owner asked for simpler and more elegant code, for professional advice suited to a beginner, and for more inscriptions — with app-curated collections (掌上碑帖, 以观书法) or printed catalogues suggested as leads.

- Remove the repeated linear lookups: id resolution goes through maps built once with the dataset.
- Move `pickText` out of a component, where it forced the map panel to import from the detail view.
- Let a source be a printed catalogue: publisher, year and page locator, no invented URL.
- Write down what may be cited, and what an inscription app may and may not be used for.
- Add records for four steles that were missing, each from institutional pages read during the task.

Out of scope: changing the public host, marking any draft as reviewed, and citing an app as evidence.
