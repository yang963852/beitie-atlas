import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildZipArchive, packageKnowledgeFiles } from '../scripts/knowledge-package';

/** Reads the entry names from the ZIP central directory, in stored order. */
function entryNames(archive: Buffer): string[] {
  const endOffset = archive.length - 22;
  expect(archive.readUInt32LE(endOffset)).toBe(0x06054b50);
  const count = archive.readUInt16LE(endOffset + 10);
  let offset = archive.readUInt32LE(endOffset + 16);
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    expect(archive.readUInt32LE(offset)).toBe(0x02014b50);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    names.push(archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return names;
}

describe('knowledge download package', () => {
  it('orders entries by code unit, not by host collation', () => {
    // "a.md" versus "B.md" is the decisive pair: ICU collation puts the
    // lowercase name first, code-unit order puts "B" first. A locale-sensitive
    // sort would therefore emit a different archive on another machine.
    const files = new Map<string, Buffer>([
      ['a.md', Buffer.from('a', 'utf8')],
      ['B.md', Buffer.from('b', 'utf8')],
      ['开始阅读.md', Buffer.from('c', 'utf8')],
      ['LICENSE', Buffer.from('d', 'utf8')],
      ['e.md', Buffer.from('e', 'utf8')],
      ['é.md', Buffer.from('f', 'utf8')],
    ]);

    expect(entryNames(buildZipArchive(files))).toEqual([
      'B.md',
      'LICENSE',
      'a.md',
      'e.md',
      'é.md',
      '开始阅读.md',
    ]);
  });

  it('emits identical bytes regardless of insertion order', () => {
    const entries: Array<[string, Buffer]> = [
      ['b.md', Buffer.from('first', 'utf8')],
      ['A.md', Buffer.from('second', 'utf8')],
      ['子目录/图.md', Buffer.from('third', 'utf8')],
    ];
    const forward = buildZipArchive(new Map(entries));
    const reversed = buildZipArchive(new Map([...entries].reverse()));
    expect(reversed.equals(forward)).toBe(true);
  });
});

describe('author file selection', () => {
  const created: string[] = [];

  /** Git object files are read-only on Windows; make them writable before removal. */
  function removeTree(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) removeTree(path);
      else chmodSync(path, 0o666);
    }
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }

  afterEach(() => {
    while (created.length > 0) {
      const root = created.pop();
      if (root) removeTree(root);
    }
  });

  it('packages tracked knowledge files and reports untracked ones', () => {
    const root = mkdtempSync(join(tmpdir(), 'beitie-package-'));
    created.push(root);
    expect(spawnSync('git', ['init', '--quiet'], { cwd: root }).status).toBe(0);
    mkdirSync(join(root, 'knowledge', 'works'), { recursive: true });
    writeFileSync(join(root, 'knowledge', 'works', 'kept.md'), 'kept');
    writeFileSync(join(root, 'knowledge', 'works', 'draft.md'), 'draft');
    expect(spawnSync('git', ['add', '--', 'knowledge/works/kept.md'], { cwd: root }).status).toBe(0);

    const selection = packageKnowledgeFiles(root);

    expect(selection.fromGit).toBe(true);
    expect(selection.files).toContain('knowledge/works/kept.md');
    expect(selection.files).not.toContain('knowledge/works/draft.md');
    expect(selection.untracked).toEqual(['knowledge/works/draft.md']);
  });
});
