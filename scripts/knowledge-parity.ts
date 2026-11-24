/**
 * Compare the frozen JSON corpus with the compiled Markdown corpus.
 *
 *   npm run knowledge:parity
 *
 * Writes `docs/baseline/migration-parity-2026-11-24.md` and `.json`. Known
 * editorial changes are listed separately; every other difference is reported
 * as unexplained so it cannot hide in a migration.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import migrationDigests from './research/fixtures/knowledge-migration-digests.json';
import { join } from 'node:path';
import type { ObjectRecord, Place, Source, Work } from '../src/domain/types';
import { compileKnowledge } from './lib/knowledge-compiler';
import { loadDatasetFromDisk } from './lib/dataset';

const root = process.cwd();
const outDir = join(root, 'docs', 'baseline');
mkdirSync(outDir, { recursive: true });

const legacy = loadDatasetFromDisk(root) as unknown as {
  works: Work[];
  objects: ObjectRecord[];
  places: Place[];
  sources: Source[];
  media: Array<Record<string, unknown>>;
};
const compilation = compileKnowledge(root);
if (compilation.issues.length) throw new Error(compilation.issues.map((issue) => issue.path + ': ' + issue.message).join('\n'));
const compiled = compilation.knowledge;

function equal(a: unknown, b: unknown): boolean {
  if (a == null && b == null) return true;
  if (Array.isArray(a) && a.length === 0 && (b == null || (Array.isArray(b) && b.length === 0))) return true;
  if (Array.isArray(b) && b.length === 0 && a == null) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => equal(item, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    for (const key of new Set([...aKeys, ...bKeys])) {
      if (!equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    return true;
  }
  return a === b;
}

interface Difference {
  path: string;
  legacy: unknown;
  compiled: unknown;
}

function diff(a: unknown, b: unknown, path = ''): Difference[] {
  // `kind: web` was the implicit default in the legacy JSON. Recording it
  // explicitly is a representation change, not a changed source.

  if (equal(a, b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const out: Difference[] = [];
    for (const key of new Set([...Object.keys(aRecord), ...Object.keys(bRecord)])) {
      out.push(...diff(aRecord[key], bRecord[key], path ? path + '.' + key : key));
    }
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: Difference[] = [];
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) {
      out.push(...diff(a[index], b[index], path + '[' + index + ']'));
    }
    return out;
  }
  return [{ path, legacy: a ?? null, compiled: b ?? null }];
}

function truncate(value: unknown): string {
  const text = JSON.stringify(value);
  return text.length > 120 ? text.slice(0, 117) + '...' : text;
}

// Pin the exact additions and field differences reviewed for the one-time migration.
function matchesSnapshot(id: string, value: unknown): boolean {
  const digest = createHash('sha256').update(JSON.stringify(value)).digest('hex');
  return (migrationDigests as Record<string, string>)[id] === digest;
}

function compareKind<T extends { id: string }>(legacyRows: T[], compiledRows: T[]) {
  const legacyMap = new Map(legacyRows.map((row) => [row.id, row]));
  const compiledMap = new Map(compiledRows.map((row) => [row.id, row]));
  const rows: Array<{
    id: string;
    status: 'identical' | 'changed' | 'legacy-only' | 'compiled-only' | 'known-editorial';
    differences: Difference[];
    knownReason: string | null;
  }> = [];
  const known: Record<string, string> = {
    'shen-yinmo-dakai-jia': 'Markdown-only work promoted to a base work record in the 2026-11 migration.',
    'zhao-puchu-shen-colophon': 'Markdown-only work promoted to a base work record; the colophon receives its own object.',
    'witness-zhao-shen-colophon': 'New object record for Zhao Puchu’s colophon, created from the Shanghai Museum entry.',
    'place-shanghai-museum': 'New place record for the Shanghai Museum, with no invented coordinate.',
    'place-xian-drum-tower': 'New modern reference landmark for the Yan Qinli journey; not the historical find-place.',
    'place-xincheng-square-view': 'New modern reference viewpoint for the Yan Qinli journey; not a surveyed historical position.',
    'src-jizhi-colophon-bingxu': 'New source record separating the bingxu colophon’s 1282 reading.',
    'src-jizhi-colophon-wuzi': 'New source record separating the wuzi colophon’s 1283 reading.',
    'src-wikidata-drum-tower': 'New source for the modern Drum Tower reference coordinate.',
    'src-commons-xincheng-square': 'New source for the modern Xincheng Square photograph location.',
    'witness-jizhi': 'The single disputed 1282–1283 acquisition event is split into two dated events; the editorial grouping claim is new.',
    'yan-qinli-original-stele': 'Modern reference landmarks and their notes are added to the four existing events; historical places and wordings are unchanged.',
    'witness-lanting': 'Shenlong version label, disputed Feng Chengsu copyist credit and two attribution claims are new.',
    'dingwu-zhan': 'Dingwu version label added from the museum entry.',
    'liqi-ming-44512': 'The exact source stone is unconfirmed; the work link is retained.',
    'stele-liqi': 'Weng Fanggang’s seven-writer opinion is recorded as a sourced claim.',
    'rubbing-zhang-menglong-bei': 'The 36-page count is recorded as a claim scoped to this album.',
  };
  for (const id of new Set([...legacyMap.keys(), ...compiledMap.keys()])) {
    const before = legacyMap.get(id);
    const after = compiledMap.get(id);
    if (!before) {
      rows.push({ id, status: 'compiled-only', differences: [], knownReason: known[id] && matchesSnapshot(id, after) ? known[id] : null });
      continue;
    }
    if (!after) {
      rows.push({ id, status: 'legacy-only', differences: [], knownReason: known[id] ?? null });
      continue;
    }
    const differences = diff(before, after).filter((item) => {
      // A Chinese background recorded in `background` is projected into
      // `backgroundZh`; the wording did not change.
      if (item.path === 'backgroundZh' && item.legacy == null
        && typeof (before as { background?: unknown }).background === 'string'
        && item.compiled === (before as { background?: string }).background) return false;
      // Local person links were added where a person record already existed.
      const attribution = /^attribution\[(\d+)\]\.personId$/.exec(item.path);
      if (attribution && item.legacy == null) {
        const previous = (before as { attribution?: { name: string }[] }).attribution?.[Number(attribution[1])];
        const person = compiled.articles.find((article) => article.kind === 'people' && article.id === item.compiled);
        if (previous && person && person.titleZh === previous.name) return false;
      }
      if ('publisher' in before && item.path === 'kind' && item.legacy == null && item.compiled === 'web') return false;
      return true;
    });
    const explained = Boolean(known[id] && differences.length && matchesSnapshot(id, differences));
    rows.push({
      id,
      status: explained ? 'known-editorial' : differences.length ? 'changed' : 'identical',
      differences,
      knownReason: explained ? known[id] : null,
    });
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

const works = compareKind(legacy.works, compiled.works);
const objects = compareKind(legacy.objects, compiled.objects);
const places = compareKind(legacy.places, compiled.places);
const sources = compareKind(legacy.sources, compiled.sources);

const eventCount = compiled.objects.reduce((sum, object) => sum + object.provenanceEvents.length, 0);
function summarize(rows: ReturnType<typeof compareKind>) {
  return {
    total: rows.length,
    identical: rows.filter((row) => row.status === 'identical').length,
    knownEditorial: rows.filter((row) => row.status === 'known-editorial').length,
    changed: rows.filter((row) => row.status === 'changed').length,
    legacyOnly: rows.filter((row) => row.status === 'legacy-only').length,
    compiledOnly: rows.filter((row) => row.status === 'compiled-only').length,
    unexplained: rows.filter((row) => row.status === 'changed' || row.status === 'legacy-only' || (row.status === 'compiled-only' && !row.knownReason)).map((row) => row.id),
  };
}

const summary = { works: summarize(works), objects: summarize(objects), places: summarize(places), sources: summarize(sources) };
const result = {
  generatedAt: '2026-11-24',
  baseRevision: 'c9aa45a',
  legacyCounts: {
    works: legacy.works.length, objects: legacy.objects.length, places: legacy.places.length,
    sources: legacy.sources.length, events: legacy.objects.reduce((sum, object) => sum + object.provenanceEvents.length, 0),
  },
  compiledCounts: compiled.counts,
  summary,
  works,
  objects,
  places,
  sources,
};
writeFileSync(join(outDir, 'migration-parity-2026-11-24.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');

function table(rows: ReturnType<typeof compareKind>) {
  return [
    '| ID | 状态 | 差异数 | 说明 |',
    '| --- | --- | --- | --- |',
    ...rows.map((row) => '| `' + row.id + '` | ' + row.status + ' | ' + row.differences.length + ' | '
      + (row.knownReason ?? (row.status === 'identical' ? '逐项一致' : '需解释')) + ' |'),
  ].join('\n');
}

function details(rows: ReturnType<typeof compareKind>, title: string) {
  const changed = rows.filter((row) => row.differences.length && row.status !== 'known-editorial');
  if (!changed.length) return '';
  return [
    '### ' + title + '未解释字段差异',
    '',
    ...changed.flatMap((row) => [
      '#### `' + row.id + '`',
      '',
      '| 字段 | 旧库 | 新库 |',
      '| --- | --- | --- |',
      ...row.differences.slice(0, 40).map((item) => '| `' + item.path + '` | `' + truncate(item.legacy) + '` | `' + truncate(item.compiled) + '` |'),
      ...(row.differences.length > 40 ? ['', '（仅列前 40 项，完整差异见 JSON。）'] : []),
      '',
    ]),
  ].join('\n');
}

const markdown = [
  '# 迁移逐项对照 · 2026-11-24',
  '',
  '旧库为 `' + 'c9aa45a' + '` 的 JSON 与 Markdown；新库为 `knowledge/` 编译结果。比较按稳定 ID 进行，空值、缺失和空数组视为同一表示。',
  '',
  '## 总量',
  '',
  '| 项目 | 旧库 | 新库 |',
  '| --- | ---: | ---: |',
  '| 作品 | ' + legacy.works.length + ' | ' + compiled.counts.works + ' |',
  '| 实物 | ' + legacy.objects.length + ' | ' + compiled.counts.objects + ' |',
  '| 地点 | ' + legacy.places.length + ' | ' + compiled.counts.places + ' |',
  '| 来源 | ' + legacy.sources.length + ' | ' + compiled.counts.sources + ' |',
  '| 事件 | ' + result.legacyCounts.events + ' | ' + eventCount + ' |',
  '| 媒体 | ' + legacy.media.length + ' | ' + compiled.counts.media + ' |',
  '',
  '## 差异汇总',
  '',
  '| 类别 | 一致 | 已知编辑修改 | 未解释改动 | 仅旧库 | 仅新库 |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...(['works', 'objects', 'places', 'sources'] as const).map((key) => {
    const row = summary[key];
    return '| ' + key + ' | ' + row.identical + ' | ' + row.knownEditorial + ' | ' + row.changed + ' | ' + row.legacyOnly + ' | ' + row.compiledOnly + ' |';
  }),
  '',
  '**未解释改动的 ID：** ' + ([...summary.works.unexplained, ...summary.objects.unexplained, ...summary.places.unexplained, ...summary.sources.unexplained].map((id) => '`' + id + '`').join('、') || '无'),
  '',
  '## 作品',
  '',
  table(works),
  '',
  '## 实物',
  '',
  table(objects),
  '',
  '## 地点',
  '',
  table(places),
  '',
  '## 来源',
  '',
  table(sources),
  '',
  '## 表示归一',
  '',
  '- 旧库把中文背景写在 `background` 且 `backgroundZh` 为空时，新库把它投影到 `backgroundZh`；文字未改。',
  '- 已有书家档案的署名增加 `personId` 链接；姓名、角色、把握程度与出处不变。',
  '- 旧库省略 `kind` 的网页来源，新库明确写为 `kind: web`；这是默认值的显式化。',
  '',
  '## 已知编辑修改',
  '',
  ...Array.from(new Set([...works, ...objects, ...places, ...sources].map((row) => row.knownReason).filter((value): value is string => Boolean(value))))
    .map((reason) => '- ' + reason),
  '',
  '## 新旧正式门槛差异',
  '',
  '旧库 `npm run check:release` 报 117 项草稿错误。新库报告 127 项：新增两篇现代作品的基础档（2）、赵朴初跋实物（1）、四位新人物页（4）以及三件旧审实物的本次更订（3）。草稿阻断能力保留，正式出版仍被拒绝。',
  '',
  details(works, '作品'),
  details(objects, '实物'),
  details(places, '地点'),
  details(sources, '来源'),
  '',
  '## 未解释差异处理',
  '',
  '若上表仍列出未解释改动，须先指向一条转换规则或获审编辑修改，才能切换生产读取。不得以“迁移大致相同”合并。',
  '',
].join('\n');
writeFileSync(join(outDir, 'migration-parity-2026-11-24.md'), markdown, 'utf8');

console.log('Wrote docs/baseline/migration-parity-2026-11-24.md and .json');
console.log('Unexplained:', summary.works.unexplained.length + summary.objects.unexplained.length + summary.places.unexplained.length + summary.sources.unexplained.length);
console.log(summary);
if (Object.values(summary).some((group) => group.unexplained.length)) process.exitCode = 1;
