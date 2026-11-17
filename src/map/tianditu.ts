import { LOAD_TIMEOUT_MS, DEFAULT_VIEW, TIANDITU_SCRIPT_URL } from './config';
import type { MapAdapter, MapCallbacks, MapFailure, MapFailureCode, MapMarker } from './types';

/**
 * Minimal surface of the provider SDK that this adapter uses. Only documented
 * JavaScript API 4.0 calls are used; nothing is reverse-engineered.
 */
interface TiandituMap {
  centerAndZoom: (lnglat: unknown, zoom: number) => void;
  addOverLay: (overlay: unknown) => void;
  clearOverLays?: () => void;
  panTo?: (lnglat: unknown) => void;
  destroy?: () => void;
}

interface TiandituMarker {
  addEventListener: (type: string, handler: () => void) => void;
}

export interface TiandituNamespace {
  Map: new (container: HTMLElement | string) => TiandituMap;
  LngLat: new (longitude: number, latitude: number) => unknown;
  Marker: new (lnglat: unknown) => TiandituMarker;
}

export type TiandituSdkLoader = () => Promise<TiandituNamespace>;

declare global {
  interface Window {
    T?: TiandituNamespace;
  }
}

const SCRIPT_SELECTOR = 'script[data-map-provider="tianditu"]';

export class MapLoadError extends Error {
  readonly code: MapFailureCode;

  constructor(code: MapFailureCode, message: string) {
    super(message);
    this.name = 'MapLoadError';
    this.code = code;
  }
}

export function toMapFailure(error: unknown): MapFailure {
  if (error instanceof MapLoadError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: 'sdk-error',
    message: error instanceof Error ? error.message : 'The provider SDK failed to initialise.',
  };
}

/**
 * Provider view of a stored coordinate.
 *
 * No datum transformation is applied: the recorded WGS84 value is passed to the
 * provider unchanged. CGCS2000 and WGS84 are compatible at centimetre level
 * only under specific epoch and realisation conditions, which a secondary
 * source does not state, so this function must not claim a conversion. See
 * `docs/map-pilot.md` §"Coordinate treatment" for the sources and the limits.
 */
export function toProviderPosition(
  longitude: number,
  latitude: number,
): { longitude: number; latitude: number } {
  return { longitude, latitude };
}

let nextAttemptId = 1;
let activeAttemptId = 0;
let activePromise: Promise<TiandituNamespace> | null = null;

/** Removes provider scripts left behind by a failed attempt. */
function removeStaleScripts(): void {
  for (const node of Array.from(document.querySelectorAll<HTMLScriptElement>(SCRIPT_SELECTOR))) {
    node.remove();
  }
}

/**
 * Loads the official API script once per page session.
 *
 * A failed or timed-out attempt removes its script element, listeners, and
 * timer before rejecting, so a retry always creates a genuinely new request
 * rather than reusing a dead `<script>`. Callbacks from an earlier attempt
 * cannot settle a later promise: `settled` and the attempt id guard both.
 */
export function loadTiandituSdk(): Promise<TiandituNamespace> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new MapLoadError('sdk-error', 'No browser document is available.'));
  }
  if (window.T) return Promise.resolve(window.T);
  if (activePromise) return activePromise;

  removeStaleScripts();

  const attemptId = nextAttemptId++;

  const promise = new Promise<TiandituNamespace>((resolve, reject) => {
    let script: HTMLScriptElement | null = null;
    let timer: number | undefined;
    let settled = false;

    const settle = (error: MapLoadError | null) => {
      if (settled) return;
      settled = true;

      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
      if (script) {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
        if (error) script.remove();
        script = null;
      }
      if (activeAttemptId === attemptId) {
        activeAttemptId = 0;
        activePromise = null;
      }

      if (error) {
        reject(error);
      } else {
        resolve(window.T as TiandituNamespace);
      }
    };

    const handleLoad = () => {
      if (!window.T) {
        settle(new MapLoadError('sdk-error', 'The provider script loaded but exposed no map API.'));
        return;
      }
      settle(null);
    };

    const handleError = () => {
      settle(new MapLoadError('script-error', 'The provider script could not be fetched.'));
    };

    timer = window.setTimeout(() => {
      settle(
        new MapLoadError(
          'timeout',
          `No response from the map provider within ${LOAD_TIMEOUT_MS / 1000}s.`,
        ),
      );
    }, LOAD_TIMEOUT_MS);

    script = document.createElement('script');
    script.src = TIANDITU_SCRIPT_URL;
    script.async = true;
    script.dataset.mapProvider = 'tianditu';
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.appendChild(script);
  });

  activeAttemptId = attemptId;
  activePromise = promise;
  return promise;
}

export function createTiandituAdapter(loadSdk: TiandituSdkLoader = loadTiandituSdk): MapAdapter {
  let sdk: TiandituNamespace | null = null;
  let map: TiandituMap | null = null;
  let destroyed = false;
  const markers = new Map<string, unknown>();

  return {
    async mount(container: HTMLElement, list: MapMarker[], callbacks: MapCallbacks) {
      const loaded = await loadSdk();
      // An unmount during loading must not create a map on a dead container.
      if (destroyed) return;
      sdk = loaded;

      map = new sdk.Map(container);

      const first = list[0];
      const view = first
        ? {
            ...toProviderPosition(first.longitude, first.latitude),
            zoom: list.length === 1 ? 12 : 5,
          }
        : DEFAULT_VIEW;

      map.centerAndZoom(new sdk.LngLat(view.longitude, view.latitude), view.zoom);

      for (const item of list) {
        const point = toProviderPosition(item.longitude, item.latitude);
        const lnglat = new sdk.LngLat(point.longitude, point.latitude);
        const marker = new sdk.Marker(lnglat);
        marker.addEventListener('click', () => callbacks.onMarkerClick(item.placeId));
        map.addOverLay(marker);
        markers.set(item.placeId, lnglat);
      }
    },

    focus(placeId: string) {
      const lnglat = markers.get(placeId);
      if (!map || !lnglat) return;
      if (map.panTo) {
        map.panTo(lnglat);
      } else {
        map.centerAndZoom(lnglat, 13);
      }
    },

    destroy() {
      destroyed = true;
      try {
        map?.clearOverLays?.();
      } catch {
        /* provider cleanup is best effort */
      }
      try {
        map?.destroy?.();
      } catch {
        /* provider cleanup is best effort */
      }
      map = null;
      sdk = null;
      markers.clear();
    },
  };
}
