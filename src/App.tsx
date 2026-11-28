import { Component, lazy, Suspense, useSyncExternalStore, type ErrorInfo, type ReactNode } from 'react';
import { OpeningDesk } from './components/OpeningDesk';
import { ProjectPage, type ProjectPageKind } from './components/ProjectPage';
import { LocaleSwitch } from './components/LocaleSwitch';
import { EDITION_LABEL } from './domain/version';
import { LocaleProvider, useLocale, type Locale } from './i18n';

/**
 * The opening desk is the first paint and stays in the entry chunk. Every route
 * that reads the compiled corpus is loaded on demand, so a reader who never
 * opens the records does not download the full text. The corpus itself lives in
 * a shared chunk imported by the three lazy routes, never by this module.
 */
const AtlasWorkspace = lazy(() => import('./AtlasApp'));
const AtlasTimeline = lazy(() =>
  import('./components/AtlasTimeline').then((module) => ({ default: module.AtlasTimeline })),
);
const KnowledgeLibrary = lazy(() =>
  import('./components/KnowledgeLibrary').then((module) => ({ default: module.KnowledgeLibrary })),
);

// Kept in step with `isLibraryRoute` in `domain/library.ts`. Importing that
// module here would pull the whole dataset back into the entry chunk.
const isLibraryRoute = (hash: string) => /^#\/(?:library|work|person|note)(?:\/|$)/.test(hash);

function isTimelineRoute(hash: string): boolean {
  return hash === '#catalogue' || hash === '#/collections' || /^#\/(?:folio|transmission)\//.test(hash);
}

/** Static reading pages: they need no corpus chunk and survive a shared link. */
function projectPageFromHash(hash: string): ProjectPageKind | null {
  if (hash === '#/about') return 'about';
  if (hash === '#/join') return 'join';
  return null;
}

/**
 * Shown while a route chunk is fetched. The masthead, the language control and
 * the edition footer are part of the entry chunk, so the reader sees a usable
 * page rather than a blank screen while the corpus arrives.
 */
function RouteFallback() {
  const { locale, strings } = useLocale();
  return (
    <div className="app" aria-busy="true">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__seal" aria-hidden="true">碑</span>
            <span className="brand__zh" lang="zh-Hans">{strings.siteTitleZh}</span>
            <span className="brand__en" lang="en">{strings.siteTitleEn}</span>
          </div>
          <div className="topbar__actions">
            <LocaleSwitch />
          </div>
        </div>
      </header>
      <main className="workspace">
        <p className="detail-empty__body" role="status">
          {locale === 'zh' ? '正在载入图录…' : 'Loading the catalogue…'}
        </p>
      </main>
      <footer className="footer">
        <span className="footer__note">{EDITION_LABEL[locale]}</span>
      </footer>
    </div>
  );
}

/**
 * A failed route chunk would otherwise blank the page: React caches the rejected
 * import, so a retry means a reload. Say so instead of leaving a white screen.
 */
class RouteErrorBoundary extends Component<
  { locale: Locale; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[beitie] route chunk failed', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const zh = this.props.locale === 'zh';
    return (
      <div className="app">
        <div className="alert" role="alert">
          <p className="alert__title">{zh ? '这一页未能载入' : 'This page could not be loaded'}</p>
          <p>
            {zh
              ? '页面资源未能载入，可能是网络中断。重新载入后再试。'
              : 'A page resource failed to load, possibly because the connection dropped. Reload to try again.'}
          </p>
          <p>
            <button type="button" className="footer__link" onClick={() => window.location.reload()}>
              {zh ? '重新载入' : 'Reload'}
            </button>
          </p>
        </div>
      </div>
    );
  }
}

function subscribeRoute(notify: () => void) {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
}

function Reader() {
  const { locale } = useLocale();
  const hash = useSyncExternalStore(subscribeRoute, () => window.location.hash);
  const projectPage = projectPageFromHash(hash);
  if (projectPage) return <ProjectPage page={projectPage} />;
  if (!hash || hash === '#') {
    function navigate(destination: string) {
      window.history.pushState(null,'',destination);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    return <main>
      <a className="skip-link" href="#/collections">{locale === 'en' ? 'Skip to the atlas' : '直接进入访碑'}</a>
      <OpeningDesk enter={() => navigate('#/collections')} openPlate={() => navigate('#/object/witness-lanting')} />
    </main>;
  }
  return (
    <RouteErrorBoundary locale={locale}>
      <Suspense fallback={<RouteFallback />}>
        {isTimelineRoute(hash)
          ? <AtlasTimeline hash={hash} />
          : isLibraryRoute(hash)
            ? <KnowledgeLibrary hash={hash} />
            : <AtlasWorkspace />}
      </Suspense>
    </RouteErrorBoundary>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <Reader />
    </LocaleProvider>
  );
}
