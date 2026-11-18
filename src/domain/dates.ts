import type { HistoricalDate } from './types';

/**
 * Historical dates are plain signed years, not `Date` objects.
 * There is no year zero: year -1 is 1 BCE, year 1 is 1 CE.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year !== 0;
}

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

function monthName(month: number | null): string | null {
  if (month === null || month < 1 || month > 12) return null;
  return MONTHS[month - 1] ?? null;
}

export type DateLocale = 'zh' | 'en';

function formatYearZh(year: number): string {
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
}

/**
 * Human-readable label used in the UI. Never more precise than the data.
 *
 * English stays the default so command-line reports and earlier snapshots read
 * the same; the interface passes its own locale.
 */
export function formatDate(date: HistoricalDate, locale: DateLocale = 'en'): string {
  const approximate = date.certainty === 'approximate' || date.kind === 'approximate';

  if (locale === 'zh') {
    return formatDateZh(date, approximate);
  }

  const prefix = approximate ? 'c. ' : '';

  if (date.kind === 'unknown' || date.startYear === null) {
    if (date.kind === 'era' && date.eraLabel) {
      return `${date.eraLabel} (era label; year not recorded)`;
    }
    return 'Unknown';
  }

  const startMonth = date.startMonth === null ? null : monthName(date.startMonth);
  const endMonth = date.endMonth === null ? null : monthName(date.endMonth);

  if (date.startYear === date.endYear) {
    if (startMonth && endMonth && date.startMonth !== date.endMonth) {
      return `${prefix}${startMonth}–${endMonth} ${formatYear(date.startYear)}`;
    }
    if (startMonth) {
      return `${prefix}${startMonth} ${formatYear(date.startYear)}`;
    }
    return `${prefix}${formatYear(date.startYear)}`;
  }

  const end = date.endYear === null ? 'present (open interval)' : formatYear(date.endYear);
  return `${prefix}${formatYear(date.startYear)}–${end}`;
}

/**
 * Chinese wording keeps the year attached to the month, as Chinese dates are
 * read, and never invents a month that the record leaves empty.
 */
function formatDateZh(date: HistoricalDate, approximate: boolean): string {
  const prefix = approximate ? '约' : '';

  if (date.kind === 'unknown' || date.startYear === null) {
    if (date.kind === 'era' && date.eraLabel) {
      return `${date.eraLabel}（仅记年号，年份未记）`;
    }
    return '年代不详';
  }

  const startYear = date.startYear;
  const month = date.startMonth;

  if (startYear === date.endYear) {
    if (month !== null && date.endMonth !== null && date.startMonth !== date.endMonth) {
      return `${prefix}${formatYearZh(startYear)}${month}—${date.endMonth}月`;
    }
    if (month !== null) {
      return `${prefix}${formatYearZh(startYear)}${month}月`;
    }
    return `${prefix}${formatYearZh(startYear)}`;
  }

  if (date.endYear === null) {
    return `${prefix}${formatYearZh(startYear)}至今`;
  }
  return `${prefix}${formatYearZh(startYear)}—${formatYearZh(date.endYear)}`;
}

/** Sort key: unknown dates sort last instead of pretending to be year zero. */
export function dateSortValue(date: HistoricalDate): number {
  return date.startYear === null ? Number.POSITIVE_INFINITY : date.startYear;
}

export function compareDates(a: HistoricalDate, b: HistoricalDate): number {
  const diff = dateSortValue(a) - dateSortValue(b);
  if (diff !== 0) return diff;
  // Both months known: order by month. If one month is unrecorded, keep the
  // authored order instead of inventing a month for sorting.
  if (a.startMonth !== null && b.startMonth !== null) {
    return a.startMonth - b.startMonth;
  }
  return 0;
}

/** True when the record states a year at all. */
export function hasKnownYear(date: HistoricalDate): boolean {
  return date.startYear !== null;
}
