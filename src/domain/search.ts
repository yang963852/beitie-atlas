import { getPlace, getWork } from './data';
import type { ObjectRecord, StudyFilter } from './types';

/** Lowercase, strip diacritics and collapses whitespace. Chinese text is matched as-is. */
export function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Whitespace and punctuation separate query terms; they never have to be typed.
 *
 * An unsegmented Chinese string stays one term and is matched as a substring,
 * which is what a reader expects from a two-character title fragment. A bigram
 * index would only add ranking machinery: the library is searched by title,
 * not by full text, and the corpus is small enough that a scan is instant.
 */
const SEPARATORS = /[\s,.;:!?'"`~@#$%^&*+=_|/\\()[\]{}<>—–\-，。、；：？！《》〈〉「」『』（）【】…·]+/u;

export function queryTerms(query: string): string[] {
  return normalize(query).split(SEPARATORS).filter(Boolean);
}

/**
 * Every term must appear in some field; terms may match different fields.
 *
 * "王羲之 兰亭" therefore finds a record whose attribution names 王羲之 and
 * whose work title is 兰亭序, which a single-phrase comparison would miss.
 */
export function matchesTerms(fields: string[], query: string): boolean {
  if (!query.trim()) return true;
  const terms = queryTerms(query);
  if (terms.length === 0) return false;
  const haystack = fields.map(normalize);
  return terms.every((term) => haystack.some((field) => field.includes(term)));
}

/**
 * Searches English titles, Chinese titles, aliases, catalogue numbers, and the
 * documented collection name. Traditional/simplified variants are matched only
 * when they are present in the data as aliases; the search does not guess them.
 */
export function matchesQuery(object: ObjectRecord, query: string): boolean {
  const work = getWork(object.workId);
  const place = getPlace(object.currentCollection.placeId);

  return matchesTerms([
    object.titles.zh,
    object.titles.en,
    object.catalogNumber ?? '',
    work?.titles.zh ?? '',
    work?.titles.en ?? '',
    ...(work?.aliases ?? []),
    ...(work?.attribution.flatMap((entry) => [entry.name, entry.nameEn ?? '']) ?? []),
    place?.names.zh ?? '',
    place?.names.en ?? '',
  ], query);
}

export function filterObjects(objects: ObjectRecord[], query: string, category: StudyFilter = 'all'): ObjectRecord[] {
  return objects.filter((object) =>
    (category === 'all' || getWork(object.workId)?.studyCategory === category) && matchesQuery(object, query),
  );
}
