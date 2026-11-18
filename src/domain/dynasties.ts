/**
 * The reading order of an atlas of steles.
 *
 * `order` is explicit rather than derived from `startYear`, because several
 * periods overlap: the Liao began in 907, before the Northern Song in 960, yet a
 * Chinese stele sequence lists the Song first. Dates are only used to sanity
 * check that a record was filed under a period that could contain it.
 *
 * A work is filed under the period that carved it. A Republican-era rubbing of a
 * Tang stele stays under the Tang, because the stele — not the paper — is what
 * the reader is following.
 */

import type { DynastyId } from './types';

export interface Dynasty {
  id: DynastyId;
  zh: string;
  en: string;
  /** First year of the period, negative for BCE. Informational. */
  startYear: number;
  /** Last year of the period; null for a period that is still running. */
  endYear: number | null;
  order: number;
}

export const DYNASTIES: Dynasty[] = [
  { id: 'pre-qin', zh: '先秦', en: 'Pre-Qin', startYear: -1046, endYear: -222, order: 10 },
  { id: 'qin', zh: '秦', en: 'Qin', startYear: -221, endYear: -207, order: 20 },
  { id: 'western-han', zh: '西汉', en: 'Western Han', startYear: -202, endYear: 8, order: 30 },
  { id: 'xin', zh: '新', en: 'Xin', startYear: 9, endYear: 23, order: 40 },
  { id: 'eastern-han', zh: '东汉', en: 'Eastern Han', startYear: 25, endYear: 220, order: 50 },
  { id: 'three-kingdoms', zh: '三国', en: 'Three Kingdoms', startYear: 220, endYear: 280, order: 60 },
  { id: 'western-jin', zh: '西晋', en: 'Western Jin', startYear: 265, endYear: 316, order: 70 },
  { id: 'eastern-jin', zh: '东晋', en: 'Eastern Jin', startYear: 317, endYear: 420, order: 80 },
  {
    id: 'northern-and-southern',
    zh: '南北朝',
    en: 'Northern and Southern Dynasties',
    startYear: 420,
    endYear: 589,
    order: 90,
  },
  { id: 'sui', zh: '隋', en: 'Sui', startYear: 581, endYear: 618, order: 100 },
  { id: 'tang', zh: '唐', en: 'Tang', startYear: 618, endYear: 907, order: 110 },
  {
    id: 'five-dynasties',
    zh: '五代十国',
    en: 'Five Dynasties and Ten Kingdoms',
    startYear: 907,
    endYear: 979,
    order: 120,
  },
  {
    id: 'northern-song',
    zh: '北宋',
    en: 'Northern Song',
    startYear: 960,
    endYear: 1127,
    order: 130,
  },
  { id: 'liao', zh: '辽', en: 'Liao', startYear: 907, endYear: 1125, order: 135 },
  {
    id: 'southern-song',
    zh: '南宋',
    en: 'Southern Song',
    startYear: 1127,
    endYear: 1279,
    order: 140,
  },
  { id: 'jin', zh: '金', en: 'Jin', startYear: 1115, endYear: 1234, order: 145 },
  { id: 'yuan', zh: '元', en: 'Yuan', startYear: 1271, endYear: 1368, order: 150 },
  { id: 'ming', zh: '明', en: 'Ming', startYear: 1368, endYear: 1644, order: 160 },
  { id: 'qing', zh: '清', en: 'Qing', startYear: 1644, endYear: 1912, order: 170 },
  { id: 'republic', zh: '民国', en: 'Republican period', startYear: 1912, endYear: 1949, order: 180 },
  {
    id: 'prc',
    zh: '中华人民共和国',
    en: "People's Republic of China",
    startYear: 1949,
    endYear: null,
    order: 190,
  },
];

const BY_ID = new Map<string, Dynasty>(DYNASTIES.map((dynasty) => [dynasty.id, dynasty]));

export function isDynastyId(value: unknown): value is DynastyId {
  return typeof value === 'string' && BY_ID.has(value);
}

export function getDynasty(id: DynastyId): Dynasty {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown dynasty id: ${id}`);
  return found;
}

export function findDynasty(id: string | null | undefined): Dynasty | undefined {
  if (!id) return undefined;
  return BY_ID.get(id);
}

/** Unknown ids sort last instead of throwing, so a bad record cannot hide the list. */
export function dynastyOrder(id: string | null | undefined): number {
  return findDynasty(id)?.order ?? Number.POSITIVE_INFINITY;
}

export function dynastyLabel(
  id: DynastyId,
  locale: 'zh' | 'en',
  qualifier: string | null = null,
): string {
  const dynasty = BY_ID.get(id);
  if (!dynasty) return id;
  const base = locale === 'zh' ? dynasty.zh : dynasty.en;
  return qualifier && locale === 'zh' ? `${base} · ${qualifier}` : base;
}

/**
 * True when a year falls inside the named period. Used only as a warning: an
 * approximate or disputed date near a border should not block a build.
 */
export function yearInDynasty(year: number, id: DynastyId): boolean {
  const dynasty = BY_ID.get(id);
  if (!dynasty) return false;
  if (year < dynasty.startYear) return false;
  return dynasty.endYear === null || year <= dynasty.endYear;
}
