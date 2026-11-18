import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW } from '../src/map/config';
import type { MapMarker } from '../src/map/types';
import { computeView } from '../src/map/view';

function marker(placeId: string, longitude: number, latitude: number): MapMarker {
  return {
    placeId,
    longitude,
    latitude,
    label: placeId,
    sublabel: '',
    objectIds: [`object-${placeId}`],
    provisional: true,
    precision: 'institution',
  };
}

describe('map view', () => {
  it('falls back to the national extent when nothing is plotted', () => {
    expect(computeView([])).toEqual(DEFAULT_VIEW);
  });

  it('zooms to a building-level view for a single documented place', () => {
    expect(computeView([marker('a', 108.948333, 34.255)])).toEqual({
      longitude: 108.948333,
      latitude: 34.255,
      zoom: 12,
    });
  });

  it('frames two distant places together instead of centring on the first', () => {
    const view = computeView([
      marker('xian', 108.948333, 34.255),
      marker('beijing', 116.39083333, 39.91555556),
    ]);

    // The old behaviour centred on the first marker at a fixed zoom and hid the
    // other one; the centre now sits between them.
    expect(view.longitude).toBeCloseTo(112.6696, 3);
    expect(view.latitude).toBeCloseTo(37.0853, 3);
    expect(view.zoom).toBeGreaterThanOrEqual(4);
    expect(view.zoom).toBeLessThanOrEqual(6);
  });

  it('stays finite when two markers share one point', () => {
    const view = computeView([marker('a', 116.39, 39.92), marker('b', 116.39, 39.92)]);

    expect(Number.isFinite(view.zoom)).toBe(true);
    expect(view.zoom).toBe(12);
    expect(view.longitude).toBeCloseTo(116.39, 6);
  });
});
