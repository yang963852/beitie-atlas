import { DEFAULT_VIEW } from './config';
import type { MapMarker } from './types';

export interface MapView {
  longitude: number;
  latitude: number;
  zoom: number;
}

/** Zoom at which a single documented place reads as a building, not a country. */
const SINGLE_MARKER_ZOOM = 12;
const MIN_ZOOM = 4;
const MAX_ZOOM = 12;

/**
 * Chooses the initial and "show all points" view from the markers themselves.
 *
 * The previous behaviour centred on whichever marker happened to be first and
 * used a fixed zoom, so a two-city corpus could open on a point that hid the
 * other one. Nothing here is provider-specific: the adapter passes the numbers
 * to whatever SDK it wraps.
 *
 * Longitude degrees shrink with latitude, so both spans are compared in the
 * same unit before picking a zoom. A zoom is a power of two of the world width,
 * hence the logarithm; the constant trims the padding around the edges of the
 * viewport.
 */
export function computeView(markers: MapMarker[]): MapView {
  if (markers.length === 0) return { ...DEFAULT_VIEW };

  const first = markers[0];
  if (markers.length === 1 && first) {
    return { longitude: first.longitude, latitude: first.latitude, zoom: SINGLE_MARKER_ZOOM };
  }

  const longitudes = markers.map((marker) => marker.longitude);
  const latitudes = markers.map((marker) => marker.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);

  const centerLongitude = (minLongitude + maxLongitude) / 2;
  const centerLatitude = (minLatitude + maxLatitude) / 2;

  const latitudeScale = Math.max(0.2, Math.cos((centerLatitude * Math.PI) / 180));
  const longitudeSpan = (maxLongitude - minLongitude) * latitudeScale;
  const latitudeSpan = maxLatitude - minLatitude;
  // Two markers at the same point still need a finite, readable zoom.
  const span = Math.max(longitudeSpan, latitudeSpan, 0.01);

  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(Math.log2(360 / span) - 0.7)));

  return { longitude: centerLongitude, latitude: centerLatitude, zoom };
}
