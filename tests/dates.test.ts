import { describe, expect, it } from 'vitest';
import { compareDates, formatDate, isValidYear } from '../src/domain/dates';
import type { HistoricalDate } from '../src/domain/types';

function date(overrides: Partial<HistoricalDate>): HistoricalDate {
  return {
    kind: 'single',
    startYear: null,
    startMonth: null,
    endYear: null,
    endMonth: null,
    eraLabel: null,
    original: null,
    certainty: 'documented',
    note: null,
    ...overrides,
  };
}

describe('historical date formatting', () => {
  it('prints a single year without inventing a day', () => {
    expect(formatDate(date({ startYear: 779, endYear: 779 }))).toBe('779');
  });

  it('prints a month and year when the source gives them', () => {
    expect(formatDate(date({ startYear: 1922, startMonth: 10, endYear: 1922, endMonth: 10 }))).toBe(
      'October 1922',
    );
  });

  it('prints a month range inside one year', () => {
    expect(
      formatDate(date({ kind: 'range', startYear: 1928, startMonth: 3, endYear: 1928, endMonth: 4 })),
    ).toBe('March–April 1928');
  });

  it('prints BCE years without a year zero', () => {
    expect(formatDate(date({ startYear: -44, endYear: -44 }))).toBe('44 BCE');
    expect(isValidYear(0)).toBe(false);
    expect(isValidYear(-44)).toBe(true);
  });

  it('keeps an era label visible instead of guessing a year', () => {
    expect(formatDate(date({ kind: 'era', eraLabel: '民国' }))).toBe(
      '民国 (era label; year not recorded)',
    );
  });

  it('reports an open-ended interval as open', () => {
    expect(formatDate(date({ kind: 'range', startYear: 1949, endYear: null }))).toBe(
      '1949–present (open interval)',
    );
  });

  it('returns Unknown rather than a placeholder year', () => {
    expect(formatDate(date({ kind: 'unknown' }))).toBe('Unknown');
  });

  it('marks approximate dates', () => {
    expect(formatDate(date({ kind: 'approximate', startYear: 1922, endYear: 1922 }))).toBe('c. 1922');
  });

  it('does not invent a month to order undated-within-year events', () => {
    const october = date({ startYear: 1922, startMonth: 10, endYear: 1922, endMonth: 10 });
    const fewDaysLater = date({ kind: 'approximate', startYear: 1922, endYear: 1922 });
    expect(compareDates(october, fewDaysLater)).toBe(0);
    expect(compareDates(fewDaysLater, october)).toBe(0);
    expect(compareDates(date({ startYear: 1928, endYear: 1928 }), october)).toBeGreaterThan(0);
  });
});

describe('Chinese date formatting', () => {
  it('keeps the year attached to the month', () => {
    expect(formatDate(date({ startYear: 779, endYear: 779 }), 'zh')).toBe('779年');
    expect(
      formatDate(date({ startYear: 1922, startMonth: 10, endYear: 1922, endMonth: 10 }), 'zh'),
    ).toBe('1922年10月');
  });

  it('prints a month range inside one year once', () => {
    expect(
      formatDate(
        date({ kind: 'range', startYear: 1928, startMonth: 3, endYear: 1928, endMonth: 4 }),
        'zh',
      ),
    ).toBe('1928年3—4月');
  });

  it('keeps the era label instead of guessing a year', () => {
    expect(formatDate(date({ kind: 'era', eraLabel: '民国' }), 'zh')).toBe(
      '民国（仅记年号，年份未记）',
    );
    expect(formatDate(date({ kind: 'unknown' }), 'zh')).toBe('年代不详');
  });

  it('marks an approximate date and an open interval', () => {
    expect(formatDate(date({ kind: 'approximate', startYear: 1922, endYear: 1922 }), 'zh')).toBe(
      '约1922年',
    );
    expect(formatDate(date({ kind: 'range', startYear: 1949, endYear: null }), 'zh')).toBe(
      '1949年至今',
    );
  });

  it('prints BCE years without a year zero', () => {
    expect(formatDate(date({ startYear: -44, endYear: -44 }), 'zh')).toBe('前44年');
  });
});
