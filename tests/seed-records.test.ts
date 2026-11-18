import { describe, expect, it } from 'vitest';
import { getDataset } from '../src/domain/data';
import { dynastyOrder } from '../src/domain/dynasties';

describe('seed records', () => {
  const dataset = getDataset();

  it('keeps the stone and the rubbing as separate objects', () => {
    const stone = dataset.objects.find((object) => object.id === 'yan-qinli-original-stele');
    const rubbing = dataset.objects.find((object) => object.id === 'dpm-rubbing-xin00045406');

    expect(stone).toBeDefined();
    expect(rubbing).toBeDefined();
    expect(stone?.objectType).toBe('original-stele');
    expect(stone?.dimensions?.raw).toContain('268厘米');
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
  });

  it('cites a source for every collection claim', () => {
    for (const object of dataset.objects) {
      expect(object.currentCollection.sourceRefs.length).toBeGreaterThan(0);
      expect(object.currentCollection.sourceAccessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('stores canonical points in WGS84', () => {
    const coordinates = dataset.places.flatMap((place) => place.coordinates ? [place.coordinates] : []);
    expect(coordinates.length).toBeGreaterThan(0);
    for (const coordinate of coordinates) {
      expect(coordinate.crs).toBe('WGS84');
    }
  });

  it('uses https for every web source and a locator for every printed one', () => {
    for (const source of dataset.sources) {
      if (source.url) {
        expect(source.url.startsWith('https://')).toBe(true);
      } else {
        // A printed catalogue is identified by publisher, year and page; if it
        // carried neither a URL nor a locator it would not be checkable at all.
        expect(source.locator?.length ?? 0).toBeGreaterThan(0);
        expect(source.publicationDate?.length ?? 0).toBeGreaterThan(0);
      }
      expect(source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('states in both languages what each record does not know', () => {
    for (const object of dataset.objects) {
      // An empty gap list would present a draft as if it were complete.
      expect(object.notes.length).toBeGreaterThan(0);
      expect(object.notesZh?.length).toBe(object.notes.length);
    }
  });

  it('never plots a place without a cited coordinate source', () => {
    for (const place of dataset.places) {
      if (!place.coordinates) continue;
      expect(place.coordinates.sourceRefs.length).toBeGreaterThan(0);
    }
  });

  it('files every work under a period and states who is credited', () => {
    for (const work of dataset.works) {
      expect(work.dynastyId.length).toBeGreaterThan(0);
      // An empty list would read as "nobody knows"; an explicit unknown entry
      // is the only acceptable way to say that the stone names no one.
      expect(work.attribution.length).toBeGreaterThan(0);

      for (const entry of work.attribution) {
        expect(entry.sourceRefs.length).toBeGreaterThan(0);
        if (entry.role === 'unknown') {
          expect(entry.noteZh?.length ?? 0).toBeGreaterThan(0);
          expect(entry.note?.length ?? 0).toBeGreaterThan(0);
        }
      }
    }
  });

  it('orders the records by period, not by the date of each rubbing', () => {
    const order = new Map<string, number>();
    for (const work of dataset.works) order.set(work.id, dynastyOrder(work.dynastyId));

    let previous = Number.NEGATIVE_INFINITY;
    for (const object of dataset.objects) {
      const current = order.get(object.workId) ?? Number.POSITIVE_INFINITY;
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }

    // The Republican rubbing sits with its Tang stele rather than at the end.
    const ids = dataset.objects.map((object) => object.id);
    const rubbing = ids.indexOf('dpm-rubbing-xin00045406');
    const stone = ids.indexOf('yan-qinli-original-stele');
    expect(rubbing).toBeGreaterThan(stone);
    expect(rubbing - stone).toBeLessThanOrEqual(2);
  });
});
