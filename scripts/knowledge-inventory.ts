/**
 * Writes the migration baseline inventory (`docs/baseline/`).
 *
 * Card A needs a numbered list of what existed before the switch, including
 * the two works that lived only in Markdown. Card E reuses the same output as
 * the before side of the parity report. This script only reads; it never
 * changes a source record.
 *
 *   npm run knowledge:inventory
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { ObjectRecord, Source, Work } from '../src/domain/types';
import { loadDatasetFromDisk } from './lib/dataset';

const root = process.cwd();
const outDir = join(root, 'docs', 'baseline');
const site = 'https://yang963852.github.io/beitie-atlas/';
const github = 'https://github.com/yang963852/beitie-atlas/blob/main/';
mkdirSync(outDir, { recursive: true });

interface GuideMeta {
  id: string;
  titleZh: string;
  titleEn: string;
  state: string;
  timelineYear: number | null;
  people: string[];
  objects: string[];
  sources: string[];
  path: string;
}

function readGuides(kind: 'works' | 'people' | 'notes'): GuideMeta[] {
  const dir = join(root, 'knowledge', kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const text = readFileSync(join(dir, name), 'utf8').replace(/\r\n?/g, '\n');
      const header = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
      const fields = (parse(header) ?? {}) as Record<string, unknown>;
      const split = (value: unknown) => typeof value === 'string'
        ? value.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
      const year = fields.timelineYear;
      return {
        id: name.slice(0, -3),
        titleZh: String(fields.titleZh ?? name.slice(0, -3)),
        titleEn: String(fields.titleEn ?? fields.titleZh ?? ''),
        state: String(fields.state ?? 'draft'),
        timelineYear: typeof year === 'number' ? year : null,
        people: split(fields.people),
        objects: split(fields.objects),
        sources: split(fields.sources),
        path: 'knowledge/' + kind + '/' + name,
      };
    });
}

const legacy = loadDatasetFromDisk(root);
const works = legacy.works as Work[];
const objects = legacy.objects as ObjectRecord[];
const sources = legacy.sources as Source[];
const places = legacy.places as Array<Record<string, unknown>>;
const media = legacy.media as Array<Record<string, unknown>>;
const guides = readGuides('works');
const guideById = new Map(guides.map((guide) => [guide.id, guide]));
const objectsByWork = new Map<string, ObjectRecord[]>();
for (const object of objects) {
  const list = objectsByWork.get(object.workId) ?? [];
  list.push(object);
  objectsByWork.set(object.workId, list);
}

const workIds = new Set(works.map((work) => work.id));
const markdownOnly = guides.filter((guide) => !workIds.has(guide.id));
const allWorkIds = [...works.map((work) => work.id), ...markdownOnly.map((guide) => guide.id)];

function date(value: Work['compositionDate'] | ObjectRecord['productionDate']): string {
  return value.original || [value.startYear, value.endYear].filter((part) => part != null).join('–') || value.eraLabel || '未定';
}

function attribution(value: Array<Record<string, unknown>>): string {
  return value
    .map((entry) => {
      const role = String(entry.role ?? '');
      const name = String(entry.name ?? '');
      const certainty = String(entry.certainty ?? '');
      return role === 'unknown' ? name + '（未署名）' : name + '（' + role + '/' + certainty + '）';
    })
    .join('；');
}

function objectLink(id: string) {
  return site + '#/object/' + id;
}

function usedSources(): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (ids: unknown) => {
    if (!Array.isArray(ids)) return;
    for (const id of ids) if (typeof id === 'string') counts.set(id, (counts.get(id) ?? 0) + 1);
  };
  for (const work of works) {
    add(work.sourceRefs);
    for (const entry of work.attribution) add(entry.sourceRefs);
  }
  for (const object of objects) {
    add(object.currentCollection.sourceRefs);
    for (const event of object.provenanceEvents) add(event.sourceRefs);
    for (const relation of object.relationships) add(relation.sourceRefs);
  }
  for (const place of places) {
    add(place.sourceRefs);
    const coordinates = place.coordinates as Record<string, unknown> | null;
    if (coordinates) add(coordinates.sourceRefs);
  }
  for (const guide of guides) add(guide.sources);
  return counts;
}

const used = usedSources();

const summary = {
  generatedAt: '2026-11-24',
  baseRevision: 'c9aa45a',
  counts: {
    legacyWorks: works.length,
    markdownOnlyWorks: markdownOnly.length,
    allWorkEntries: allWorkIds.length,
    objects: objects.length,
    events: objects.reduce((sum, object) => sum + object.provenanceEvents.length, 0),
    places: places.length,
    sources: sources.length,
    media: media.length,
    objectsWithEventCoordinates: objects.filter((object) =>
      object.provenanceEvents.some((event) => {
        const place = places.find((item) => item.id === event.placeId);
        return Boolean(place?.coordinates);
      }),
    ).length,
    worksDraft: works.filter((work) => work.review.state === 'draft').length,
    objectsDraft: objects.filter((object) => object.review.state === 'draft').length,
    guidesDraft: guides.filter((guide) => guide.state === 'draft').length,
  },
  markdownOnly: markdownOnly.map((guide) => ({
    id: guide.id,
    titleZh: guide.titleZh,
    timelineYear: guide.timelineYear,
    path: github + guide.path,
    publicLink: site + '#/work/' + guide.id,
  })),
  works: works.map((work) => ({
    id: work.id,
    titleZh: work.titles.zh,
    titleEn: work.titles.en,
    dynastyId: work.dynastyId,
    dynastyQualifier: work.dynastyQualifier,
    date: date(work.compositionDate),
    dateOriginal: work.compositionDate.original,
    studyCategory: work.studyCategory,
    review: work.review.state,
    attribution: work.attribution.map((entry) => ({
      role: entry.role,
      name: entry.name,
      nameEn: entry.nameEn,
      certainty: entry.certainty,
      sources: entry.sourceRefs,
    })),
    sources: work.sourceRefs,
    objectIds: (objectsByWork.get(work.id) ?? []).map((object) => object.id),
    guide: guideById.get(work.id) ? {
      state: guideById.get(work.id)!.state,
      timelineYear: guideById.get(work.id)!.timelineYear,
      path: guideById.get(work.id)!.path,
    } : null,
    legacySource: 'data/works/' + work.id + '.json',
    publicLink: site + '#/work/' + work.id,
    githubSource: github + 'data/works/' + work.id + '.json',
  })),
  objects: objects.map((object) => ({
    id: object.id,
    workId: object.workId,
    titleZh: object.titles.zh,
    objectType: object.objectType,
    productionDate: date(object.productionDate),
    productionOriginal: object.productionDate.original,
    catalogNumber: object.catalogNumber,
    survivalStatus: object.survivalStatus,
    collectionKind: object.currentCollection.locationKind,
    placeId: object.currentCollection.placeId,
    review: object.review.state,
    eventIds: object.provenanceEvents.map((event) => event.id),
    relationships: object.relationships.map((relation) => ({
      type: relation.type,
      target: relation.targetObjectId,
    })),
    media: media.filter((item) => item.objectId === object.id).map((item) => item.id),
    legacySource: 'data/objects/' + object.id + '.json',
    publicLink: objectLink(object.id),
    githubSource: github + 'data/objects/' + object.id + '.json',
  })),
  events: objects.flatMap((object) => object.provenanceEvents.map((event) => ({
    id: event.id,
    objectId: object.id,
    workId: object.workId,
    type: event.type,
    date: date(event.date),
    dateOriginal: event.date.original,
    certainty: event.certainty,
    placeId: event.placeId,
    placeWording: event.placeWording,
    sources: event.sourceRefs,
  }))),
  sources: sources.map((source) => ({
    id: source.id,
    kind: source.kind ?? 'web',
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    locator: source.locator,
    accessedAt: source.accessedAt,
    citedBy: used.get(source.id) ?? 0,
  })),
  media: media.map((item) => ({
    id: item.id,
    objectId: item.objectId,
    license: item.license,
    credit: item.credit,
    rightsEvidence: item.rightsEvidence,
  })),
};

writeFileSync(join(outDir, 'inventory-2026-11-24.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');

function table(headers: string[], rows: string[][]) {
  return [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map((row) => '| ' + row.map((cell) => String(cell).replace(/\|/g, '\\|')).join(' | ') + ' |'),
  ].join('\n');
}

const lines = [
  '# 旧库清单 · 2026-11-24',
  '',
  '迁移基线 `c9aa45a`。本清单由 `npm run knowledge:inventory` 只读生成；ID、审核、署名、事件、来源、媒体与公开链接均取自当时的输入文件。' + '旧 JSON 与 Markdown 导读并存，网页入口数为 **' + allWorkIds.length + '**，其中 **' + markdownOnly.length + '** 个作品只存在于 Markdown。',
  '',
  '## 总览',
  '',
  table(['项目', '数量'], [
    ['作品 JSON', String(works.length)],
    ['仅有 Markdown 的作品', String(markdownOnly.length)],
    ['作品入口合计', String(allWorkIds.length)],
    ['实物', String(objects.length)],
    ['流传事件', String(summary.counts.events)],
    ['地点', String(places.length)],
    ['来源', String(sources.length)],
    ['媒体', String(media.length)],
    ['作品草稿', String(summary.counts.worksDraft)],
    ['实物草稿', String(summary.counts.objectsDraft)],
    ['作品导读草稿', String(summary.counts.guidesDraft)],
    ['事件地点有坐标的实物', String(summary.counts.objectsWithEventCoordinates)],
  ]),
  '',
  '## 仅存在于 Markdown 的作品',
  '',
  table(['ID', '题名', 'timelineYear', 'Markdown', '公开链接'], markdownOnly.map((guide) => [
    '`' + guide.id + '`',
    guide.titleZh,
    guide.timelineYear == null ? '—' : String(guide.timelineYear),
    '[源稿](' + github + guide.path + ')',
    '[网站](' + site + '#/work/' + guide.id + ')',
  ])),
  '',
  '这两部作品没有 `data/works/` JSON、实物或结构化年代。迁移时须建立作品档案；1962 年指字帖出版，1976 年指补跋。',
  '',
  '## 作品',
  '',
  table(
    ['ID', '题名', '时代', '年代原文', '审核', '署名', '实物', '导读', '公开链接', '旧源稿'],
    works.map((work) => {
      const guide = guideById.get(work.id);
      return [
        '`' + work.id + '`',
        work.titles.zh,
        work.dynastyId + (work.dynastyQualifier ? '／' + work.dynastyQualifier : ''),
        date(work.compositionDate),
        work.review.state,
        attribution(work.attribution as unknown as Array<Record<string, unknown>>),
        (objectsByWork.get(work.id) ?? []).map((object) => '`' + object.id + '`').join('、') || '—',
        guide ? guide.state + '（' + (guide.timelineYear ?? '—') + '）' : '—',
        '[作品](' + site + '#/work/' + work.id + ')',
        '[JSON](' + github + 'data/works/' + work.id + '.json)',
      ];
    }),
  ),
  '',
  '## 实物',
  '',
  table(
    ['ID', '所属作品', '题名', '类型', '制作年代', '馆号', '馆藏', '审核', '事件', '媒体', '公开链接', '旧源稿'],
    objects.map((object) => [
      '`' + object.id + '`',
      '`' + object.workId + '`',
      object.titles.zh,
      object.objectType,
      date(object.productionDate),
      object.catalogNumber ?? '—',
      object.currentCollection.locationKind + (object.currentCollection.placeId ? '／`' + object.currentCollection.placeId + '`' : ''),
      object.review.state,
      object.provenanceEvents.map((event) => '`' + event.id + '`').join('、') || '—',
      media.filter((item) => item.objectId === object.id).map((item) => '`' + item.id + '`').join('、') || '—',
      '[实物](' + objectLink(object.id) + ')',
      '[JSON](' + github + 'data/objects/' + object.id + '.json)',
    ]),
  ),
  '',
  '## 流传事件',
  '',
  table(
    ['ID', '实物', '类型', '年代', '把握', '地点', '地点原文', '来源'],
    summary.events.map((event) => [
      '`' + event.id + '`',
      '`' + event.objectId + '`',
      event.type,
      event.date,
      event.certainty,
      event.placeId ?? '空',
      event.placeWording ?? '—',
      event.sources.map((id) => '`' + id + '`').join('、'),
    ]),
  ),
  '',
  '## 来源',
  '',
  table(
    ['ID', '类型', '出版者', '题名', '定位', '查阅', '被引'],
    summary.sources.map((source) => [
      '`' + source.id + '`',
      source.kind,
      source.publisher,
      source.url ? '[' + source.title + '](' + source.url + ')' : source.title,
      source.locator ?? '—',
      source.accessedAt,
      String(source.citedBy),
    ]),
  ),
  '',
  '## 媒体',
  '',
  table(
    ['ID', '实物', '许可', '署名', '权利依据'],
    summary.media.map((item) => [
      '`' + String(item.id) + '`',
      '`' + String(item.objectId) + '`',
      String(item.license),
      String(item.credit),
      String(item.rightsEvidence),
    ]),
  ),
  '',
  '## 已知基线缺口',
  '',
  '- 两篇只有 Markdown 的作品没有结构化作品档；迁移后须出现在作品目录、时代总览与搜索中。',
  '- 事件地点有坐标的实物仅 ' + summary.counts.objectsWithEventCoordinates + ' 件；其余保持文字与出处，不生成点位。',
  '- 旧 JSON 与 Markdown 导读的审核状态各自独立；迁移不得把导读状态复制给基础档案。',
  '- 旧 JSON 是迁移对照的冻结输入，自切换提交起不再被网页、校验或发布读取。',
  '',
];

writeFileSync(join(outDir, 'inventory-2026-11-24.md'), lines.join('\n'), 'utf8');
console.log('Wrote docs/baseline/inventory-2026-11-24.md and .json');
console.log(summary.counts);
