import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { compileKnowledge } from '../scripts/lib/knowledge-compiler';

const created: string[] = [];

function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'beitie-fields-'));
  created.push(root);
  return root;
}

function writeRecord(root: string, kind: string, id: string, frontmatter: string, body = '# 示例\n'): void {
  mkdirSync(join(root, 'knowledge', kind), { recursive: true });
  writeFileSync(join(root, 'knowledge', kind, id + '.md'), '---\n' + frontmatter + '\n---\n\n' + body, 'utf8');
}

afterEach(() => {
  while (created.length > 0) {
    const root = created.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

describe('author frontmatter field list', () => {
  it('rejects a top-level key that no reader consumes', () => {
    const root = tempRoot();
    writeRecord(root, 'works', 'demo-work', 'schemaVersion: 2\ntitleZh: 示例\nstrayKey: 未读字段');
    expect(() => compileKnowledge(root)).toThrow(/unknown frontmatter field "strayKey"/);
  });

  it('rejects a nested block left behind by schema v1', () => {
    const root = tempRoot();
    writeRecord(root, 'objects', 'demo-object', 'schemaVersion: 2\ntitleZh: 示例\ndate:\n  kind: single');
    expect(() => compileKnowledge(root)).toThrow(/unknown frontmatter field "date"/);
  });

  it('names the template that documents the field list', () => {
    const root = tempRoot();
    writeRecord(root, 'places', 'demo-place', 'schemaVersion: 2\nnameZh: 示例\ncoordinates:\n  longitude: 116.4');
    expect(() => compileKnowledge(root)).toThrow(/knowledge\/_templates\/place\.md/);
  });

  it('rejects an unregistered province id', () => {
    const root = tempRoot();
    writeRecord(root, 'places', 'demo-place', 'schemaVersion: 2\nnameZh: 示例\nkind: institution\nprovince: atlantis');
    const result = compileKnowledge(root);
    expect(
      result.issues.some(
        (issue) => issue.code === 'INVALID_PLACE_RECORD' && /province must be one of/.test(issue.message),
      ),
    ).toBe(true);
  });

  it('reports a stray key on a relationship entry as a validation issue', () => {
    const root = tempRoot();
    mkdirSync(join(root, 'knowledge'), { recursive: true });
    writeFileSync(join(root, 'knowledge', 'relations.md'), [
      '---',
      'schemaVersion: 2',
      'relations:',
      '  - from: a-person',
      '    to: b-person',
      '    type: correspondence',
      '    sourceRefs: [src-one]',
      '    state: reviewed',
      '    note: 未读字段',
      '---',
      '',
      '# 人物关系',
      '',
    ].join('\n'), 'utf8');
    const result = compileKnowledge(root);
    const issue = result.issues.find((item) => item.code === 'INVALID_RELATION_RECORD');
    expect(issue?.message).toMatch(/unknown field\(s\) "note"/);
  });
});

describe('nested list entries', () => {
  const source = 'schemaVersion: 2\nkind: web\ntitle: 来源\npublisher: 出版者\nurl: https://example.org/record\naccessedAt: 2026-11-28\n';
  const date = 'dateKind: single\ndateStart: 779\ndateEnd: 779\ndateCertainty: documented\n';
  const workBody = '# 示例\n\n## 背景\n\n### 中文\n\n示例。\n';
  const work = (...lists: string[]) => [
    'schemaVersion: 2', 'titleZh: 示例', 'titleEn: Example', 'studyCategory: bei', 'dynastyId: tang', date,
    ...lists, 'sources: [src-one]', 'reviewState: reviewed',
  ].join('\n');
  const object = (...lists: string[]) => [
    'schemaVersion: 2', 'work: demo-work', 'objectType: original-stele', 'titleZh: 示例', 'titleEn: Example', date,
    'survival: surviving', 'collectionKind: in-situ', 'collectionSources: [src-one]', 'collectionAccessedAt: 2026-11-28',
    ...lists, 'reviewState: reviewed',
  ].join('\n');
  const attribution = (extra = '') => ['attribution:', '  - role: calligrapher', '    name: 某甲', extra, '    certainty: disputed', '    sources: [src-one]'].join('\n');
  const claims = (extra = '') => ['claims:', '  - id: claim-one', '    kind: source-report', '    predicate: date', '    value: 立于 779 年', '    locator: Entry text', extra, '    sources: [src-one]'].join('\n');
  const events = (extra = '') => ['events:', '  - id: ev-one', '    type: discovery', '    dateKind: single', '    dateStart: 1922', '    dateEnd: 1922', '    dateCertainty: documented', '    summary: Found.', extra, '    sources: [src-one]'].join('\n');
  const relationships = (extra = '') => ['relationships:', '  - type: rubbing-of', '    target: other-object', extra, '    sources: [src-one]'].join('\n');
  const media = (extra = '') => ['media:', '  - id: media-one', '    asset: src/assets/example.webp', '    creator: 某甲', extra, '    sources: [src-one]', '    license: CC0', '    credit: 某甲', '    rightsEvidence: https://example.org/record', '    acquiredAt: 2026-11-28'].join('\n');

  // Before the guard, a misspelt optional key was read as absent: `certinty`
  // became `documented`, and a misspelt translation disappeared from the site.
  const cases: Array<[string, 'works' | 'objects', string, string, string, RegExp]> = [
    ['a work attribution', 'works', 'INVALID_WORK_RECORD', work(attribution()), work(attribution('    certinty: disputed')), /attribution\[0\]: unknown field\(s\) "certinty"/],
    ['a claim', 'works', 'INVALID_WORK_RECORD', work(attribution(), claims()), work(attribution(), claims('    noteZ: 备注')), /claims\[0\]: unknown field\(s\) "noteZ"/],
    ['an event date', 'objects', 'INVALID_OBJECT_RECORD', object(events()), object(events('    dateCertinty: disputed')), /events\[0\]: unknown field\(s\) "dateCertinty"/],
    ['an event translation', 'objects', 'INVALID_OBJECT_RECORD', object(events()), object(events('    summaryZ: 发现。')), /events\[0\]: unknown field\(s\) "summaryZ"/],
    ['an object relationship', 'objects', 'INVALID_OBJECT_RECORD', object(relationships()), object(relationships('    noteZh: 备注')), /relationships\[0\]: unknown field\(s\) "noteZh"/],
    ['a media item', 'objects', 'INVALID_OBJECT_RECORD', object(media()), object(media('    creditLine: extra')), /media\[0\]: unknown field\(s\) "creditLine"/],
  ];

  it.each(cases)('rejects an unknown key on %s instead of dropping it', (_name, kind, code, clean, stray, pattern) => {
    const cleanRoot = tempRoot();
    writeRecord(cleanRoot, 'sources', 'src-one', source);
    writeRecord(cleanRoot, kind, 'demo', clean, workBody);
    expect(compileKnowledge(cleanRoot).issues.filter((issue) => issue.code === code)).toEqual([]);

    const root = tempRoot();
    writeRecord(root, 'sources', 'src-one', source);
    writeRecord(root, kind, 'demo', stray, workBody);
    const issue = compileKnowledge(root).issues.find((item) => item.code === code);
    expect(issue?.message).toMatch(pattern);
  });
});
