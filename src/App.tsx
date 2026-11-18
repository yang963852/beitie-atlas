import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPanel } from './components/MapPanel';
import { ObjectDetail } from './components/ObjectDetail';
import { ResultsList } from './components/ResultsList';
import { isReleaseBuild } from './domain/build';
import { getDataset, getValidationReport } from './domain/data';
import { filterObjects } from './domain/search';
import { LocaleProvider, useLocale, type Locale } from './i18n';
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
 * Desktop always shows the map pane. On mobile it is one of two exploration
 * panes, so the provider must not mount into a hidden zero-height container.
 * Without `matchMedia` (test environment) assume the wide layout.
 */
function useWideLayout(): boolean {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia?.(query)?.matches ?? true);

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const update = () => setWide(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return wide;
}

function AppShell() {
  const dataset = getDataset();
  const report = getValidationReport();
  const { locale, strings, setLocale } = useLocale();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(() => readObjectIdFromHash());
  /** Mobile: which of the two exploration panes is visible. Ignored by CSS above 768px. */
  const [mobilePane, setMobilePane] = useState<'list' | 'map'>('list');
  /** Mobile: a record opened full width. Ignored by CSS above 768px. */
  const [detailOpen, setDetailOpen] = useState(() => readObjectIdFromHash() !== null);

  const wideLayout = useWideLayout();
  const mapActive = wideLayout || (!detailOpen && mobilePane === 'map');
  const returnFocus = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<'detail' | 'return' | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (wideLayout || !target) return;
    if (target === 'detail') {
      document.getElementById('detail')?.focus();
    } else if (returnFocus.current?.getClientRects().length) {
      returnFocus.current.focus();
    } else {
      document.getElementById(mobilePane === 'map' ? 'map' : 'results')?.focus();
    }
  }, [detailOpen, mobilePane, wideLayout]);

  useEffect(() => {
    const handleHashChange = () => {
      // A manually typed section hash must not erase an explicit selection.
      if (isSectionHash(window.location.hash)) return;
      const id = readObjectIdFromHash();
      setSelectedId(id);
      setDetailOpen(id !== null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectObject = (id: string) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pendingFocus.current = 'detail';
    setSelectedId(id);
    setDetailOpen(true);
    const next = `#/object/${id}`;
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
  };

  /**
   * Section links move focus and scroll without touching the URL hash. The hash
   * belongs to `#/object/<id>` routing; changing it here would clear the parsed
   * object on the next hashchange and break Back.
   */
  const goToSection = (id: SectionId) => {
    if (id === 'detail') {
      setDetailOpen(true);
    } else {
      setDetailOpen(false);
      setMobilePane(id === 'map' ? 'map' : 'list');
    }

    const node = document.getElementById(id);
    if (!node) return;
    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    node.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    node.focus({ preventScroll: true });
    // A pane that was hidden by the mobile switch becomes focusable only after
    // the state change renders; retry once without changing the outcome.
    window.requestAnimationFrame?.(() => {
      if (document.activeElement !== node) node.focus({ preventScroll: true });
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Searching is a list activity; on mobile return to the list instead of
    // leaving a stale record covering the results.
    setDetailOpen(false);
  };

  // One filtered selection drives the list, the markers, the place rows, and
  // the counts. Nothing outside this memo reads the unfiltered corpus.
  const filtered = useMemo(() => filterObjects(dataset.objects, query), [dataset, query]);
  const markers = useMemo(
    () => buildMarkers(dataset.places, filtered, locale).markers,
    [dataset, filtered, locale],
  );

  const activeObject = selectedId
    ? (filtered.find((object) => object.id === selectedId) ?? filtered[0] ?? null)
    : (filtered[0] ?? null);
  const selectedPlaceId = selectedId && activeObject?.id === selectedId
    ? markers.find((marker) => marker.objectIds.includes(selectedId))?.placeId
    : undefined;

  const sectionLink = (id: SectionId, label: string) => (
    <a
      className="topnav__link"
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        goToSection(id);
      }}
    >
      {label}
    </a>
  );

  const localeButton = (value: Locale, label: string) => (
    <button
      type="button"
      className="langswitch__button"
      aria-pressed={locale === value}
      onClick={() => setLocale(value)}
    >
      {label}
    </button>
  );

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#results"
        onClick={(event) => {
          event.preventDefault();
          goToSection('results');
        }}
      >
        {strings.skipToResults}
      </a>

      <header className="topbar">
        <div className="topbar__inner">
          <h1 className="brand">
            <span className="brand__zh" lang="zh-Hans">
              {strings.siteTitleZh}
            </span>
            <span className="brand__en" lang="en">
              {strings.siteTitleEn}
            </span>
          </h1>

          <nav className="topnav" aria-label={strings.sectionsLabel}>
            {sectionLink('results', strings.resultsHeading)}
            {sectionLink('map', strings.mapHeading)}
            {sectionLink('detail', strings.detailHeading)}
          </nav>

          <div className="topbar__actions">
            <div className="langswitch" role="group" aria-label={strings.languageLabel}>
              {localeButton('zh', strings.languageZh)}
              {localeButton('en', strings.languageEn)}
            </div>
            <span className={isReleaseBuild ? 'chip chip--ok' : 'chip'}>
              {isReleaseBuild ? strings.statusBadgeRelease : strings.statusBadge}
            </span>
          </div>
        </div>
      </header>

      <div className="intro">
        <p className="intro__lede">{strings.tagline}</p>
        <p className="intro__detail">{strings.taglineDetail}</p>
        {isReleaseBuild ? null : <p className="intro__notice">{strings.draftNotice}</p>}
      </div>

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

      {/* A record is a pushed view on mobile: the list/map switch belongs to the
          exploration level, and "Back to records" is the way out. */}
      {detailOpen ? null : (
        <div className="viewswitch" role="group" aria-label={strings.mobileViewLabel}>
          <button
            type="button"
            className="viewswitch__button"
            aria-pressed={mobilePane === 'list'}
            onClick={() => {
              setMobilePane('list');
              setDetailOpen(false);
            }}
          >
            {strings.mobileListView}
          </button>
          <button
            type="button"
            className="viewswitch__button"
            aria-pressed={mobilePane === 'map'}
            onClick={() => {
              setMobilePane('map');
              setDetailOpen(false);
            }}
          >
            {strings.mobileMapView}
          </button>
        </div>
      )}

      <main className="workspace" data-mobile-view={detailOpen ? 'detail' : mobilePane}>
        <section
          className="pane pane--results"
          id="results"
          aria-label={strings.resultsHeading}
          tabIndex={-1}
        >
          <ResultsList
            objects={filtered}
            total={dataset.objects.length}
            selectedId={activeObject?.id ?? null}
            query={query}
            onQueryChange={handleQueryChange}
            onSelect={selectObject}
          />
        </section>

        <MapPanel
          markers={markers}
          objects={filtered}
          onOpenObject={selectObject}
          active={mapActive}
          selectedPlaceId={selectedPlaceId}
        />

        <section
          className="pane pane--detail"
          id="detail"
          aria-label={strings.detailHeading}
          tabIndex={-1}
        >
          {activeObject ? (
            <ObjectDetail
              object={activeObject}
              onBack={() => {
                pendingFocus.current = 'return';
                setDetailOpen(false);
              }}
              onShowMap={markers.some((marker) => marker.objectIds.includes(activeObject.id))
                ? () => {
                  selectObject(activeObject.id);
                  pendingFocus.current = null;
                  goToSection('map');
                }
                : undefined}
            />
          ) : (
            <div className="detail-empty">
              <h2 className="detail-empty__title">{strings.detailEmptyTitle}</h2>
              <p className="detail-empty__body">{strings.detailEmptyBody}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p className="footer__note">{strings.footerNote}</p>
        <details className="footer__details">
          <summary>{strings.buildInfoLabel}</summary>
          <p>
            {strings.buildInfoOk(
              report.counts.objects,
              report.counts.events,
              report.warnings.length,
            )}
          </p>
        </details>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  );
}
