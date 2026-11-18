import { describe, expect, it } from 'vitest';
import {
  buildContributionBody,
  buildContributionUrl,
  objectPageUrl,
} from '../src/domain/contribution';

const draft = {
  objectId: 'stele-kaicheng-shijing',
  objectTitle: '开成石经（原石）',
  pageUrl: 'https://example.org/#/object/stele-kaicheng-shijing',
  details: '第二展室西侧有一方补刻题记。',
  source: 'https://example.org/museum/page',
  contact: '',
};

describe('contribution text', () => {
  it('carries the record, the page, the source and an explicit caveat', () => {
    const body = buildContributionBody(draft, 'zh');
    expect(body).toContain('开成石经（原石）');
    expect(body).toContain('https://example.org/#/object/stele-kaicheng-shijing');
    expect(body).toContain('第二展室西侧有一方补刻题记。');
    expect(body).toContain('https://example.org/museum/page');
    expect(body).toContain('不是已核实的结论');
    // An empty optional field is stated, not silently dropped.
    expect(body).toContain('（未提供）');
  });

  it('does not invent content for a general submission', () => {
    const body = buildContributionBody({ ...draft, objectId: null, objectTitle: null }, 'zh');
    expect(body).toContain('（未提供）');
    expect(body).not.toContain('undefined');
  });

  it('prefills the public issue page without losing Chinese text', () => {
    const url = buildContributionUrl(draft, 'zh');
    expect(url.startsWith('https://github.com/yang963852/beitie-atlas/issues/new?')).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get('title')).toBe('[资料补充] 开成石经（原石）');
    expect(parsed.searchParams.get('body')).toContain('第二展室西侧有一方补刻题记。');
  });

  it('builds a stable share link for a record and for the atlas root', () => {
    expect(objectPageUrl('stele-cao-quan', 'https://example.org')).toBe(
      'https://example.org/#/object/stele-cao-quan',
    );
    expect(objectPageUrl(null, 'https://example.org')).toBe('https://example.org/');
  });

  it('keeps the atlas subpath and replaces an existing query and record hash', () => {
    const page = 'https://example.org/beitie-atlas/?campaign=old#/object/old';
    expect(objectPageUrl('stele-cao-quan', page)).toBe(
      'https://example.org/beitie-atlas/#/object/stele-cao-quan',
    );
    expect(objectPageUrl(null, page)).toBe('https://example.org/beitie-atlas/');
  });
});
