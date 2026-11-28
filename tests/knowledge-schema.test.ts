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

function writeRecord(root: string, kind: string, id: string, frontmatter: string): void {
  mkdirSync(join(root, 'knowledge', kind), { recursive: true });
  writeFileSync(join(root, 'knowledge', kind, id + '.md'), '---\n' + frontmatter + '\n---\n\n# 示例\n', 'utf8');
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
