import { describe, expect, it } from 'vitest';
import { readCompiledKnowledge } from '../scripts/lib/knowledge-compiler';

import { readClaims, readPlace } from '../scripts/lib/knowledge-schema';

const compiled = readCompiledKnowledge(process.cwd());
const work = (id: string) => compiled.works.find((item) => item.id === id)!;
const object = (id: string) => compiled.objects.find((item) => item.id === id)!;

describe('five worked examples', () => {
  it('keeps the Yan Qinli discovery on the original stone only', () => {
    const stone = object('yan-qinli-original-stele');
    const rubbing = object('dpm-rubbing-xin00045406');
    expect(stone.provenanceEvents.map((event) => event.id)).toContain('ev-1922-discovery');
    expect(rubbing.provenanceEvents.map((event) => event.id)).not.toContain('ev-1922-discovery');
    expect(rubbing.productionDate.eraLabel).toBe('民国');
    expect(rubbing.productionDate.startYear).toBeNull();
  });

  it('shows the two Jizhi colophon years with separate evidence and no transfer place', () => {
    const scroll = object('witness-jizhi');
    const years = scroll.provenanceEvents
      .filter((event) => event.id.startsWith('witness-jizhi-acquisition'))
      .map((event) => ({ year: event.date.startYear, sources: event.sourceRefs, place: event.placeId }));
    expect(years).toEqual([
      { year: 1282, sources: ['src-jizhi-colophon-bingxu'], place: null },
      { year: 1283, sources: ['src-jizhi-colophon-wuzi'], place: null },
    ]);
    expect(scroll.claims?.some((claim) => claim.predicate === 'event-grouping')).toBe(true);
  });

  it('separates the Shenlong and Dingwu versions and records the disputed copyist', () => {
    const shenlong = object('witness-lanting');
    const dingwu = object('dingwu-zhan');
    expect(shenlong.version?.label).toBe('神龙本');
    expect(dingwu.version?.label).toBe('定武本');
    expect(shenlong.attribution?.some((entry) => entry.role === 'copyist' && entry.certainty === 'disputed')).toBe(true);
    expect(shenlong.claims?.some((claim) => claim.stance === 'supports')).toBe(true);
    expect(shenlong.claims?.some((claim) => claim.stance === 'questions')).toBe(true);
  });

  it('records Weng Fanggang as a sourced opinion rather than seven calligraphers', () => {
    const stone = object('stele-liqi');
    expect(object('liqi-ming-44512').claims ?? []).toEqual([]);
    expect(stone.claims?.some((claim) => claim.kind === 'scholarly-opinion' && claim.value.includes('七人'))).toBe(true);
    expect(work('liqi-bei').attribution.map((entry) => entry.role)).toEqual(['unknown']);
  });

  it('scopes the Zhang Menglong leaf count to the Ming album', () => {
    expect(object('rubbing-zhang-menglong-bei').claims?.some((claim) => claim.value === '三十六页')).toBe(true);
    expect(object('stele-zhang-menglong-bei').claims ?? []).toEqual([]);
    expect(object('stele-zhang-menglong-bei').dimensions?.raw ?? '').not.toContain('三十六页');
  });

  it('keeps the two Markdown-only works, with 1962 as publication and 1976 as a colophon', () => {
    expect(work('shen-yinmo-dakai-jia').compositionDate.startYear).toBe(1962);
    expect(work('shen-yinmo-dakai-jia').compositionDate.meaning).toBe('publication');
    expect(work('zhao-puchu-shen-colophon').compositionDate.startYear).toBe(1976);
    expect(work('zhao-puchu-shen-colophon').compositionDate.meaning).toBe('colophon');
    expect(compiled.works).toHaveLength(117);
    expect(compiled.objects).toHaveLength(126);
  });
});

describe('author-source migration safeguards', () => {
  it('preserves references on independent people and note articles', () => {
    const note = compiled.articles.find((article) => article.id === 'duobao-reading')!;
    const person = compiled.articles.find((article) => article.id === 'yan-zhenqing')!;
    expect(note.people).toContain('yan-zhenqing');
    expect(note.objects).toContain('stele-duobao-ta');
    expect(person.works).toContain('datang-zhongxing-song');
    expect(person.sources).toContain('src-hunan-wuxi');
  });

  it('rejects partial map coordinates before an unknown latitude can become zero', () => {
    const fields = {
      nameZh: '示例地点',
      kind: 'city',
      coordinateLongitude: 109,
      coordinatePrecision: 'city',
      coordinateMethod: 'field-survey',
      coordinateVerification: 'unverified',
    };
    expect(() => readPlace({ id: 'sample', path: 'places/sample.md', fields, body: '' }))
      .toThrow('both coordinateLongitude and coordinateLatitude');
  });

  it('requires a traceable source and locator for an attributed claim', () => {
    const claim = { id: 'sample', kind: 'source-report', predicate: 'year', value: 'unknown' };
    expect(() => readClaims([claim], 'claims')).toThrow('requires a source');
    expect(() => readClaims([{ ...claim, sources: ['test-source'] }], 'claims')).toThrow('locator');
  });
});
