import { describe, expect, it } from 'vitest';
import { getDataset } from '../src/domain/data';

describe('seed records', () => {
  const dataset = getDataset();

  it('keeps the stone and the rubbing as separate objects', () => {
    const stone = dataset.objects.find((object) => object.id === 'yan-qinli-original-stele');
    const rubbing = dataset.objects.find((object) => object.id === 'dpm-rubbing-xin00045406');

    expect(stone).toBeDefined();
    expect(rubbing).toBeDefined();
    expect(stone?.objectType).toBe('original-stele');
    expect(rubbing?.objectType).toBe('rubbing');
    expect(stone?.workId).toBe(rubbing?.workId);

    expect(stone?.currentCollection.placeId).toBe('place-xian-beilin-museum');
    expect(rubbing?.currentCollection.placeId).toBe('place-palace-museum');
    expect(stone?.currentCollection.placeId).not.toBe(rubbing?.currentCollection.placeId);
  });

  it('does not copy the stone’s movements into the rubbing', () => {
    const stone = dataset.objects.find((object) => object.id === 'yan-qinli-original-stele');
    const rubbing = dataset.objects.find((object) => object.id === 'dpm-rubbing-xin00045406');

    expect(stone?.provenanceEvents.map((event) => event.date.startYear)).toEqual([
      1922, 1922, 1928, 1948,
    ]);
    expect(rubbing?.provenanceEvents).toEqual([]);
  });

  it('keeps undocumented values empty instead of guessing', () => {
    const rubbing = dataset.objects.find((object) => object.id === 'dpm-rubbing-xin00045406');
    const stone = dataset.objects.find((object) => object.id === 'yan-qinli-original-stele');

    expect(rubbing?.productionDate.kind).toBe('era');
    expect(rubbing?.productionDate.startYear).toBeNull();
    expect(stone?.catalogNumber).toBeNull();
    expect(stone?.dimensions).toBeNull();
  });

  it('marks every record as a draft and cites a source for every collection claim', () => {
    for (const object of dataset.objects) {
      expect(object.review.state).toBe('draft');
      expect(object.currentCollection.sourceRefs.length).toBeGreaterThan(0);
      expect(object.currentCollection.sourceAccessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('records the institution coordinates as provisional, not verified', () => {
    const coordinates = dataset.places.flatMap((place) => (place.coordinates ? [place.coordinates] : []));
    expect(coordinates.length).toBeGreaterThan(0);
    for (const coordinate of coordinates) {
      expect(coordinate.crs).toBe('WGS84');
      expect(coordinate.verification).toBe('unverified');
      expect(coordinate.precision).toBe('institution');
    }
  });

  it('uses https for every external source', () => {
    for (const source of dataset.sources) {
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
