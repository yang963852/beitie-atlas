import { getDataset } from './data';
import { dynastyOrder } from './dynasties';
import { knowledgeArticles, type KnowledgeArticle, type KnowledgeKind } from './knowledge';
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
for (const work of getDataset().works) {
  byKey.set('works/' + work.id, { kind: 'works', id: work.id, titleZh: work.titles.zh, titleEn: work.titles.en, work });
}
for (const guide of knowledgeArticles) {
  const key = guide.kind + '/' + guide.id;
  byKey.set(key, { ...byKey.get(key), kind: guide.kind, id: guide.id, titleZh: guide.titleZh, titleEn: guide.titleEn, guide });
}

export const libraryEntries = [...byKey.values()].sort((a, b) =>
  dynastyOrder(a.work?.dynastyId) - dynastyOrder(b.work?.dynastyId) ||
  (a.work?.compositionDate.startYear ?? Infinity) - (b.work?.compositionDate.startYear ?? Infinity) ||
  a.titleZh.localeCompare(b.titleZh, 'zh-Hans'));
export const findEntry = (kind: KnowledgeKind, id: string) => byKey.get(kind + '/' + id);

/**
 * Curated order for the library's reading-guide strip. Works without a guide
 * are skipped, so the strip grows automatically as guides are merged. The
 * order is editorial, not chronological: start with the two existing Yan
 * Zhenqing entry points, then the ten core works in the 2026-11 guide batch.
 */
const FEATURED_WORK_ORDER = [
  'yan-qinli-bei',
  'duobao-ta-bei',
  'stone-drum-inscriptions',
  'cao-quan-bei',
  'zhangqian-bei',
  'shimen-song',
  'cuan-baozi-bei',
  'lanting',
  'wansui-tongtian-tie',
  'yugong-gong-bei',
  'xuanmi-ta-bei',
  'sanmen-ji',
  'jiuchenggong-liquan-ming',
  'shen-yinmo-dakai-jia',
  'zhao-puchu-shen-colophon',
];

export function featuredGuideEntries(limit = 20): LibraryEntry[] {
  const preferred = FEATURED_WORK_ORDER
    .map((id) => byKey.get('works/' + id))
    .filter((entry): entry is LibraryEntry => Boolean(entry?.guide));
  const rest = libraryEntries.filter(
    (entry) =>
      entry.kind === 'works' &&
      Boolean(entry.guide) &&
      !FEATURED_WORK_ORDER.includes(entry.id),
  );
  return [...preferred, ...rest].slice(0, Math.max(0, limit));
}

export function guideWorkCount(): number {
  return libraryEntries.filter((entry) => entry.kind === 'works' && Boolean(entry.guide)).length;
}

export function linkedEntries(entry: LibraryEntry, kind: KnowledgeKind): LibraryEntry[] {
  return libraryEntries.filter((other) => {
    if (other.kind !== kind || other === entry) return false;
    const forward = other.kind !== 'notes' && entry.guide?.[other.kind].includes(other.id);
    const reverse = entry.kind !== 'notes' && other.guide?.[entry.kind].includes(entry.id);
    return forward || reverse;
  });
}

export function matchesQuery(entry: LibraryEntry, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const names = [entry.titleZh, entry.titleEn, entry.id, ...(entry.work?.aliases ?? [])];
  for (const person of entry.work?.attribution ?? []) names.push(person.name, person.nameEn ?? '');
  for (const id of entry.guide?.people ?? []) {
    const person = findEntry('people', id);
    if (person) names.push(person.titleZh, person.titleEn);
  }
  return names.some((name) => name.toLowerCase().includes(needle));
}
