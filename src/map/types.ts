/**
 * The map boundary. The rest of the application knows nothing about the
 * provider; swapping or removing the map must not affect the corpus.
 *
 * Marker positions are the record's stored WGS84 values. The adapter passes
 * them to the provider unchanged; no datum transformation is applied or
 * claimed. See `docs/map-pilot.md` §3.
 */

export interface MapMarker {
  placeId: string;
  /** WGS84 longitude, decimal degrees. */
  longitude: number;
  /** WGS84 latitude, decimal degrees. */
  latitude: number;
  label: string;
  sublabel: string;
  objectIds: string[];
  /** True when the point comes from a secondary source and is not institution-verified. */
  provisional: boolean;
  precision: 'site' | 'institution' | 'city' | 'region';
}

export type MapFailureCode = 'missing-key' | 'script-error' | 'timeout' | 'sdk-error';

export interface MapFailure {
  code: MapFailureCode;
  message: string;
}

export interface MapCallbacks {
  onMarkerClick: (placeId: string) => void;
}

export interface MapAdapter {
  mount(container: HTMLElement, markers: MapMarker[], callbacks: MapCallbacks): Promise<void>;
  focus: (placeId: string) => void;
  /** Frame every mounted marker; used by the "show all points" control. */
  fit: () => void;
  destroy: () => void;
}
