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
import { currentPlaceId, isCurrentLocation } from './collection';
import { isReleaseBuild } from './build';
import { type Dynasty, dynastyOrder, findDynasty } from './dynasties';
import type { Dataset, MediaItem, ObjectRecord, ObjectType, Place, Source, Work } from './types';
import { validateDataset, type ValidationReport } from './validate';
import { knowledgeArticles, knowledgeRelations } from './knowledge';
import { knowledgeSourceIds } from './knowledge-types';

const workModules = import.meta.glob<unknown>('../../data/works/*.json', {
  eager: true,
  import: 'default',
});
const objectModules = import.meta.glob<unknown>('../../data/objects/*.json', {
  eager: true,
  import: 'default',
});

const OBJECT_TYPE_ORDER: ObjectType[] = [
  'ink-manuscript',
  'manuscript-copy',
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

function sortObjects(objects: ObjectRecord[], works: Work[]): ObjectRecord[] {
  const worksById = new Map(works.map((work) => [work.id, work]));

  return [...objects].sort((a, b) => {
    // Reading order is the dynasty of the stone, not the date of the paper. A
    // Republican rubbing of a Tang stele therefore sits with its own stele
    // instead of jumping to the end of the atlas.
    const workA = worksById.get(a.workId);
    const workB = worksById.get(b.workId);
    const orderA = dynastyOrder(workA?.dynastyId);
    const orderB = dynastyOrder(workB?.dynastyId);
    if (orderA !== orderB) return orderA < orderB ? -1 : 1;

    const yearA = workA?.compositionDate.startYear ?? Number.POSITIVE_INFINITY;
    const yearB = workB?.compositionDate.startYear ?? Number.POSITIVE_INFINITY;
    if (yearA !== yearB) return yearA < yearB ? -1 : 1;

    const typeDiff =
      OBJECT_TYPE_ORDER.indexOf(a.objectType) - OBJECT_TYPE_ORDER.indexOf(b.objectType);
    if (typeDiff !== 0) return typeDiff;
    return a.id.localeCompare(b.id);
  });
}

let cached: Dataset | null = null;

/**
 * Id lookups run on every row of every render, so they go through a Map built
 * once with the dataset instead of a linear `find` over an array. The corpus is
 * small today; this keeps it small in cost when it is not.
 */
interface DatasetIndex {
  works: Map<string, Work>;
  objects: Map<string, ObjectRecord>;
  places: Map<string, Place>;
  sources: Map<string, Source>;
}

function buildIndex(dataset: Dataset): DatasetIndex {
  const index: DatasetIndex = {
    works: new Map(),
    objects: new Map(),
    places: new Map(),
    sources: new Map(),
  };
  for (const work of dataset.works) index.works.set(work.id, work);
  for (const object of dataset.objects) index.objects.set(object.id, object);
  for (const place of dataset.places) index.places.set(place.id, place);
  for (const source of dataset.sources) index.sources.set(source.id, source);
  return index;
}

let index: DatasetIndex | null = null;

export function getDataset(): Dataset {
  if (cached) return cached;
  const works = moduleValues<Work>(workModules);
  cached = {
    works,
    objects: sortObjects(moduleValues<ObjectRecord>(objectModules), works),
    places: placesFile.items as unknown as Place[],
    sources: sourcesFile.items as unknown as Source[],
    media: mediaFile.items as unknown as MediaItem[],
  };
  index = buildIndex(cached);
  return cached;
}

function getIndex(): DatasetIndex {
  getDataset();
  return index as DatasetIndex;
}

/**
 * The same validator the command-line check runs, evaluated once for the UI.
 *
 * Validation walks every record, so it is memoised like the dataset: the result
 * only changes when the bundled JSON changes, which cannot happen at runtime.
 * Calling it from a component body would otherwise re-validate the whole corpus
 * on every keystroke.
 */
let cachedReport: ValidationReport | null = null;

export function getValidationReport(): ValidationReport {
  if (cachedReport) return cachedReport;
  cachedReport = validateDataset(getDataset(), {
    releaseMode: isReleaseBuild,
    knowledgeSources: knowledgeSourceIds(knowledgeArticles, knowledgeRelations),
  });
  return cachedReport;
}

export function getWork(id: string): Work | undefined {
  return getIndex().works.get(id);
}

export function getPlace(id: string | null): Place | undefined {
  if (!id) return undefined;
  return getIndex().places.get(id);
}

/** The period a work is filed under, for headers and facts. */
export function getWorkDynasty(work: Work | undefined): Dynasty | undefined {
  return work ? findDynasty(work.dynastyId) : undefined;
}

export interface DynastyGroup {
  /** Null only if a record points at an unknown or missing work. */
  dynasty: Dynasty | null;
  objects: ObjectRecord[];
}

/**
 * Consecutive groups in reading order. The input is already sorted by dynasty,
 * so this only has to split runs; records with no resolvable period fall into a
 * final group with a null dynasty rather than being dropped.
 */
export function groupObjectsByDynasty(objects: ObjectRecord[]): DynastyGroup[] {
  const groups: DynastyGroup[] = [];
  const byKey = new Map<string, DynastyGroup>();

  for (const object of objects) {
    const work = getWork(object.workId);
    const dynasty = getWorkDynasty(work);
    const key = dynasty?.id ?? '__unknown__';
    let group = byKey.get(key);
    if (!group) {
      group = { dynasty: dynasty ?? null, objects: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.objects.push(object);
  }

  return groups;
}

export function getSource(id: string): Source | undefined {
  return getIndex().sources.get(id);
}

export function getObject(id: string | null): ObjectRecord | undefined {
  if (!id) return undefined;
  return getIndex().objects.get(id);
}

/** Objects whose documented current collection is this place. */
export function objectsAtCurrentPlace(objects: ObjectRecord[], placeId: string): ObjectRecord[] {
  return objects.filter((object) => currentPlaceId(object) === placeId);
}

/** Objects grouped by a current collection place, used for one marker per institution. */
export function groupCurrentLocationsByPlace(objects: ObjectRecord[]): Map<string, ObjectRecord[]> {
  const groups = new Map<string, ObjectRecord[]>();
  for (const object of objects) {
    const placeId = currentPlaceId(object);
    if (!placeId) continue;
    const list = groups.get(placeId) ?? [];
    list.push(object);
    groups.set(placeId, list);
  }
  return groups;
}

export interface LocationPartition {
  /** Current collection places that can carry a map marker. */
  byPlace: Map<string, ObjectRecord[]>;
  /** Historical "was there at some date" claims: readable, never a current marker. */
  lastKnown: ObjectRecord[];
  /** No location claim at all. */
  unknown: ObjectRecord[];
  /** A current claim whose place is missing from the corpus or has no coordinates. */
  currentWithoutPoint: ObjectRecord[];
}

/**
 * Splits records by what their location assertion actually says, so that the
 * map, the location list, and the record list cannot disagree about which
 * objects are at a place today.
 *
 * `places` is passed in rather than read from the module cache so the rule can
 * be tested against a controlled corpus.
 */
export function partitionByLocation(
  objects: ObjectRecord[],
  places: Place[],
): LocationPartition {
  const byPlace = new Map<string, ObjectRecord[]>();
  const lastKnown: ObjectRecord[] = [];
  const unknown: ObjectRecord[] = [];
  const currentWithoutPoint: ObjectRecord[] = [];
  const placesById = new Map(places.map((place) => [place.id, place]));

  for (const object of objects) {
    const collection = object.currentCollection;
    if (!isCurrentLocation(collection)) {
      if (collection.locationKind === 'last-known') lastKnown.push(object);
      else unknown.push(object);
      continue;
    }

    const place = collection.placeId ? placesById.get(collection.placeId) : undefined;
    if (!place || !place.coordinates) {
      currentWithoutPoint.push(object);
      continue;
    }

    const list = byPlace.get(place.id) ?? [];
    list.push(object);
    byPlace.set(place.id, list);
  }

  return { byPlace, lastKnown, unknown, currentWithoutPoint };
}
