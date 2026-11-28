import { render, waitFor } from '@testing-library/react';
import App from '../src/App';

type WarmRoute = 'workspace' | 'library' | 'timeline';

const routeHashes: Record<WarmRoute, string> = {
  workspace: '#results',
  library: '#/library',
  timeline: '#catalogue',
};

/** A selector only the mounted route renders, never the loading fallback. */
const routeMarkers: Record<WarmRoute, string> = {
  workspace: '#results',
  library: '.reading-room',
  timeline: '.atlas-reader',
};

/**
 * Resolves the lazy route chunks once per test file.
 *
 * React caches a resolved `lazy` payload, so the first mount of each route is
 * the only asynchronous one. Warming here lets the individual tests keep
 * asserting synchronously after `render`, as they did before route splitting.
 */
export async function warmRoutes(routes: WarmRoute[] = ['workspace', 'library', 'timeline']) {
  window.localStorage.clear();
  for (const route of routes) {
    window.history.replaceState(null, '', routeHashes[route]);
    const view = render(<App />);
    await waitFor(() => {
      if (!document.querySelector(routeMarkers[route])) {
        throw new Error('route did not mount: ' + route);
      }
    }, { timeout: 60000 });
    view.unmount();
  }
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
