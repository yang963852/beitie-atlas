import { describe, expect, it } from 'vitest';
import type { ObjectRecord, Place } from '../src/domain/types';
import { buildMarkers } from '../src/map/markers';
import { MapLoadError, toMapFailure } from '../src/map/tianditu';

const coords = {
  longitude: 108.94,
  latitude: 34.25,
  crs: 'WGS84' as const,
  precision: 'institution' as const,
  sourceRefs: ['src-1'],
  method: 'secondary-database' as const,
  verification: 'unverified' as const,
  note: null,
};

function place(id: string, withCoordinates: boolean): Place {
  return {
    id,
    names: { zh: id, en: id },
    historicalName: null,
    kind: 'institution',
    coordinates: withCoordinates ? coords : null,
    sourceRefs: ['src-1'],
    notes: [],
  };
}

function object(id: string, placeId: string | null, locationKind = 'collection-institution'): ObjectRecord {
  return {
    id,
    currentCollection: { placeId, locationKind },
  } as unknown as ObjectRecord;
}

describe('marker building', () => {
  it('creates one marker per institution and keeps both objects on it', () => {
    const result = buildMarkers(
      [place('place-a', true)],
      [object('object-1', 'place-a'), object('object-2', 'place-a')],
    );

    expect(result.markers).toHaveLength(1);
    expect(result.markers[0]?.objectIds).toEqual(['object-1', 'object-2']);
    expect(result.markers[0]?.provisional).toBe(true);
  });

  it('produces no marker for a place without coordinates and says why', () => {
    const result = buildMarkers([place('place-b', false)], [object('object-3', 'place-b')]);

    expect(result.markers).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]?.reason).toBe('no-coordinates');
  });

  it('ignores objects whose location is unknown', () => {
    const result = buildMarkers(
      [place('place-c', true)],
      [object('object-4', 'place-c', 'unknown')],
    );

    expect(result.markers).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('map failure mapping', () => {
  it('preserves a timeout code for the interface', () => {
    expect(toMapFailure(new MapLoadError('timeout', 'no response')).code).toBe('timeout');
    expect(toMapFailure(new MapLoadError('script-error', 'blocked')).code).toBe('script-error');
    expect(toMapFailure(new Error('boom')).code).toBe('sdk-error');
  });
});
