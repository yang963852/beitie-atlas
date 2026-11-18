# Delivery 012 | GitHub Pages project overview

Base revision `fe6b5ce5675d2921ea1e92a9a4ee33e10c7d08d8`. The source revision is the commit that introduces this report.

- `site/index.html` and `site/styles.css` describe the project, its data model, features, and technology. They link to the repository and the owner-only app preview.
- `.github/workflows/pages.yml` publishes the two static files to GitHub Pages after a relevant push to `main`. Its artifact staging step takes only those two files.
- The project READMEs and workflow documentation link to the new overview.

GitHub Pages was enabled in Actions mode for the [overview](https://yang963852.github.io/beitie-atlas/). The repository Actions history records the deployment revision and status.

Local `npm.cmd run check` passed, including 97 automated tests and the preview build. Edge at 390, 768 and 1440 CSS px showed no horizontal overflow. The mobile navigation link reached the technology heading with Enter. The task chat contains screenshots. Actual 200% browser zoom was not run.

The site is project documentation. Editorial review of the application corpus and the strict application release remain separate.
