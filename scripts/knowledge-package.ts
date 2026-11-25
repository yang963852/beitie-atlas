/**
 * Build the standalone knowledge-library ZIP.
 *
 *   npm run knowledge:package
 *
 * The archive is written to `public/download/beitie-knowledge.zip` and is not
 * committed. It contains the author Markdown, the generated catalogue, the
 * Chinese contribution guide, rights notices and a manifest naming the source
 * revision. The ZIP uses a fixed timestamp so two runs on the same revision
 * produce identical bytes.
 */

import { spawnSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { compileKnowledge } from './lib/knowledge-compiler';

const root = process.cwd();
const outputDir = join(root, 'public', 'download');
const output = join(outputDir, 'beitie-knowledge.zip');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const path = join(dir, name);
    const entry = lstatSync(path);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (entry.isFile()) out.push(path);
    else throw new Error('Only regular files and directories can be packaged: ' + path);
  }
  return out.sort();
}

function git(args: string[]): string | null {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return result.status === 0 && typeof result.stdout === 'string' && result.stdout.trim()
    ? result.stdout.trim()
    : null;
}

const sourceState = spawnSync('git', ['status', '--porcelain', '--untracked-files=all', '--',
  'knowledge', 'docs/CONTRIBUTE.zh-CN.md', 'LICENSE', 'NOTICE.md'], { cwd: root, encoding: 'utf8' });
const revision = sourceState.status === 0 && !sourceState.stdout.trim() ? git(['rev-parse', 'HEAD']) : null;
const revisionDate = revision ? git(['show', '-s', '--format=%cs', 'HEAD']) : null;

const compiled = compileKnowledge(root);
if (compiled.issues.length) {
  console.error('Knowledge compilation failed; refusing to package.');
  for (const issue of compiled.issues) console.error('  - ' + issue.path + ': ' + issue.message);
  process.exit(1);
}
const catalogueCheck = spawnSync(
  process.execPath,
  [join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'scripts/knowledge-catalogue.ts', '--check'],
  { cwd: root, encoding: 'utf8' },
);
if (catalogueCheck.status !== 0) {
  console.error(catalogueCheck.stdout || '');
  console.error(catalogueCheck.stderr || 'Generated catalogue is stale. Run npm run knowledge:generate before packaging.');
  process.exit(1);
}

const readme = [
  '# 碑帖之间 · 独立知识库',
  '',
  '源版本见 manifest.json。未提交的本地资料包不标注提交号。中文总目位于 knowledge/README.md。',
  '',
  '## 从下载到投稿',
  '',
  '1. 解压后，用 Obsidian 或任意 Markdown 编辑器打开本文件夹。',
  '2. 只改你要改的那一篇，例如 `knowledge/works/yan-qinli-bei.md`；文件名是稳定 ID，不要改名。',
  '3. 在自己的 GitHub Fork 中按原路径上传这个文件，向 `yang963852/beitie-atlas` 的 `main` 提 PR。',
  '4. 只提交你改动的源稿。`knowledge/catalogue/`、`knowledge/README.md` 与 `manifest.json` 是生成文件，不用手改；由项目维护者重新生成。',
  '',
  '## 写作规则',
  '',
  '- 顶部 YAML 只放程序字段，正文写给人读。',
  '- 每个事实都要有 `sources` 里可打开的出处；未知值留空，不猜。',
  '- 中文和英文成对出现；没有译文时保留原文，不生成机器翻译。',
  '- 作品是入口，实物是流传经历的主体；不要让一件拓本继承原石的出土经历。',
  '- 有冲突的说法分别记录，并注明是谁在何处提出。',
  '',
  '权利说明见 `NOTICE.md`，代码与原创编辑内容见 `LICENSE`。',
].join('\n');

const manifest = {
  formatVersion: 'beitie-knowledge/1',
  schemaVersion: 1,
  sourceRevision: revision,
  sourceDate: revisionDate,
  counts: compiled.knowledge.counts,
  note: 'Generated from knowledge/ by npm run knowledge:package. The catalogue and README are derived files.',
};

const files = new Map<string, Buffer>();
for (const file of walk(join(root, 'knowledge'))) {
  const name = relative(root, file).replace(/\\/g, '/');
  files.set(name, readFileSync(file));
}
for (const file of ['LICENSE', 'NOTICE.md', 'docs/CONTRIBUTE.zh-CN.md']) {
  const path = join(root, file);
  if (existsSync(path)) files.set(file, readFileSync(path));
}
files.set('开始阅读.md', Buffer.from(readme, 'utf8'));
files.set('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n', 'utf8'));

// Minimal deterministic ZIP writer (deflate, UTF-8 names, fixed 1980 timestamp).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const localParts: Buffer[] = [];
const centralParts: Buffer[] = [];
let offset = 0;
for (const [name, content] of [...files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const nameBytes = Buffer.from(name, 'utf8');
  const compressed = deflateRawSync(content);
  const crc = crc32(content);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0x0021, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(content.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  local.writeUInt16LE(0, 28);
  localParts.push(local, nameBytes, compressed);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0x0021, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(content.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, nameBytes);

  offset += local.length + nameBytes.length + compressed.length;
}

const centralDirectory = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(files.size, 8);
end.writeUInt16LE(files.size, 10);
end.writeUInt32LE(centralDirectory.length, 12);
end.writeUInt32LE(offset, 16);
end.writeUInt16LE(0, 20);

mkdirSync(outputDir, { recursive: true });
writeFileSync(output, Buffer.concat([...localParts, centralDirectory, end]));
console.log('Wrote ' + relative(root, output) + ': ' + files.size + ' files, ' + (readFileSync(output).length / 1024).toFixed(1) + ' KiB, revision ' + (revision ?? 'unrecorded') + '.');
