import { describe, expect, it } from 'vitest';
import { cataloguePages } from '../scripts/lib/catalogue';
import { compileKnowledge } from '../scripts/lib/knowledge-compiler';
import { splitFrontmatter } from '../scripts/lib/knowledge-schema';

const compiled = compileKnowledge(process.cwd());

describe('knowledge authoring format', () => {
  it('normalizes CRLF and byte-order marks and keeps an optional H1 out of the fields', () => {
    const input = '\uFEFF---\r\ntitleZh: 甲\r\ntitleEn: A\r\n---\r\n\r\n# 标题\r\n\r\n## 中文\r\n\r\n正文。\r\n';
    const { fields, body } = splitFrontmatter(input);
    expect(fields.titleZh).toBe('甲');
    expect(fields.titleEn).toBe('A');
    expect(body).toContain('# 标题');
    expect(body).toContain('## 中文');
  });

  it('keeps the work record and its guide as separate review states', () => {
    const work = compiled.knowledge.works.find((item) => item.id === 'yan-qinli-bei')!;
    const guide = compiled.knowledge.articles.find((item) => item.kind === 'works' && item.id === 'yan-qinli-bei')!;
    expect(work.review.state).toBe('reviewed');
    expect(guide.state).toBe('draft');
  });

  it('reports a clean compiled corpus and keeps stable work/object counts', () => {
    expect(compiled.issues).toEqual([]);
    expect(compiled.knowledge.counts.works).toBe(98);
    expect(compiled.knowledge.counts.objects).toBe(107);
  });

  it('generates catalogue pages with witness anchors and source links', () => {
    const pages = cataloguePages(compiled.knowledge as unknown as Parameters<typeof cataloguePages>[0], compiled.knowledge.articles);
    expect(pages.get('README.md')).toContain('works/yan-qinli-bei.md');
    const page = pages.get('catalogue/yan-qinli-bei.md')!;
    expect(page).toContain('<a name="yan-qinli-original-stele"></a>');
    expect(page).toContain('<a name="dpm-rubbing-xin00045406"></a>');
    expect(page).toContain('今日参照地标');
    expect(page).toContain('../../knowledge/works/yan-qinli-bei.md');
    expect(page).toContain('../../knowledge/objects/yan-qinli-original-stele.md');
  });
});
