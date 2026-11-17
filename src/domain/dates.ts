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

/** Human-readable label used in the UI. Never more precise than the data. */
export function formatDate(date: HistoricalDate): string {
  const prefix = date.certainty === 'approximate' || date.kind === 'approximate' ? 'c. ' : '';

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
