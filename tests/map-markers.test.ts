import { describe, expect, it } from 'vitest';
import { currentPlaceId, isCurrentLocationKind } from '../src/domain/collection';
import { groupObjectsByProvince, objectsAtCurrentPlace, partitionByLocation } from '../src/domain/data';
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

function object(
  id: string,
  placeId: string | null,
  locationKind: ObjectRecord['currentCollection']['locationKind'] = 'collection-institution',
): ObjectRecord {
  return {
    id,
    currentCollection: { placeId, locationKind },
  } as unknown as ObjectRecord;
}

describe('current location rule', () => {
  it('accepts only present-day collection and in-situ assertions', () => {
    expect(isCurrentLocationKind('collection-institution')).toBe(true);
    expect(isCurrentLocationKind('in-situ')).toBe(true);
    expect(isCurrentLocationKind('last-known')).toBe(false);
    expect(isCurrentLocationKind('unknown')).toBe(false);
  });

  it('returns no current place for a last-known or unknown claim', () => {
    expect(currentPlaceId(object('o1', 'place-a', 'collection-institution'))).toBe('place-a');
    expect(currentPlaceId(object('o2', 'place-a', 'in-situ'))).toBe('place-a');
    expect(currentPlaceId(object('o3', 'place-a', 'last-known'))).toBeNull();
    expect(currentPlaceId(object('o4', 'place-a', 'unknown'))).toBeNull();
  });
});

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

  it('never turns a last-known location into a current collection marker', () => {
    const objects = [object('object-5', 'place-c', 'last-known')];
    const result = buildMarkers([place('place-c', true)], objects);
    const partition = partitionByLocation(objects, [place('place-c', true)]);

    expect(result.markers).toHaveLength(0);
    expect(objectsAtCurrentPlace(objects, 'place-c')).toEqual([]);
    expect(partition.lastKnown.map((entry) => entry.id)).toEqual(['object-5']);
    expect(partition.byPlace.size).toBe(0);
  });

  it('keeps a current claim without coordinates readable but unplotted', () => {
    const objects = [object('object-6', 'place-d')];
    const result = buildMarkers([place('place-d', false)], objects);
    const partition = partitionByLocation(objects, [place('place-d', false)]);

    expect(result.markers).toHaveLength(0);
    expect(result.skipped[0]?.reason).toBe('no-coordinates');
    expect(partition.currentWithoutPoint.map((entry) => entry.id)).toEqual(['object-6']);
  });

  it('separates current, last-known, unknown, and missing-place records', () => {
    const objects = [
      object('current', 'place-a'),
      object('historical', 'place-a', 'last-known'),
      object('unknown', null, 'unknown'),
      object('no-place', null, 'collection-institution'),
    ];
    const partition = partitionByLocation(objects, [place('place-a', true)]);

    expect(Array.from(partition.byPlace.keys())).toEqual(['place-a']);
    expect(partition.byPlace.get('place-a')?.map((entry) => entry.id)).toEqual(['current']);
    expect(partition.lastKnown.map((entry) => entry.id)).toEqual(['historical']);
    expect(partition.unknown.map((entry) => entry.id)).toEqual(['unknown']);
    expect(partition.currentWithoutPoint.map((entry) => entry.id)).toEqual(['no-place']);
    expect(objectsAtCurrentPlace(objects, 'place-a').map((entry) => entry.id)).toEqual(['current']);
  });
});

describe('province grouping', () => {
  function provincePlace(id: string, province: Place['province']): Place {
    return { ...place(id, true), province };
  }

  it('groups current objects by province and keeps unplaced records separate', () => {
    const places = [
      provincePlace('place-shaanxi-a', 'shaanxi'),
      provincePlace('place-beijing-a', 'beijing'),
      { ...place('place-no-province', true), province: null },
    ];
    const objects = [
      object('o-shaanxi', 'place-shaanxi-a'),
      object('o-beijing', 'place-beijing-a'),
      object('o-unplaced', 'place-shaanxi-a', 'last-known'),
      object('o-unknown', 'place-no-province'),
    ];

    const groups = groupObjectsByProvince(objects, places);

    expect(groups.map((group) => group.key)).toEqual(['beijing', 'shaanxi', 'unknown', 'unplaced']);
    expect(groups.find((group) => group.key === 'shaanxi')?.objects.map((entry) => entry.id)).toEqual(['o-shaanxi']);
    expect(groups.find((group) => group.key === 'beijing')?.places[0]?.place.id).toBe('place-beijing-a');
    expect(groups.find((group) => group.key === 'unknown')?.objects.map((entry) => entry.id)).toEqual(['o-unknown']);
    expect(groups.find((group) => group.key === 'unplaced')?.objects.map((entry) => entry.id)).toEqual(['o-unplaced']);
  });
});

describe('map failure mapping', () => {
  it('preserves a timeout code for the interface', () => {
    expect(toMapFailure(new MapLoadError('timeout', 'no response')).code).toBe('timeout');
    expect(toMapFailure(new MapLoadError('script-error', 'blocked')).code).toBe('script-error');
    expect(toMapFailure(new Error('boom')).code).toBe('sdk-error');
  });
});
