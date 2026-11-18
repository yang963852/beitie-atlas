import { groupCurrentLocationsByPlace } from '../domain/data';
import type { ObjectRecord, Place } from '../domain/types';
import type { MapMarker } from './types';

export interface SkippedPlace {
  place: Place;
  reason: 'no-coordinates' | 'unsupported-crs';
}

export interface MarkerBuild {
  markers: MapMarker[];
  skipped: SkippedPlace[];
}

export type MarkerLocale = 'zh' | 'en';

const PRECISION_LABEL: Record<MarkerLocale, Record<MapMarker['precision'], string>> = {
  en: { site: 'site', institution: 'institution', city: 'city', region: 'region' },
  zh: { site: '具体地点', institution: '机构', city: '城市', region: '区域' },
};

/**
 * Builds one marker per documented *current* collection place, never one per
 * object and never for a historical last-known location. A place without
 * defensible coordinates stays in the list and produces no marker.
 *
 * The grouping itself lives in `src/domain/collection.ts` so the list, the
 * popover, and the map share one rule.
 */
export function buildMarkers(
  places: Place[],
  objects: ObjectRecord[],
  locale: MarkerLocale = 'en',
): MarkerBuild {
  const groups = groupCurrentLocationsByPlace(objects);
  const markers: MapMarker[] = [];
  const skipped: SkippedPlace[] = [];

  for (const place of places) {
    const objectsHere = groups.get(place.id);
    if (!objectsHere || objectsHere.length === 0) continue;

    const coordinates = place.coordinates;
    if (!coordinates) {
      skipped.push({ place, reason: 'no-coordinates' });
      continue;
    }
    if (coordinates.crs !== 'WGS84') {
      skipped.push({ place, reason: 'unsupported-crs' });
      continue;
    }

    const count = objectsHere.length;
    markers.push({
      placeId: place.id,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      label: locale === 'zh' ? place.names.zh : place.names.en,
      sublabel:
        locale === 'zh'
          ? `${count} 条记录 · ${PRECISION_LABEL.zh[coordinates.precision]}`
          : `${count} record${count === 1 ? '' : 's'} · ${PRECISION_LABEL.en[coordinates.precision]} precision`,
      objectIds: objectsHere.map((object) => object.id),
      provisional: coordinates.verification === 'unverified',
      precision: coordinates.precision,
    });
  }

  markers.sort((a, b) => a.placeId.localeCompare(b.placeId));
  return { markers, skipped };
}
