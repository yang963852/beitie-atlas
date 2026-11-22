import { describe, expect, it } from 'vitest';
import { parseKnowledgeArticle } from '../scripts/lib/knowledge';
import { cataloguePages } from '../scripts/lib/catalogue';
import { loadDatasetFromDisk } from '../scripts/lib/dataset';
import type { Dataset } from '../src/domain/types';

const markdown = [
  '---', 'titleZh: 甲', 'titleEn: "Reading: A"', 'state: draft', 'objects: first, second', '---',
  '# 甲', '', '## 中文', '', '### 细读', '参看[馆藏记录](https://example.org)。', '',
].join('\n');

describe('authored knowledge', () => {
  it('reads ordinary GitHub frontmatter and Markdown, including Chinese-only submissions', () => {
    const result = parseKnowledgeArticle('notes', 'study', markdown.replace(/\n/g, '\r\n'));
    expect(result).toMatchObject({ kind: 'notes', id: 'study', titleEn: 'Reading: A', objects: ['first', 'second'], en: '' });
    expect(result.zh).toBe('### 细读\n参看[馆藏记录](https://example.org)。');
    expect(parseKnowledgeArticle('notes', 'study', markdown.replace('titleEn: "Reading: A"\n', '')).titleEn).toBe('甲');
    const bilingual = parseKnowledgeArticle('notes', 'study', markdown + '\n## English\nA reading.');
    expect(bilingual.en).toBe('A reading.');
    expect(bilingual.zh).toBe(result.zh);
  });

  it('rejects frontmatter ambiguity, duplicate references and body text that would otherwise disappear', () => {
    for (const bad of [
      markdown.replace('first, second', 'first, first'), markdown.replace('titleZh:', 'unknown:'),
      markdown.replace('## 中文', 'Important fact\n## 中文'), markdown + '\n## English\n',
      markdown.replace('state: draft', 'state: draft\nstate: reviewed'),
    ]) expect(() => parseKnowledgeArticle('notes', 'study', bad)).toThrow();
  });
});

describe('GitHub catalogue projection', () => {
  it('groups actual witnesses and keeps the stone history under the stone with its cited sources', () => {
    const dataset = loadDatasetFromDisk() as Dataset;
    const pages = cataloguePages(dataset, []);
    expect(pages.size).toBe(dataset.works.length + 1);
    for (const object of dataset.objects) {
      expect(pages.get('catalogue/' + object.workId + '.md')).toContain('<a name="' + object.id + '"></a>');
    }
    const page = pages.get('catalogue/yan-qinli-bei.md')!;
    const sections = page.split(/<a name="(?!ref-)/);
    const stone = sections.find(s => s.startsWith('yan-qinli-original-stele"'))!;
    const rubbing = sections.find(s => s.startsWith('dpm-rubbing-xin00045406"'))!;
    expect(stone).toContain('新城大楼北东侧');
    expect(stone).toContain('#ref-src-beilin-article-2007');
    expect(rubbing).not.toContain('新城大楼北东侧');
    expect(page).toContain('<a name="ref-src-beilin-article-2007"></a>');
  });
});
