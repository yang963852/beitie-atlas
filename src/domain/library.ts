import { getDataset } from './data';
import { dynastyOrder } from './dynasties';
import { knowledgeArticles, type KnowledgeArticle, type KnowledgeKind } from './knowledge';
import { matchesTerms } from './search';
import type { Work } from './types';

export interface LibraryEntry {
  kind: KnowledgeKind;
  id: string;
  titleZh: string;
  titleEn: string;
  guide?: KnowledgeArticle;
  work?: Work;
}

const routes = { works: 'work', people: 'person', notes: 'note' } as const;
export const libraryHref = (entry: Pick<LibraryEntry, 'kind' | 'id'>) => '#/' + routes[entry.kind] + '/' + entry.id;
export const isLibraryRoute = (hash: string) => /^#\/(?:library|work|person|note)(?:\/|$)/.test(hash);

const byKey = new Map<string, LibraryEntry>();
const dataset = getDataset();
const worksById = new Map(dataset.works.map((work) => [work.id, work]));
for (const work of dataset.works) {
  byKey.set('works/' + work.id, { kind: 'works', id: work.id, titleZh: work.titles.zh, titleEn: work.titles.en, work });
}
for (const guide of knowledgeArticles) {
  const key = guide.kind + '/' + guide.id;
  byKey.set(key, { ...byKey.get(key), kind: guide.kind, id: guide.id, titleZh: guide.titleZh, titleEn: guide.titleEn, guide });
}

const periodId = (entry: LibraryEntry) => entry.work?.dynastyId ?? entry.guide?.dynastyId;

/** A calligrapher is placed by their earliest dated work inside their own period. */
function entryYear(entry: LibraryEntry): number {
  if (entry.work) return entry.work.compositionDate.startYear ?? Infinity;
  const dynastyId = entry.guide?.dynastyId;
  if (!dynastyId) return Infinity;
  const years = (entry.guide?.works ?? []).flatMap((id) => {
    const work = worksById.get(id);
    return work && work.dynastyId === dynastyId && work.compositionDate.startYear != null
      ? [work.compositionDate.startYear]
      : [];
  });
  return years.length ? Math.min(...years) : Infinity;
}

export const libraryEntries = [...byKey.values()].sort((a, b) =>
  dynastyOrder(periodId(a)) - dynastyOrder(periodId(b)) ||
  (entryYear(a) - entryYear(b)) || 0 ||
  a.titleZh.localeCompare(b.titleZh, 'zh-Hans'));
export const findEntry = (kind: KnowledgeKind, id: string) => byKey.get(kind + '/' + id);

export function linkedEntries(entry: LibraryEntry, kind: KnowledgeKind): LibraryEntry[] {
  return libraryEntries.filter((other) => {
    if (other.kind !== kind || other === entry) return false;
    const forward = other.kind !== 'notes' && entry.guide?.[other.kind].includes(other.id);
    const reverse = entry.kind !== 'notes' && other.guide?.[entry.kind].includes(entry.id);
    return forward || reverse;
  });
}

export function matchesQuery(entry: LibraryEntry, query: string): boolean {
  const names = [entry.titleZh, entry.titleEn, entry.id, ...(entry.work?.aliases ?? [])];
  for (const person of entry.work?.attribution ?? []) names.push(person.name, person.nameEn ?? '');
  for (const id of entry.guide?.people ?? []) {
    const person = findEntry('people', id);
    if (person) names.push(person.titleZh, person.titleEn);
  }
  return matchesTerms(names, query);
}
