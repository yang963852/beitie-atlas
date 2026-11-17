/**
 * Loads the reviewed editorial JSON at build time.
 *
 * Data files stay canonical and independent of the map provider. Nothing is
 * fetched at runtime, so the corpus is available even when every external
 * service is blocked.
 */

import mediaFile from '../../data/media.json';
import placesFile from '../../data/places.json';
import sourcesFile from '../../data/sources.json';
import type { Dataset, MediaItem, ObjectRecord, ObjectType, Place, Source, Work } from './types';
import { validateDataset, type ValidationReport } from './validate';

const workModules = import.meta.glob<unknown>('../../data/works/*.json', {
  eager: true,
  import: 'default',
});
const objectModules = import.meta.glob<unknown>('../../data/objects/*.json', {
  eager: true,
  import: 'default',
});

const OBJECT_TYPE_ORDER: ObjectType[] = [
  'original-stele',
  'cliff-inscription',
  'recarving',
  'fragment',
  'rubbing',
];

function moduleValues<T>(modules: Record<string, unknown>): T[] {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key] as T);
}

function sortObjects(objects: ObjectRecord[]): ObjectRecord[] {
  return [...objects].sort((a, b) => {
    const typeDiff =
      OBJECT_TYPE_ORDER.indexOf(a.objectType) - OBJECT_TYPE_ORDER.indexOf(b.objectType);
    if (typeDiff !== 0) return typeDiff;
    return a.id.localeCompare(b.id);
  });
}

let cached: Dataset | null = null;

export function getDataset(): Dataset {
  if (cached) return cached;
  cached = {
    works: moduleValues<Work>(workModules),
    objects: sortObjects(moduleValues<ObjectRecord>(objectModules)),
    places: placesFile.items as unknown as Place[],
    sources: sourcesFile.items as unknown as Source[],
    media: mediaFile.items as unknown as MediaItem[],
  };
  return cached;
}

/** The same validator the command-line check runs, evaluated once for the UI. */
export function getValidationReport(): ValidationReport {
  const releaseMode = import.meta.env.VITE_RELEASE_MODE === '1';
  return validateDataset(getDataset(), { releaseMode });
}

export function getWork(id: string): Work | undefined {
  return getDataset().works.find((work) => work.id === id);
}

export function getPlace(id: string | null): Place | undefined {
  if (!id) return undefined;
  return getDataset().places.find((place) => place.id === id);
}

export function getSource(id: string): Source | undefined {
  return getDataset().sources.find((source) => source.id === id);
}

export function getObject(id: string | null): ObjectRecord | undefined {
  if (!id) return undefined;
  return getDataset().objects.find((object) => object.id === id);
}

export function getObjectsForPlace(placeId: string): ObjectRecord[] {
  return getDataset().objects.filter(
    (object) =>
      object.currentCollection.placeId === placeId &&
      object.currentCollection.locationKind !== 'unknown',
  );
}

/** Objects grouped by documented collection place, used for one marker per institution. */
export function groupByPlace(objects: ObjectRecord[]): Map<string, ObjectRecord[]> {
  const groups = new Map<string, ObjectRecord[]>();
  for (const object of objects) {
    const placeId = object.currentCollection.placeId;
    if (!placeId) continue;
    if (object.currentCollection.locationKind === 'unknown') continue;
    const list = groups.get(placeId) ?? [];
    list.push(object);
    groups.set(placeId, list);
  }
  return groups;
}
