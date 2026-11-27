import { describe, expect, it } from 'vitest';
import type { CompiledKnowledge } from '../scripts/lib/knowledge-compiler';
import {
  collectSourceIds,
  describeKnowledge,
  findRecord,
  searchKnowledge,
} from '../scripts/lib/knowledge-query';

const knowledge = {
  works: [{
    id: 'lanting',
    titles: { zh: '兰亭序', en: 'Lanting Xu' },
    aliases: ['兰亭集序'],
    attribution: [{ name: '王羲之', sourceRefs: ['src-wang'] }],
  }],
  objects: [{
    id: 'witness-lanting',
    workId: 'lanting',
    titles: { zh: '兰亭序（神龙本）', en: 'Lanting (Shenlong copy)' },
    currentCollection: { placeId: 'beijing', sourceRefs: ['src-palace', 'src-nowhere'] },
  }],
  places: [{ id: 'beijing', names: { zh: '北京', en: 'Beijing' } }],
  sources: [
    { id: 'src-palace', kind: 'catalogue', title: '故宫藏品目录' },
    { id: 'src-rel', kind: 'article', title: '诗词唱和考' },
    { id: 'src-guide', kind: 'book', title: '兰亭导读所据' },
    { id: 'src-wang', kind: 'book', title: '王羲之传' },
  ],
  articles: [
    { kind: 'people', id: 'wang-xizhi', titleZh: '王羲之', titleEn: 'Wang Xizhi', sources: ['src-wang'] },
    { kind: 'works', id: 'lanting', titleZh: '兰亭序', titleEn: 'Lanting Xu', sources: ['src-guide'] },
  ],
  relations: [{ from: 'wang-xizhi', to: 'xie-an', type: 'poetic-exchange', sourceRefs: ['src-rel'] }],
  media: [],
} as unknown as CompiledKnowledge;

describe('searchKnowledge', () => {
  it('matches the ID, either title and an alias', () => {
    expect(searchKnowledge(knowledge, 'lanting').map((hit) => hit.kind + '/' + hit.id))
      .toEqual(expect.arrayContaining(['works/lanting', 'objects/witness-lanting']));
    expect(searchKnowledge(knowledge, '兰亭集序')[0].id).toBe('lanting');
    expect(searchKnowledge(knowledge, 'Shenlong copy')[0].kind).toBe('objects');
  });

  it('ignores case and accents and can be restricted to one kind', () => {
    expect(searchKnowledge(knowledge, 'BEIJING').map((hit) => hit.id)).toEqual(['beijing']);
    expect(searchKnowledge(knowledge, 'lanting', 'places')).toEqual([]);
  });

  it('returns no hits for an empty query', () => {
    expect(searchKnowledge(knowledge, '   ')).toEqual([]);
  });
});

describe('describeKnowledge', () => {
  it('attaches the authored guide and resolves every cited source', () => {
    const detail = describeKnowledge(knowledge, 'works', 'lanting')!;
    expect(detail.guide?.id).toBe('lanting');
    expect(detail.sources.map((source) => source.id).sort()).toEqual(['src-guide', 'src-wang']);
    expect(detail.missingSources).toEqual([]);
  });

  it('names a source ID the corpus does not define instead of dropping it', () => {
    const detail = describeKnowledge(knowledge, 'objects', 'witness-lanting')!;
    expect(detail.sources.map((source) => source.id)).toEqual(['src-palace']);
    expect(detail.missingSources).toEqual(['src-nowhere']);
  });

  it('carries the relations a person takes part in', () => {
    const detail = describeKnowledge(knowledge, 'people', 'wang-xizhi')!;
    expect(detail.relations).toHaveLength(1);
    expect(detail.sources.map((source) => source.id).sort()).toEqual(['src-rel', 'src-wang']);
  });

  it('returns undefined for an unknown ID', () => {
    expect(describeKnowledge(knowledge, 'works', 'missing-work')).toBeUndefined();
    expect(findRecord(knowledge, 'places', 'beijing')?.id).toBe('beijing');
  });
});

describe('collectSourceIds', () => {
  it('walks nested records and lists', () => {
    const refs = collectSourceIds({ a: [{ b: { sourceRefs: ['one', 'two'] } }], sources: ['three'] });
    expect([...refs].sort()).toEqual(['one', 'three', 'two']);
  });

  it('keeps recursing when a sources list holds objects rather than IDs', () => {
    const refs = collectSourceIds({ sources: [{ sourceRefs: ['deep'] }] });
    expect([...refs]).toEqual(['deep']);
  });
});
