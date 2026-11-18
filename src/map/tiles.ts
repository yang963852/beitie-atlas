/**
 * Detects a basemap that loads its script but no tiles.
 *
 * The provider reports nothing in this case. A browser key restricted to another
 * origin returns 403 for every tile image, the SDK stays quiet, and the reader
 * gets markers floating over an empty box with no explanation. Watching the
 * container's images catches it without depending on provider internals, so the
 * same check works for any tile-based SDK.
 */

export interface TileWatchOptions {
  /**
   * How long to wait for a first successful tile before calling it blocked.
   * Four seconds: tiles either arrive quickly or they are refused; a longer wait
   * only prolongs the blank grid the notice exists to explain.
   */
  timeoutMs?: number;
}

/**
 * Calls `onTileFailure` at most once per mount when images are present but none
 * loads, or when at least one fails before any succeeds.
 *
 * Returns a cleanup function; call it when the map is destroyed, otherwise the
 * listeners outlive the container.
 */
export function watchTiles(
  container: HTMLElement,
  onTileFailure: () => void,
  { timeoutMs = 4000 }: TileWatchOptions = {},
): () => void {
  let loaded = 0;
  let failed = 0;
  let reported = false;

  const report = () => {
    if (reported) return;
    reported = true;
    onTileFailure();
  };

  const handleLoad = (event: Event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    loaded += 1;
  };

  const handleError = (event: Event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    failed += 1;
    if (loaded === 0) report();
  };

  // Capture phase: image load events do not bubble, so a listener on the
  // container only sees them when it listens during capture.
  container.addEventListener('load', handleLoad, true);
  container.addEventListener('error', handleError, true);

  // A silent 403 with no error event would otherwise leave the notice missing.
  const timer = globalThis.setTimeout(() => {
    if (loaded === 0 && failed > 0) report();
    else if (loaded === 0 && container.querySelectorAll('img').length > 0) report();
  }, timeoutMs);

  return () => {
    globalThis.clearTimeout(timer);
    container.removeEventListener('load', handleLoad, true);
    container.removeEventListener('error', handleError, true);
  };
}
