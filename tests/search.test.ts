import { describe, expect, it } from 'vitest';
import { getDataset } from '../src/domain/data';
import { libraryEntries, matchesQuery as matchesLibraryEntry } from '../src/domain/library';
import { filterObjects, matchesTerms, normalize, queryTerms } from '../src/domain/search';

describe('normalize', () => {
  it('folds case, accents and runs of whitespace', () => {
    expect(normalize('  Café   Ünïcode ')).toBe('cafe unicode');
  });

  it('leaves Chinese text as typed', () => {
    expect(normalize('颜勤礼碑')).toBe('颜勤礼碑');
  });
});

describe('queryTerms', () => {
  it('splits on spaces and Chinese punctuation', () => {
    expect(queryTerms('王羲之，兰亭')).toEqual(['王羲之', '兰亭']);
    expect(queryTerms('《兰亭序》')).toEqual(['兰亭序']);
    expect(queryTerms('wang  xizhi')).toEqual(['wang', 'xizhi']);
  });

  it('keeps an unsegmented Chinese string as one term', () => {
    expect(queryTerms('神龙本兰亭')).toEqual(['神龙本兰亭']);
  });

  it('returns no terms for an empty or punctuation-only query', () => {
    expect(queryTerms('')).toEqual([]);
    expect(queryTerms('   ')).toEqual([]);
    expect(queryTerms('，。、')).toEqual([]);
  });
});

describe('matchesTerms', () => {
  it('treats an empty query as no filter', () => {
    expect(matchesTerms(['anything'], '')).toBe(true);
    expect(matchesTerms(['anything'], '   ')).toBe(true);
  });

  it('does not turn a punctuation-only query into a match-everything filter', () => {
    expect(matchesTerms(['兰亭序'], '，。')).toBe(false);
  });

  it('requires every term but lets them match different fields', () => {
    const fields = ['颜真卿', '颜勤礼碑'];
    expect(matchesTerms(fields, '真卿 勤礼')).toBe(true);
    expect(matchesTerms(fields, '真卿 兰亭')).toBe(false);
  });

  it('ignores case and accents in the fields', () => {
    expect(matchesTerms(['Café Society'], 'cafe')).toBe(true);
  });
});

describe('search over the catalogue', () => {
  it('finds the 兰亭 witnesses by maker and title in one query', () => {
    const found = filterObjects(getDataset().objects, '王羲之 兰亭');
    expect(found).toHaveLength(2);
    expect(found.map((object) => object.id)).toEqual(expect.arrayContaining(['dingwu-zhan', 'witness-lanting']));
  });

  it('returns nothing when one term belongs to no record', () => {
    expect(filterObjects(getDataset().objects, '王羲之 颜勤礼碑')).toEqual([]);
  });

  it('keeps single-term matching unchanged', () => {
    expect(filterObjects(getDataset().objects, '颜勤礼碑')).toHaveLength(2);
  });

  it('applies the same terms to library entries', () => {
    const lanting = libraryEntries.find((entry) => entry.id === 'lanting')!;
    expect(matchesLibraryEntry(lanting, '王羲之 兰亭')).toBe(true);
    expect(matchesLibraryEntry(lanting, '兰亭')).toBe(true);
    expect(matchesLibraryEntry(lanting, '王羲之 颜勤礼')).toBe(false);
  });
});
