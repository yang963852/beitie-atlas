import { getPlace, getWork } from './data';
import type { ObjectRecord } from './types';

/** Lowercase, strip diacritics and collapses whitespace. Chinese text is matched as-is. */
export function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches English titles, Chinese titles, aliases, catalogue numbers, and the
 * documented collection name. Traditional/simplified variants are matched only
 * when they are present in the data as aliases; the search does not guess them.
 */
export function matchesQuery(object: ObjectRecord, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;

  const work = getWork(object.workId);
  const place = getPlace(object.currentCollection.placeId);

  const haystack = [
    object.titles.zh,
    object.titles.en,
    object.catalogNumber ?? '',
    work?.titles.zh ?? '',
    work?.titles.en ?? '',
    ...(work?.aliases ?? []),
    place?.names.zh ?? '',
    place?.names.en ?? '',
  ];

  return haystack.some((value) => normalize(value).includes(needle));
}

export function filterObjects(objects: ObjectRecord[], query: string): ObjectRecord[] {
  return objects.filter((object) => matchesQuery(object, query));
}
