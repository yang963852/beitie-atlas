import { useEffect, useMemo, useState } from 'react';
import { MapPanel } from './components/MapPanel';
import { ObjectDetail } from './components/ObjectDetail';
import { ResultsList } from './components/ResultsList';
import { isReleaseBuild } from './domain/build';
import { getDataset, getObject, getValidationReport } from './domain/data';
import { filterObjects } from './domain/search';
import { strings } from './i18n/en';
import { buildMarkers } from './map/markers';

const OBJECT_HASH_PATTERN = /^#\/object\/([a-z0-9-]+)$/;

const SECTION_IDS = ['results', 'map', 'detail'] as const;
type SectionId = (typeof SECTION_IDS)[number];

function readObjectIdFromHash(): string | null {
  return OBJECT_HASH_PATTERN.exec(window.location.hash)?.[1] ?? null;
}

function isSectionHash(hash: string): boolean {
  return SECTION_IDS.some((id) => hash === `#${id}`);
}

/**
 * Section links move focus and scroll without touching the URL hash. The hash
 * belongs to `#/object/<id>` routing; changing it here would clear the parsed
 * object on the next hashchange and break Back.
 */
function revealSection(id: SectionId): void {
  const node = document.getElementById(id);
  if (!node) return;
  const reduceMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  node.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  node.focus({ preventScroll: true });
}

export default function App() {
  const dataset = getDataset();
  const report = getValidationReport();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(() => readObjectIdFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      // A manually typed section hash must not erase an explicit selection.
      if (isSectionHash(window.location.hash)) return;
      setSelectedId(readObjectIdFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectObject = (id: string) => {
    setSelectedId(id);
    const next = `#/object/${id}`;
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
  };

  // One filtered selection drives the list, the markers, the place rows, and
  // the counts. Nothing outside this memo reads the unfiltered corpus.
  const filtered = useMemo(() => filterObjects(dataset.objects, query), [dataset, query]);
  const markers = useMemo(() => buildMarkers(dataset.places, filtered).markers, [dataset, filtered]);

  const activeObject = selectedId
    ? (getObject(selectedId) ?? filtered[0] ?? null)
    : (filtered[0] ?? null);

  const sectionLink = (id: SectionId, label: string) => (
    <a
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        revealSection(id);
      }}
    >
      {label}
    </a>
  );

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#results"
        onClick={(event) => {
          event.preventDefault();
          revealSection('results');
        }}
      >
        {strings.skipToResults}
      </a>

      <header className="masthead">
        <div className="masthead__top">
          <p className="masthead__zh" lang="zh-Hans">
            {strings.siteTitleZh}
          </p>
          <h1 className="masthead__title">{strings.siteTitleEn}</h1>
          <span className={isReleaseBuild ? 'badge badge--ok' : 'badge badge--draft'}>
            {isReleaseBuild ? strings.statusBadgeRelease : strings.statusBadge}
          </span>
        </div>
        <p className="masthead__tagline">{strings.tagline}</p>
        {isReleaseBuild ? null : <p className="masthead__notice">{strings.draftNotice}</p>}
      </header>

      <nav className="toolbar" aria-label="Sections">
        {sectionLink('results', strings.resultsHeading)}
        {sectionLink('map', strings.mapHeading)}
        {sectionLink('detail', strings.detailHeading)}
        <span className="toolbar__data">
          {strings.dataStatusOk(report.counts.objects, report.counts.events)}
        </span>
      </nav>

      {report.ok ? null : (
        <div className="alert" role="alert">
          <p className="alert__title">{strings.validationErrorTitle}</p>
          <p>{strings.validationErrorBody}</p>
          <ul>
            {report.errors.slice(0, 6).map((issue) => (
              <li key={`${issue.code}-${issue.path}`}>
                <span className="mono">{issue.code}</span> · {issue.path}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className="layout">
        <section
          className="panel panel--results"
          id="results"
          aria-label={strings.resultsHeading}
          tabIndex={-1}
        >
          <ResultsList
            objects={filtered}
            total={dataset.objects.length}
            selectedId={activeObject?.id ?? null}
            query={query}
            onQueryChange={setQuery}
            onSelect={selectObject}
          />
        </section>

        <MapPanel markers={markers} objects={filtered} onOpenObject={selectObject} />

        <section
          className="panel panel--detail"
          id="detail"
          aria-label={strings.detailHeading}
          tabIndex={-1}
        >
          {activeObject ? (
            <ObjectDetail object={activeObject} />
          ) : (
            <div className="empty-state">
              <h2 className="panel__heading">{strings.detailEmptyTitle}</h2>
              <p>{strings.detailEmptyBody}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>{strings.footerNote}</p>
        <p className="footer__meta">
          {strings.dataStatusOk(report.counts.objects, report.counts.events)}
          {report.warnings.length > 0 ? ` · ${report.warnings.length} validator warnings` : ''}
        </p>
      </footer>
    </div>
  );
}
