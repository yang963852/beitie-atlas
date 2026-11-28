import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AtlasTimeline } from './components/AtlasTimeline';
import { KnowledgeLibrary } from './components/KnowledgeLibrary';
import { isLibraryRoute } from './domain/library';
import { ContributionPanel } from './components/ContributionPanel';
import { JourneyMap } from './components/JourneyMap';
import { OpeningDesk } from './components/OpeningDesk';
import { MapPanel } from './components/MapPanel';
import { ObjectDetail } from './components/ObjectDetail';
import { ResultsList } from './components/ResultsList';
import { isReleaseBuild } from './domain/build';
import { EDITION_LABEL } from './domain/version';
import { getDataset, getObject, getValidationReport, hasDraftRecords } from './domain/data';
import type { StudyFilter } from './domain/types';
import { filterObjects } from './domain/search';
import { LocaleProvider, useLocale } from './i18n';
import { LocaleSwitch } from './components/LocaleSwitch';
import { buildMarkers } from './map/markers';

const OBJECT_HASH_PATTERN = /^#\/object\/([a-z0-9-]+)$/;

const JOURNEY_HASH = '#/object/yan-qinli-original-stele/journey';
function isJourneyLink() {
  return !isReleaseBuild && window.location.hash === JOURNEY_HASH;
}

const SECTION_IDS = ['results', 'map', 'detail'] as const;
type SectionId = (typeof SECTION_IDS)[number];

function revealSection(id: string, animate: boolean) {
  const section = document.getElementById(id);
  const narrow = window.matchMedia?.('(max-width: 767px)')?.matches ?? false;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  // At desktop widths all three panes are visible. Scrolling there only pushed
  // the section nav under the sticky masthead, so focus without moving the page.
  if (narrow) {
    section?.scrollIntoView?.({ behavior: animate && !reduceMotion ? 'smooth' : 'instant', block: 'start' });
  }
  section?.focus({ preventScroll: true });
}

function readObjectIdFromHash(): string | null {
  if (isJourneyLink()) return 'yan-qinli-original-stele';
  return OBJECT_HASH_PATTERN.exec(window.location.hash)?.[1] ?? null;
}

function isSectionHash(hash: string): boolean {
  return hash === '#catalogue' || SECTION_IDS.some((id) => hash === `#${id}`);
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
  const { locale, strings } = useLocale();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<StudyFilter>('all');
  const [journeyOpen, setJourneyOpen] = useState(isJourneyLink);
  const [originalsOnly, setOriginalsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(() => readObjectIdFromHash());
  /** Mobile: which of the two exploration panes is visible. Ignored by CSS above 768px. */
  const [mobilePane, setMobilePane] = useState<'list' | 'map'>(() => isJourneyLink() ? 'map' : 'list');
  /** Mobile: a record opened full width. Ignored by CSS above 768px. */
  const [detailOpen, setDetailOpen] = useState(() => !isJourneyLink() && readObjectIdFromHash() !== null);
  /** The contribution form is a page-level section; a null id means "not about one record". */
  const [contribute, setContribute] = useState<{ open: boolean; objectId: string | null }>({
    open: false,
    objectId: null,
  });

  const wideLayout = useWideLayout();
  const mapActive = wideLayout || (!detailOpen && mobilePane === 'map');
  const returnFocus = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<'detail' | 'return' | null>(null);

  useLayoutEffect(() => {
    const id = readObjectIdFromHash();
    if (SECTION_IDS.some(section => '#' + section === window.location.hash)) revealSection(window.location.hash.slice(1), false);
    if (id && getObject(id)) revealSection(isJourneyLink() ? 'map' : 'detail', false);
  }, []);

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
      if (id) {
        setCategory('all');
        setQuery('');
      }
      setSelectedId(id);
      setJourneyOpen(isJourneyLink());
      if (isJourneyLink()) setMobilePane('map');
      setDetailOpen(id !== null && !isJourneyLink());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectObject = (id: string) => {
    setSelectedId(id);
    setJourneyOpen(false);
    const next = `#/object/${id}`;
    if (window.location.hash !== next) {
      // Preserve the share link and Back history without firing the handler
      // that opens detail for external hash navigation.
      window.history.pushState(null, '', next);
    }
  };

  const openObject = (id: string) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pendingFocus.current = 'detail';
    selectObject(id);
    setDetailOpen(true);
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

    const reveal = () => revealSection(id, true);
    // The mobile pane can be hidden until the navigation update commits.
    if (wideLayout) reveal();
    else window.requestAnimationFrame(reveal);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Searching is a list activity; on mobile return to the list instead of
    // leaving a stale record covering the results.
    setDetailOpen(false);
  };

  const filtered = useMemo(() => filterObjects(dataset.objects, query, category), [dataset, query, category]);
  const mapObjects = useMemo(
    () => originalsOnly
      ? filtered.filter(({ objectType, survivalStatus }) =>
        survivalStatus === 'surviving' &&
        // A surviving fragment of the original stone is still an original, not
        // a copy. A recarving is a later stone and stays out of this filter.
        (objectType === 'original-stele' ||
          objectType === 'cliff-inscription' ||
          objectType === 'bronze-vessel' ||
          objectType === 'fragment' ||
          objectType === 'ink-manuscript'))
      : filtered,
    [filtered, originalsOnly],
  );
  const markers = useMemo(
    () => buildMarkers(dataset.places, mapObjects, locale).markers,
    [dataset, mapObjects, locale],
  );

  const activeObject = selectedId
    ? (filtered.find((object) => object.id === selectedId) ?? filtered[0] ?? null)
    : (filtered[0] ?? null);
  const canOpenJourney = !isReleaseBuild && activeObject?.id === 'yan-qinli-original-stele';
  const showJourney = () => {
    if (window.location.hash !== JOURNEY_HASH) window.history.pushState(null, '', JOURNEY_HASH);
    setJourneyOpen(true);
    goToSection('map');
    window.requestAnimationFrame(() => revealSection('map', false));
  };
  const selectedPlaceId = selectedId && activeObject?.id === selectedId
    ? markers.find((marker) => marker.objectIds.includes(selectedId))?.placeId
    : undefined;

  const sectionLink = (id: SectionId, label: string) => (
    <a
      className="topnav__link topnav__link--section"
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        goToSection(id);
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
          goToSection('results');
        }}
      >
        {strings.skipToResults}
      </a>

      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__seal" aria-hidden="true">碑</span>
            <span className="brand__zh" lang="zh-Hans">
              {strings.siteTitleZh}
            </span>
            <span className="brand__en" lang="en">
              {strings.siteTitleEn}
            </span>
          </div>

          <div className="topbar__actions">
            <LocaleSwitch />
          </div>
        </div>
      </header>

          <nav className="topnav" aria-label={strings.sectionsLabel}>
            <a className="topnav__link" href="#/library">{locale === 'zh' ? '知识库' : 'Library'}</a>
            <a className="topnav__link" href="#catalogue">{locale === 'zh' ? '历史脉络' : 'Chronology'}</a>
            <a className="topnav__link" href="#/collections">{locale === 'zh' ? '现存地图' : 'Extant map'}</a>
            <span className="topnav__sep" aria-hidden="true" />
            {sectionLink('results', strings.resultsHeading)}
            {sectionLink('map', strings.mapHeading)}
            {sectionLink('detail', strings.detailHeading)}
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

      <div id="catalogue" tabIndex={-1}>
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
            category={category}
            onCategoryChange={(value) => {
              setCategory(value);
              setDetailOpen(false);
              if (selectedId && !filterObjects(dataset.objects, query, value).some((object) => object.id === selectedId)) {
                setSelectedId(null);
                window.history.replaceState(null, '', '#results');
              }
            }}
            query={query}
            onQueryChange={handleQueryChange}
            onSelect={openObject}
          />
        </section>

        {journeyOpen && canOpenJourney && activeObject ? (
          <JourneyMap object={activeObject} active={mapActive} onClose={() => {
            selectObject(activeObject.id);
            window.requestAnimationFrame(() => revealSection('map', false));
          }} />
        ) : <MapPanel
          onJourney={canOpenJourney ? showJourney : undefined}
          markers={markers}
          objects={mapObjects}
          originalsOnly={originalsOnly}
          onOriginalsOnlyChange={setOriginalsOnly}
          onOpenObject={openObject}
          active={mapActive}
          selectedPlaceId={selectedPlaceId}
        />}

        <section
          className="pane pane--detail"
          id="detail"
          aria-label={strings.detailHeading}
          tabIndex={-1}
        >
          {activeObject ? (
            <ObjectDetail
              object={activeObject}
              onJourney={canOpenJourney ? showJourney : undefined}
              onBack={() => {
                pendingFocus.current = 'return';
                setDetailOpen(false);
              }}
              onShowMap={markers.some((marker) => marker.objectIds.includes(activeObject.id))
                ? () => {
                  setJourneyOpen(false);
                  selectObject(activeObject.id);
                  goToSection('map');
                }
                : undefined}
              onContribute={() => setContribute({ open: true, objectId: activeObject.id })}
            />
          ) : (
            <div className="detail-empty">
              <h2 className="detail-empty__title">{strings.detailEmptyTitle}</h2>
              <p className="detail-empty__body">{strings.detailEmptyBody}</p>
            </div>
          )}
        </section>
      </main>
      </div>

      {contribute.open ? <ContributionPanel
        key={contribute.objectId ?? 'general'}
        object={contribute.objectId ? (getObject(contribute.objectId) ?? null) : null}
        onClose={() => setContribute((current) => ({ ...current, open: false }))}
      /> : null}

      <footer className="footer">
        <a href="#/library">{locale === 'zh' ? '作品与书家' : 'Works and calligraphers'}</a>
        <span className="footer__note">{EDITION_LABEL[locale]}</span>
        {!isReleaseBuild && <a href="https://github.com/yang963852/beitie-atlas/issues/new?template=beta-feedback.yml">{locale === 'zh' ? '提交反馈' : 'Feedback'}</a>}
        {!isReleaseBuild && hasDraftRecords() ? <p className="footer__note">{strings.draftNotice}</p> : null}
        <p className="footer__note">{strings.footerNote}</p>
        <button
          type="button"
          className="footer__link"
          onClick={() => setContribute({ open: true, objectId: null })}
        >
          {strings.contributeFooterLink}
        </button>
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

function subscribeRoute(notify: () => void) {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
}

function Reader() {
  const { locale } = useLocale();
  const hash = useSyncExternalStore(subscribeRoute, () => window.location.hash);
  if (!hash || hash === '#') {
    function navigate(destination: string) {
      window.history.pushState(null,'',destination);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    return <main>
      <a className="skip-link" href="#catalogue">{locale === 'en' ? 'Skip to the timeline' : '直接进入时间轴'}</a>
      <OpeningDesk enter={() => navigate('#catalogue')} openPlate={() => navigate('#/object/witness-lanting')} />
    </main>;
  }
  if (hash === '#catalogue' || hash === '#/collections' || /^#\/(?:folio|transmission)\//.test(hash)) return <AtlasTimeline hash={hash} />;
  return isLibraryRoute(hash) ? <KnowledgeLibrary hash={hash} /> : <AppShell />;
}

export default function App() {
  return (
    <LocaleProvider>
      <Reader />
    </LocaleProvider>
  );
}
