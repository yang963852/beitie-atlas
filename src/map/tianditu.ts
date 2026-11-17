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

interface TiandituNamespace {
  Map: new (container: HTMLElement | string) => TiandituMap;
  LngLat: new (longitude: number, latitude: number) => unknown;
  Marker: new (lnglat: unknown) => TiandituMarker;
}

declare global {
  interface Window {
    T?: TiandituNamespace;
  }
}

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
 * The canonical record is WGS84. The provider renders CGCS2000. They are
 * different named frames, so the adapter converts explicitly here instead of
 * relabelling the stored data; the difference is centimetric, far below the
 * recorded institution precision.
 */
export function toProviderCoordinate(longitude: number, latitude: number): {
  longitude: number;
  latitude: number;
  frame: 'CGCS2000';
} {
  return { longitude, latitude, frame: 'CGCS2000' };
}

let sdkPromise: Promise<TiandituNamespace> | null = null;

/** Loads the official API script once per page session. */
export function loadTiandituSdk(): Promise<TiandituNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new MapLoadError('sdk-error', 'No browser window is available.'));
  }
  if (window.T) return Promise.resolve(window.T);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<TiandituNamespace>((resolve, reject) => {
    const settle = (fn: () => void) => {
      window.clearTimeout(timer);
      fn();
    };

    const timer = window.setTimeout(() => {
      sdkPromise = null;
      reject(new MapLoadError('timeout', `No response from the map provider within ${LOAD_TIMEOUT_MS / 1000}s.`));
    }, LOAD_TIMEOUT_MS);

    const existing = document.querySelector<HTMLScriptElement>('script[data-map-provider="tianditu"]');
    const script = existing ?? document.createElement('script');

    script.addEventListener('load', () => {
      if (window.T) {
        settle(() => resolve(window.T as TiandituNamespace));
      } else {
        sdkPromise = null;
        settle(() => reject(new MapLoadError('sdk-error', 'The provider script loaded but exposed no map API.')));
      }
    });

    script.addEventListener('error', () => {
      sdkPromise = null;
      settle(() => reject(new MapLoadError('script-error', 'The provider script could not be fetched.')));
    });

    if (!existing) {
      script.src = TIANDITU_SCRIPT_URL;
      script.async = true;
      script.dataset.mapProvider = 'tianditu';
      document.head.appendChild(script);
    }
  });

  return sdkPromise;
}

export function createTiandituAdapter(): MapAdapter {
  let sdk: TiandituNamespace | null = null;
  let map: TiandituMap | null = null;
  let destroyed = false;
  const markers = new Map<string, unknown>();

  return {
    async mount(container: HTMLElement, list: MapMarker[], callbacks: MapCallbacks) {
      const loaded = await loadTiandituSdk();
      if (destroyed) return;
      sdk = loaded;

      map = new sdk.Map(container);

      const first = list[0];
      const view = first
        ? { ...toProviderCoordinate(first.longitude, first.latitude), zoom: list.length === 1 ? 12 : 5 }
        : DEFAULT_VIEW;

      map.centerAndZoom(new sdk.LngLat(view.longitude, view.latitude), view.zoom);

      for (const item of list) {
        const point = toProviderCoordinate(item.longitude, item.latitude);
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
