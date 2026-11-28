import { describe, expect, it } from 'vitest';
import { buildZipArchive } from '../scripts/knowledge-package';

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
