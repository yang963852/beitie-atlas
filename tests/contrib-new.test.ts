import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { recordType, scaffold } from '../scripts/lib/contrib-new';

const created: string[] = [];

/** A root whose templates are the real ones, so the copy is the copy authors get. */
function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'beitie-contrib-'));
  created.push(root);
  cpSync(join(process.cwd(), 'knowledge', '_templates'), join(root, 'knowledge', '_templates'), { recursive: true });
  return root;
}

afterEach(() => {
  while (created.length > 0) {
    const root = created.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

describe('contrib:new', () => {
  it('copies the type template to the stable ID', () => {
    const root = tempRoot();
    expect(scaffold(root, 'work', 'demo-work')).toEqual({ path: 'knowledge/works/demo-work.md' });
    expect(readFileSync(join(root, 'knowledge/works/demo-work.md'), 'utf8'))
      .toBe(readFileSync(join(process.cwd(), 'knowledge/_templates/work.md'), 'utf8'));
  });

  it('accepts the directory name and a trailing s', () => {
    expect(recordType('works')?.dir).toBe('works');
    expect(recordType('sources')?.dir).toBe('sources');
    expect(recordType('people')?.template).toBe('person.md');
    expect(recordType('persons')?.dir).toBe('people');
  });

  it('rejects an ID the compiler would refuse', () => {
    const root = tempRoot();
    for (const id of ['Demo Work', 'demo_work', 'demo--work', '-demo']) {
      expect(() => scaffold(root, 'work', id)).toThrow(/not a stable ID/);
    }
  });

  it('never overwrites an existing record', () => {
    const root = tempRoot();
    scaffold(root, 'place', 'demo-place');
    const target = join(root, 'knowledge/places/demo-place.md');
    writeFileSync(target, 'edited by hand', 'utf8');
    expect(() => scaffold(root, 'place', 'demo-place')).toThrow(/already exists/);
    expect(readFileSync(target, 'utf8')).toBe('edited by hand');
  });

  it('names the known types when the type is wrong', () => {
    const root = tempRoot();
    expect(() => scaffold(root, 'artifact', 'demo')).toThrow(/Unknown record type "artifact"/);
    expect(existsSync(join(root, 'knowledge/works/demo.md'))).toBe(false);
  });
});
