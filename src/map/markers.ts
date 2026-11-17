import { groupByPlace } from '../domain/data';
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

/**
 * Builds one marker per documented collection place, never one per object.
 * A place without defensible coordinates stays in the list and produces no marker.
 */
export function buildMarkers(places: Place[], objects: ObjectRecord[]): MarkerBuild {
  const groups = groupByPlace(objects);
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
      label: place.names.en,
      sublabel: `${count} record${count === 1 ? '' : 's'} · ${coordinates.precision} precision`,
      objectIds: objectsHere.map((object) => object.id),
      provisional: coordinates.verification === 'unverified',
      precision: coordinates.precision,
    });
  }

  markers.sort((a, b) => a.placeId.localeCompare(b.placeId));
  return { markers, skipped };
}
