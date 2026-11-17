import { useEffect, useMemo, useState } from 'react';
import { MapPanel } from './components/MapPanel';
import { ObjectDetail } from './components/ObjectDetail';
import { ResultsList } from './components/ResultsList';
import { getDataset, getObject, getValidationReport } from './domain/data';
import { filterObjects } from './domain/search';
import { strings } from './i18n/en';
import { buildMarkers } from './map/markers';

const HASH_PATTERN = /^#\/object\/([a-z0-9-]+)$/;

function readObjectIdFromHash(): string | null {
  const match = HASH_PATTERN.exec(window.location.hash);
  return match?.[1] ?? null;
}

export default function App() {
  const dataset = getDataset();
  const report = getValidationReport();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(() => readObjectIdFromHash());

  useEffect(() => {
    const handleHashChange = () => setSelectedId(readObjectIdFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activeObject = selectedId ? getObject(selectedId) : dataset.objects[0];

  const selectObject = (id: string) => {
    setSelectedId(id);
    const next = `#/object/${id}`;
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
  };

  const filtered = useMemo(() => filterObjects(dataset.objects, query), [dataset, query]);
  const markers = useMemo(() => buildMarkers(dataset.places, dataset.objects).markers, [dataset]);

  return (
    <div className="app">
      <a className="skip-link" href="#results">
        {strings.skipToResults}
      </a>

      <header className="masthead">
        <div className="masthead__top">
          <p className="masthead__zh" lang="zh-Hans">
            {strings.siteTitleZh}
          </p>
          <h1 className="masthead__title">{strings.siteTitleEn}</h1>
          <span className="badge badge--draft">{strings.statusBadge}</span>
        </div>
        <p className="masthead__tagline">{strings.tagline}</p>
        <p className="masthead__notice">{strings.draftNotice}</p>
      </header>

      <nav className="toolbar" aria-label="Sections">
        <a href="#results">{strings.resultsHeading}</a>
        <a href="#map">{strings.mapHeading}</a>
        <a href="#detail">{strings.detailHeading}</a>
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
        <section className="panel panel--results" id="results" aria-label={strings.resultsHeading}>
          <ResultsList
            objects={filtered}
            total={dataset.objects.length}
            selectedId={activeObject?.id ?? null}
            query={query}
            onQueryChange={setQuery}
            onSelect={selectObject}
          />
        </section>

        <MapPanel markers={markers} objects={dataset.objects} onOpenObject={selectObject} />

        <section className="panel panel--detail" id="detail" aria-label={strings.detailHeading}>
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
