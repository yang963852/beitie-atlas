/**
 * One-time migration from the frozen JSON corpus and the old guide articles to
 * `knowledge/` Markdown records.
 *
 *   npx tsx scripts/migrate-legacy.ts --write
 *
 * The legacy files are only read. Every output file is ordinary Markdown with
 * a stable ID as its filename; after this run the compiler is the only reader.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type {
  Attribution,
  Claim,
  HistoricalDate,
  ObjectRecord,
  Place,
  Source,
  Work,
} from '../src/domain/types';
import { loadDatasetFromDisk } from './lib/dataset';

const root = process.cwd();
const write = process.argv.includes('--write');
const knowledge = join(root, 'knowledge');

interface LegacyArticle {
  id: string;
  fields: Record<string, unknown>;
  body: string;
  zh: string;
  en: string;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function splitArticle(kind: string, id: string): LegacyArticle {
  const path = join(knowledge, kind, id + '.md');
  const input = readFileSync(path, 'utf8').replace(/\r\n?/g, '\n');
  const header = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(input);
  const fields = (parse(header?.[1] ?? '') ?? {}) as Record<string, unknown>;
  const body = input.slice(header?.[0].length ?? 0);
  const zhMatch = /^## 中文[ \t]*$/m.exec(body);
  const enMatch = /^## English[ \t]*$/m.exec(body);
  const zh = zhMatch ? body.slice(zhMatch.index + zhMatch[0].length, enMatch?.index).trim() : '';
  const en = enMatch ? body.slice(enMatch.index + enMatch[0].length).trim() : '';
  return { id, fields, body: body.trim(), zh, en };
}

function listArticles(kind: string): LegacyArticle[] {
  const dir = join(knowledge, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => splitArticle(kind, name.slice(0, -3)));
}

function listWorkGuides(): LegacyArticle[] {
  const dir = join(knowledge, 'works');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .flatMap((name) => {
      const id = name.slice(0, -3);
      const input = readFileSync(join(dir, name), 'utf8').replace(/\r\n?/g, '\n');
      const header = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(input);
      const fields = (parse(header?.[1] ?? '') ?? {}) as Record<string, unknown>;
      if (!fields.guide || typeof fields.guide !== 'object') return [];
      const body = input.slice(header?.[0].length ?? 0);
      const section = /^## 导读[ \t]*$/m.exec(body);
      if (!section) return [];
      const guideBody = body.slice(section.index + section[0].length);
      const next = /^## [^\n]+$/m.exec(guideBody);
      const text = next ? guideBody.slice(0, next.index) : guideBody;
      const zh = /^### 中文[ \t]*$/m.exec(text);
      const en = /^### English[ \t]*$/m.exec(text);
      return [{
        id,
        fields: fields.guide as Record<string, unknown>,
        body: text.trim(),
        zh: zh ? text.slice(zh.index + zh[0].length, en?.index).trim() : '',
        en: en ? text.slice(en.index + en[0].length).trim() : '',
      }];
    });
}

function guideList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue;
      out[key] = clean(item);
    }
    return out;
  }
  return value;
}

function document(fields: Record<string, unknown>, body: string): string {
  return '---\n' + stringify(clean(fields), { lineWidth: 0 }) + '---\n\n' + body.trim() + '\n';
}

function bulletSection(notesZh: string[] | undefined, notes: string[] | undefined): string {
  const zh = notesZh ?? [];
  const en = notes ?? [];
  if (!zh.length && !en.length) return '';
  const lines = ['## 待考', ''];
  if (zh.length) lines.push('### 中文', '', ...zh.map((note) => '- ' + note), '');
  if (en.length) lines.push('### English', '', ...en.map((note) => '- ' + note), '');
  return lines.join('\n');
}

function dateInput(value: HistoricalDate): Record<string, unknown> {
  return {
    kind: value.kind,
    start: value.startYear,
    month: value.startMonth,
    end: value.endYear,
    endMonth: value.endMonth,
    era: value.eraLabel,
    original: value.original,
    certainty: value.certainty,
    meaning: value.meaning,
    note: value.note,
  };
}

const personByLegacyName: Record<string, string> = {
  '颜真卿': 'yan-zhenqing',
  '王羲之': 'wang-xizhi',
  '冯承素': 'feng-chengsu',
  '翁方纲': 'weng-fanggang',
  '鲜于枢': 'xianyu-shu',
  '沈尹默': 'shen-yinmo',
  '赵朴初': 'zhao-puchu',
};

function attributionInput(entry: Attribution): Record<string, unknown> {
  return {
    role: entry.role,
    name: entry.name,
    nameEn: entry.nameEn,
    person: entry.personId ?? personByLegacyName[entry.name],
    certainty: entry.certainty,
    sources: entry.sourceRefs,
    note: entry.note,
    noteZh: entry.noteZh,
  };
}

function claimInput(claim: Claim): Record<string, unknown> {
  return {
    id: claim.id,
    kind: claim.kind,
    predicate: claim.predicate,
    value: claim.value,
    voice: claim.voice,
    person: claim.personId,
    stance: claim.stance,
    certainty: claim.certainty,
    sources: claim.sourceRefs,
    locator: claim.locator,
    note: claim.note,
    noteZh: claim.noteZh,
  };
}

function workBody(work: Work, guide: LegacyArticle | undefined): string {
  const lines = ['# ' + work.titles.zh, '', '## 背景', ''];
  const recorded = work.backgroundZh?.trim() || (/[\u3400-\u9fff]/.test(work.background) ? work.background.trim() : '');
  const english = recorded === work.background.trim() ? '' : work.background;
  if (recorded) lines.push('### 中文', '', recorded, '');
  if (english) lines.push('### English', '', english);
  const notes = bulletSection(work.notesZh, work.notes);
  if (notes) lines.push('', notes);
  if (guide) {
    lines.push('', '## 导读', '', '### 中文', '', guide.zh);
    if (guide.en) lines.push('', '### English', '', guide.en);
  }
  return lines.join('\n');
}

function objectBody(object: ObjectRecord): string {
  const notes = bulletSection(object.notesZh, object.notes);
  return ['# ' + object.titles.zh, notes ? '\n' + notes : ''].join('\n');
}

const legacy = loadDatasetFromDisk(root);
const works = legacy.works as Work[];
const objects = legacy.objects as ObjectRecord[];
const places = legacy.places as Place[];
const sources = legacy.sources as Source[];
const media = legacy.media as Array<Record<string, unknown>>;
const workGuides = new Map(listWorkGuides().map((guide) => [guide.id, guide]));
const peopleArticles = listArticles('people');
const noteArticles = listArticles('notes');
const relationsPath = join(root, 'data/knowledge-relations.json');
const relations = existsSync(relationsPath) ? JSON.parse(readFileSync(relationsPath, 'utf8')) as Array<Record<string, unknown>> : [];

const extraSources: Source[] = [
  {
    id: 'src-jizhi-colophon-bingxu',
    kind: 'web',
    title: '祭侄文稿 · 鲜于枢丙戌跋',
    publisher: '國立故宮博物院',
    url: 'https://digitalarchive.npm.gov.tw/Collection/Detail/3?dep=P',
    publicationDate: null,
    accessedAt: '2026-11-18',
    locator: '拖尾鲜于枢丙戌署款跋；记至元壬午（1282）得卷于曹彦礼',
    note: '与戊子署款跋同卷，年份记载不同；分别定位，不取平均值。',
  },
  {
    id: 'src-jizhi-colophon-wuzi',
    kind: 'web',
    title: '祭侄文稿 · 鲜于枢戊子跋',
    publisher: '國立故宮博物院',
    url: 'https://digitalarchive.npm.gov.tw/Collection/Detail/3?dep=P',
    publicationDate: null,
    accessedAt: '2026-11-18',
    locator: '拖尾鲜于枢戊子署款跋；记至元癸未（1283）',
    note: '与丙戌署款跋同卷，年份记载不同；分别定位，不取平均值。',
  },
  {
    id: 'src-wikidata-drum-tower',
    kind: 'web',
    title: 'Drum Tower of Xi’an',
    publisher: 'Wikidata',
    url: 'https://www.wikidata.org/wiki/Q2742315',
    publicationDate: null,
    accessedAt: '2026-11-18',
    locator: 'P625 coordinate statement',
    note: 'A modern reference landmark for orientation, not the find-place of the stone.',
  },
  {
    id: 'src-commons-xincheng-square',
    kind: 'web',
    title: '新城广场',
    publisher: 'Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/File:新城广场_-_panoramio.jpg',
    publicationDate: null,
    accessedAt: '2026-11-18',
    locator: 'Camera location on the file page',
    note: 'A photograph location used only to identify the neighbourhood.',
  },
];
const allSources = [...sources, ...extraSources];

const extraPlaces: Place[] = [
  {
    id: 'place-shanghai-museum',
    names: { zh: '上海博物馆', en: 'Shanghai Museum' },
    historicalName: null,
    kind: 'institution',
    coordinates: null,
    sourceRefs: ['src-shm-zhao-shen-colophon'],
    notes: ['The museum entry names the holding institution but gives no street address or coordinate.'],
    notesZh: ['馆方条目只记收藏单位为上海博物馆，未给门牌地址或坐标。'],
  },
  {
    id: 'place-xian-drum-tower',
    names: { zh: '西安鼓楼', en: 'Xi’an Drum Tower' },
    historicalName: null,
    kind: 'historical-site',
    coordinates: {
      longitude: 108.938931,
      latitude: 34.261789,
      crs: 'WGS84',
      precision: 'site',
      sourceRefs: ['src-wikidata-drum-tower'],
      method: 'secondary-database',
      verification: 'unverified',
      note: 'A modern landmark used to orient the former governor’s compound; not the find-spot itself.',
      noteZh: '用于辨认旧省长公署一带的现代参照地标，不是出土地点本身。',
    },
    sourceRefs: ['src-wikidata-drum-tower'],
    notes: ['The museum describes the former compound as east and northeast of today’s Drum Tower.'],
    notesZh: ['馆方把旧省长公署描述在今鼓楼以东及东北一带。'],
  },
  {
    id: 'place-xincheng-square-view',
    names: { zh: '新城广场取景处', en: 'Xincheng Square viewpoint' },
    historicalName: null,
    kind: 'district',
    coordinates: {
      longitude: 108.949565,
      latitude: 34.265393,
      crs: 'WGS84',
      precision: 'site',
      sourceRefs: ['src-commons-xincheng-square'],
      method: 'secondary-database',
      verification: 'unverified',
      note: 'A photograph’s camera location used to identify the neighbourhood, not a surveyed historical position.',
      noteZh: '采用照片拍摄位置辨认街区，不是实测的历史位置。',
    },
    sourceRefs: ['src-commons-xincheng-square'],
    notes: ['The museum records the stone northeast of the Xincheng building; the exact historical position is unknown.'],
    notesZh: ['馆方记载石碑立在新城大楼东北侧；确切历史位置未详。'],
  },
];
const allPlaces = [...places, ...extraPlaces];

// ---------------------------------------------------------------- special edits
const jizhi = objects.find((object) => object.id === 'witness-jizhi');
if (jizhi) {
  const index = jizhi.provenanceEvents.findIndex((event) => event.id === 'witness-jizhi-yuan-acquisition');
  if (index >= 0) {
    jizhi.provenanceEvents.splice(index, 1,
      {
        id: 'witness-jizhi-acquisition-1282',
        objectId: jizhi.id,
        type: 'custody',
        date: { kind: 'single', startYear: 1282, startMonth: null, endYear: 1282, endMonth: null, eraLabel: null, original: '至元壬午（1282）', certainty: 'documented', note: null },
        placeId: null,
        placeWording: null,
        summary: 'Xianyu Shu’s colophon signed in bingxu gives 1282 (Zhiyuan renwu) for receiving the scroll from Cao Yanli.',
        summaryZh: '鲜于枢丙戌署款的跋记至元壬午（1282）从曹彦礼处得卷。',
        sourceRefs: ['src-jizhi-colophon-bingxu'],
        certainty: 'documented',
      },
      {
        id: 'witness-jizhi-acquisition-1283',
        objectId: jizhi.id,
        type: 'custody',
        date: { kind: 'single', startYear: 1283, startMonth: null, endYear: 1283, endMonth: null, eraLabel: null, original: '至元癸未（1283）', certainty: 'documented', note: null },
        placeId: null,
        placeWording: null,
        summary: 'Xianyu Shu’s colophon signed in wuzi gives 1283 (Zhiyuan guiwei) for the same acquisition from Cao Yanli.',
        summaryZh: '鲜于枢戊子署款的跋记至元癸未（1283）从曹彦礼处得卷。',
        sourceRefs: ['src-jizhi-colophon-wuzi'],
        certainty: 'documented',
      },
    );
  }
  jizhi.claims = [
    ...(jizhi.claims ?? []),
    {
      id: 'claim-jizhi-same-acquisition',
      kind: 'editor-interpretation',
      predicate: 'event-grouping',
      value: '两跋所记得卷暂归为同一事件',
      voice: '项目编辑',
      stance: 'neutral',
      certainty: 'disputed',
      sourceRefs: ['src-jizhi-colophon-bingxu', 'src-jizhi-colophon-wuzi'],
      locator: '卷后鲜于枢两跋',
      note: 'The two colophons agree on the holder but give 1282 and 1283. Grouping them is an editorial inference; the place of transfer remains unrecorded.',
      noteZh: '两跋同记曹彦礼，却分别写 1282 与 1283。归为同一次得卷是编辑推定，交接地点未详。',
    },
  ];
}

const yanStone = objects.find((object) => object.id === 'yan-qinli-original-stele');
if (yanStone) {
  const references: Record<string, { place: string; zh: string; en: string; labelZh: string; labelEn: string }> = {
    'ev-1922-discovery': {
      place: 'place-xian-drum-tower',
      zh: '馆方把省长公署旧址描述在今鼓楼以东及东北一带。图中标记鼓楼。',
      en: 'The museum places the former compound east and northeast of today’s Drum Tower. The pin marks the tower.',
      labelZh: '公署出土',
      labelEn: 'Unearthed',
    },
    'ev-1922-erected-in-courtyard': {
      place: 'place-xian-drum-tower',
      zh: '馆方把省长公署旧址描述在今鼓楼以东及东北一带。图中标记鼓楼。',
      en: 'The museum places the former compound east and northeast of today’s Drum Tower. The pin marks the tower.',
      labelZh: '立于前院',
      labelEn: 'Courtyard',
    },
    'ev-1928-xincheng': {
      place: 'place-xincheng-square-view',
      zh: '馆方记载当年立碑处在新城大楼东北侧。图中采用今新城广场照片的拍摄位置，供辨认街区。',
      en: 'The museum records the stone northeast of the Xincheng building. A photograph’s camera location at Xincheng Square identifies the neighbourhood.',
      labelZh: '迁往新城',
      labelEn: 'Xincheng',
    },
    'ev-1948-beilin': {
      place: 'place-xian-beilin-museum',
      zh: '馆方记载石碑于 1948 年迁入西安碑林。图中标记今天的博物馆，旧日安放位置未详。',
      en: 'The stone entered the Xi’an Beilin in 1948. The pin marks today’s museum. The historical position within the grounds is unknown.',
      labelZh: '移入碑林',
      labelEn: 'Beilin',
    },
  };
  for (const event of yanStone.provenanceEvents) {
    const reference = references[event.id];
    if (!reference) continue;
    event.referencePlaceId = reference.place;
    event.referenceNote = reference.en;
    event.referenceNoteZh = reference.zh;
    event.shortLabel = reference.labelEn;
    event.shortLabelZh = reference.labelZh;
  }
}

const lantingCopy = objects.find((object) => object.id === 'witness-lanting');
if (lantingCopy) {
  lantingCopy.version = {
    label: '神龙本',
    basis: '馆方以卷首“神龙”印与题跋称名',
    sourceRefs: ['src-catalogue-lanting'],
    note: 'The museum discusses the date of the Shenlong seal; the label is a transmission name, not a claim that the seal is contemporary with the copy.',
    noteZh: '馆方讨论神龙印的年代；此称名是流传中的版本名，不等于认定印章与摹本同时。',
  };
  lantingCopy.attribution = [
    {
      role: 'copyist',
      name: '冯承素（传）',
      nameEn: 'Feng Chengsu (traditionally attributed)',
      personId: 'feng-chengsu',
      certainty: 'disputed',
      sourceRefs: ['src-catalogue-lanting'],
      note: 'The traditional attribution comes from Xiang Yuanbian’s colophon; the museum questions it.',
      noteZh: '传统归名出自项元汴题记；故宫博物院对此提出疑问。',
    },
  ];
  lantingCopy.claims = [
    {
      id: 'claim-lanting-feng-support',
      kind: 'scholarly-opinion',
      predicate: 'copyist-attribution',
      value: '传统归为冯承素摹',
      voice: '项元汴题记（馆方转引）',
      personId: 'feng-chengsu',
      stance: 'supports',
      certainty: 'disputed',
      sourceRefs: ['src-catalogue-lanting'],
      locator: '卷后项元汴题记',
      note: 'The colophon is the basis for the traditional name, not independent proof.',
      noteZh: '题记是传统归名的依据，不是独立证明。',
    },
    {
      id: 'claim-lanting-feng-question',
      kind: 'source-report',
      predicate: 'copyist-attribution',
      value: '馆方对冯承素归名提出疑问',
      voice: '故宫博物院',
      stance: 'questions',
      certainty: 'documented',
      sourceRefs: ['src-catalogue-lanting'],
      locator: '藏品说明中对归名与神龙印年代的讨论',
      note: 'The museum does not substitute another named copyist.',
      noteZh: '馆方没有因此改归另一名摹者。',
    },
  ];
}

const dingwu = objects.find((object) => object.id === 'dingwu-zhan' || object.id === 'dpm-233468');
if (dingwu) {
  dingwu.version = {
    label: '定武本',
    basis: '馆方题名与拓本特征',
    sourceRefs: ['src-dpm-233468'],
    note: 'The museum names this rubbing as a Dingwu version and describes its recutting features.',
    noteZh: '馆方以定武本题名，并记其翻刻特征。',
  };
}

const liqiRubbing = objects.find((object) => object.id === 'liqi-ming-44512');
if (liqiRubbing) {
  liqiRubbing.claims = [
    {
      id: 'claim-liqi-weng-writers',
      kind: 'scholarly-opinion',
      predicate: 'writer-count',
      value: '翁方纲认为碑文由七人书写',
      voice: '翁方纲（馆方条目转引）',
      stance: 'neutral',
      certainty: 'documented',
      sourceRefs: ['src-dpm-234635'],
      locator: '馆方条目所引翁方纲说',
      note: 'A sourced opinion, not a roster of seven established calligraphers.',
      noteZh: '这是有出处的意见，不据此生成七名确定书家。',
    },
  ];
}

const zhangRubbing = objects.find((object) => object.id === 'rubbing-zhang-menglong-bei');
if (zhangRubbing) {
  zhangRubbing.claims = [
    {
      id: 'claim-zhang-menglong-36-pages',
      kind: 'source-report',
      predicate: 'album-leaf-count',
      value: '三十六页',
      voice: '故宫博物院',
      stance: 'neutral',
      certainty: 'documented',
      sourceRefs: ['src-dpm-zhang-menglong'],
      locator: '馆方条目著录剪裱册页数',
      note: 'The leaf count belongs to this Ming rubbing album only; neither the stone nor another rubbing inherits it.',
      noteZh: '页数只属于此明拓册；原石与另一拓本都不继承。',
    },
  ];
}

// ---------------------------------------------------------------- modern works
const modernGuides = ['shen-yinmo-dakai-jia', 'zhao-puchu-shen-colophon'].map((id) => {
  const guide = workGuides.get(id);
  if (!guide) throw new Error('Missing modern work guide: ' + id);
  return guide;
});

const modernWorks: Array<{ work: Work; guide: LegacyArticle; object?: ObjectRecord }> = [
  {
    work: {
      id: 'shen-yinmo-dakai-jia',
      titles: { zh: '甲种本大楷习字帖', en: 'Large Regular-Script Copybook, Edition A' },
      aliases: [],
      attribution: [{
        role: 'calligrapher', name: '沈尹默', nameEn: 'Shen Yinmo', personId: 'shen-yinmo',
        certainty: 'documented', sourceRefs: ['src-xiling-shen-chronology', 'src-pku-shen-teaching'],
        note: 'The chronology and the teaching study identify Shen as the author of the copybook.',
        noteZh: '年表与教学研究均以沈尹默为此帖作者。',
      }],
      studyCategory: 'tie',
      dynastyId: 'prc',
      dynastyQualifier: null,
      compositionDate: {
        kind: 'single', startYear: 1962, startMonth: null, endYear: 1962, endMonth: null,
        eraLabel: null, original: '1962年', certainty: 'documented', meaning: 'publication',
        note: 'The year is the publication year given by the Xiling chronology, not a composition date.',
      },
      script: '楷书',
      background: 'A large regular-script copybook Shen Yinmo wrote for young learners. The Xiling chronology lists its publication by Shanghai Education Publishing House in 1962; the first month, printing and an identifiable library copy remain open.',
      backgroundZh: '沈尹默为青少年编写的大楷习字帖。西泠印社年表列于1962年由上海教育出版社出版；初版月份、印次与可辨认馆藏册仍待核实。',
      sourceRefs: ['src-xiling-shen-chronology', 'src-pku-shen-teaching'],
      review: {
        state: 'draft',
        note: 'The base record was created during the 2026-11 migration. The guide keeps its earlier review state; publication details still need a physical copy.',
        noteZh: '基础档案于 2026 年 11 月迁移时建立；导读保留原审核状态；出版细节仍待实物核对。',
      },
      notes: ['The English title is a project translation for navigation.'],
      notesZh: ['英文标题为本项目为检索所译。'],
    },
    guide: modernGuides[0],
  },
  {
    work: {
      id: 'zhao-puchu-shen-colophon',
      titles: { zh: '行书跋沈尹默论书札卷', en: 'Colophon to Shen Yinmo’s Writing on Calligraphy' },
      aliases: [],
      attribution: [{
        role: 'colophon-author', name: '赵朴初', nameEn: 'Zhao Puchu', personId: 'zhao-puchu',
        certainty: 'documented', sourceRefs: ['src-shm-zhao-shen-colophon'],
        note: 'The Shanghai Museum describes Zhao’s colophon as running script.',
        noteZh: '上海博物馆将赵朴初所写这一段定为行书。',
      }],
      studyCategory: 'tie',
      dynastyId: 'prc',
      dynastyQualifier: null,
      compositionDate: {
        kind: 'single', startYear: 1976, startMonth: null, endYear: 1976, endMonth: null,
        eraLabel: null, original: '1976年', certainty: 'documented', meaning: 'colophon',
        note: 'The year belongs to Zhao’s colophon, not to Shen’s original letters.',
      },
      script: '行书',
      background: 'In 1976 Zhao Puchu added a colophon to Shen Yinmo’s letters on calligraphy. The Shanghai Museum records Zhao’s section as running script, 20.8 by 10.0 cm; Shen’s writing date remains open.',
      backgroundZh: '1976年，赵朴初在沈尹默论书札后题跋。上海博物馆记赵跋为行书，高20.8厘米、宽10.0厘米；沈氏原札的书写年月尚待查明。',
      sourceRefs: ['src-shm-zhao-shen-colophon'],
      review: {
        state: 'draft',
        note: 'The base record was created during the 2026-11 migration. The guide keeps its earlier review state.',
        noteZh: '基础档案于 2026 年 11 月迁移时建立；导读保留原审核状态。',
      },
      notes: [],
      notesZh: [],
    },
    guide: modernGuides[1],
    object: {
      id: 'witness-zhao-shen-colophon',
      workId: 'zhao-puchu-shen-colophon',
      objectType: 'ink-manuscript',
      titles: { zh: '行书跋沈尹默论书札卷（赵朴初跋）', en: 'Zhao Puchu’s colophon to Shen Yinmo’s letters' },
      productionDate: {
        kind: 'single', startYear: 1976, startMonth: null, endYear: 1976, endMonth: null,
        eraLabel: null, original: '1976年', certainty: 'documented', meaning: 'colophon', note: null,
      },
      catalogNumber: null,
      dimensions: { raw: '高20.8厘米，宽10.0厘米', note: '馆方所记赵朴初跋一段的尺寸；沈尹默原札另记尺寸。' },
      survivalStatus: 'surviving',
      relationships: [],
      currentCollection: {
        locationKind: 'collection-institution', placeId: 'place-shanghai-museum',
        sourceRefs: ['src-shm-zhao-shen-colophon'], sourceAccessedAt: '2026-11-24', assertionAsOf: null,
        note: 'The museum entry names the holding institution but gives no storage room or display status.',
        noteZh: '馆方条目只记收藏单位，未给库房或展出状态。',
      },
      provenanceEvents: [],
      review: {
        state: 'draft',
        note: 'Created during the 2026-11 migration; the museum entry has not been independently reviewed.',
        noteZh: '2026 年 11 月迁移时建立；馆方条目尚未经独立编辑复核。',
      },
      notes: ['The writing date of Shen Yinmo’s original letters remains open.', 'The museum gives separate measurements for Shen’s text and Zhao’s colophon.'],
      notesZh: ['沈尹默原札的书写年月尚待查明。', '馆方对沈氏原札与赵跋分别记尺寸。'],
    },
  },
];

// ---------------------------------------------------------------- write records
if (!write) {
  console.log('Dry run. Re-run with --write to create knowledge/ records.');
  process.exit(0);
}

for (const kind of ['works', 'objects', 'places', 'sources', 'people', 'notes']) {
  mkdirSync(join(knowledge, kind), { recursive: true });
}

for (const work of works) {
  const guide = workGuides.get(work.id);
  const fields = {
    schemaVersion: 1,
    titleZh: work.titles.zh,
    titleEn: work.titles.en,
    aliases: work.aliases,
    studyCategory: work.studyCategory,
    dynastyId: work.dynastyId,
    dynastyQualifier: work.dynastyQualifier,
    date: dateInput(work.compositionDate),
    script: work.script,
    attribution: work.attribution.map(attributionInput),
    sources: work.sourceRefs,
    review: work.review,
    claims: work.claims?.map(claimInput),
    guide: guide ? {
      state: text(guide.fields.state, 'draft'),
      timelineYear: guide.fields.timelineYear,
      people: guideList(guide.fields.people),
      objects: guideList(guide.fields.objects),
      sources: guideList(guide.fields.sources),
    } : undefined,
  };
  writeFileSync(join(knowledge, 'works', work.id + '.md'), document(fields, workBody(work, guide)), 'utf8');
}

for (const modern of modernWorks) {
  const guide = modern.guide;
  const fields = {
    schemaVersion: 1,
    titleZh: modern.work.titles.zh,
    titleEn: modern.work.titles.en,
    aliases: modern.work.aliases,
    studyCategory: modern.work.studyCategory,
    dynastyId: modern.work.dynastyId,
    dynastyQualifier: modern.work.dynastyQualifier,
    date: dateInput(modern.work.compositionDate),
    script: modern.work.script,
    attribution: modern.work.attribution.map(attributionInput),
    sources: modern.work.sourceRefs,
    review: modern.work.review,
    claims: modern.work.claims?.map(claimInput),
    guide: {
      state: text(guide.fields.state, 'draft'),
      timelineYear: guide.fields.timelineYear,
      people: guideList(guide.fields.people),
      objects: guideList(guide.fields.objects),
      sources: guideList(guide.fields.sources),
    },
  };
  writeFileSync(join(knowledge, 'works', modern.work.id + '.md'), document(fields, workBody(modern.work, guide)), 'utf8');
  if (modern.object) {
    const object = modern.object;
    const objectFields = {
      schemaVersion: 1,
      work: object.workId,
      objectType: object.objectType,
      titleZh: object.titles.zh,
      titleEn: object.titles.en,
      date: dateInput(object.productionDate),
      catalogNumber: object.catalogNumber,
      dimensions: object.dimensions,
      survival: object.survivalStatus,
      relationships: object.relationships.map((relation) => ({ type: relation.type, target: relation.targetObjectId, sources: relation.sourceRefs, note: relation.note })),
      collection: {
        kind: object.currentCollection.locationKind,
        place: object.currentCollection.placeId,
        sources: object.currentCollection.sourceRefs,
        accessedAt: object.currentCollection.sourceAccessedAt,
        asOf: object.currentCollection.assertionAsOf,
        note: object.currentCollection.note,
        noteZh: object.currentCollection.noteZh,
      },
      events: object.provenanceEvents.map((event) => ({
        id: event.id, type: event.type, date: dateInput(event.date), place: event.placeId,
        placeWording: event.placeWording, referencePlace: event.referencePlaceId,
        referenceNote: event.referenceNote, referenceNoteZh: event.referenceNoteZh,
        shortLabel: event.shortLabel, shortLabelZh: event.shortLabelZh,
        summary: event.summary, summaryZh: event.summaryZh,
        sources: event.sourceRefs, certainty: event.certainty,
      })),
      attribution: object.attribution?.map(attributionInput),
      version: object.version ? {
        label: object.version.label,
        basis: object.version.basis,
        sources: object.version.sourceRefs,
        note: object.version.note,
        noteZh: object.version.noteZh,
      } : undefined,
      claims: object.claims?.map(claimInput),
      review: object.review,
    };
    writeFileSync(join(knowledge, 'objects', object.id + '.md'), document(objectFields, objectBody(object)), 'utf8');
  }
}

for (const object of objects) {
  const objectMedia = media.filter((item) => item.objectId === object.id).map((item) => ({
    id: text(item.id), asset: text(item.assetPathOrUrl), creator: text(item.creator),
    sources: Array.isArray(item.sourceRefs) ? item.sourceRefs : [], license: text(item.license),
    credit: text(item.credit), rightsEvidence: text(item.rightsEvidence), acquiredAt: text(item.acquiredAt),
  }));
  const fields = {
    schemaVersion: 1,
    work: object.workId,
    objectType: object.objectType,
    titleZh: object.titles.zh,
    titleEn: object.titles.en,
    date: dateInput(object.productionDate),
    catalogNumber: object.catalogNumber,
    dimensions: object.dimensions,
    survival: object.survivalStatus,
    relationships: object.relationships.map((relation) => ({ type: relation.type, target: relation.targetObjectId, sources: relation.sourceRefs, note: relation.note })),
    collection: {
      kind: object.currentCollection.locationKind,
      place: object.currentCollection.placeId,
      sources: object.currentCollection.sourceRefs,
      accessedAt: object.currentCollection.sourceAccessedAt,
      asOf: object.currentCollection.assertionAsOf,
      note: object.currentCollection.note,
      noteZh: object.currentCollection.noteZh,
    },
    events: object.provenanceEvents.map((event) => ({
      id: event.id, type: event.type, date: dateInput(event.date), place: event.placeId,
      placeWording: event.placeWording, referencePlace: event.referencePlaceId,
      referenceNote: event.referenceNote, referenceNoteZh: event.referenceNoteZh,
      shortLabel: event.shortLabel, shortLabelZh: event.shortLabelZh,
      summary: event.summary, summaryZh: event.summaryZh,
      sources: event.sourceRefs, certainty: event.certainty,
    })),
    attribution: object.attribution?.map(attributionInput),
    version: object.version ? {
      label: object.version.label,
      basis: object.version.basis,
      sources: object.version.sourceRefs,
      note: object.version.note,
      noteZh: object.version.noteZh,
    } : undefined,
    claims: object.claims?.map(claimInput),
    review: object.review,
    media: objectMedia.length ? objectMedia : undefined,
  };
  writeFileSync(join(knowledge, 'objects', object.id + '.md'), document(fields, objectBody(object)), 'utf8');
}

for (const place of allPlaces) {
  const fields = {
    schemaVersion: 1,
    nameZh: place.names.zh,
    nameEn: place.names.en,
    historicalName: place.historicalName,
    kind: place.kind,
    coordinates: place.coordinates ? {
      longitude: place.coordinates.longitude,
      latitude: place.coordinates.latitude,
      precision: place.coordinates.precision,
      method: place.coordinates.method,
      verification: place.coordinates.verification,
      sources: place.coordinates.sourceRefs,
      note: place.coordinates.note,
      noteZh: place.coordinates.noteZh,
    } : null,
    sources: place.sourceRefs,
    notes: place.notes,
    notesZh: place.notesZh,
  };
  writeFileSync(join(knowledge, 'places', place.id + '.md'), document(fields, '# ' + place.names.zh), 'utf8');
}

for (const source of allSources) {
  const fields = {
    schemaVersion: 1,
    kind: source.kind ?? 'web',
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    publicationDate: source.publicationDate,
    accessedAt: source.accessedAt,
    locator: source.locator,
    note: source.note,
  };
  writeFileSync(join(knowledge, 'sources', source.id + '.md'), document(fields, '# ' + source.title), 'utf8');
}

for (const person of peopleArticles) {
  const fields = {
    schemaVersion: 1,
    titleZh: text(person.fields.titleZh, person.id),
    titleEn: text(person.fields.titleEn, text(person.fields.titleZh, person.id)),
    aliases: [],
    state: text(person.fields.state, 'draft'),
    works: typeof person.fields.works === 'string' ? person.fields.works.split(',').map((id) => id.trim()).filter(Boolean) : [],
    objects: typeof person.fields.objects === 'string' ? person.fields.objects.split(',').map((id) => id.trim()).filter(Boolean) : [],
    sources: typeof person.fields.sources === 'string' ? person.fields.sources.split(',').map((id) => id.trim()).filter(Boolean) : [],
  };
  writeFileSync(join(knowledge, 'people', person.id + '.md'), document(fields, person.body), 'utf8');
}

const newPeople = [
  {
    id: 'wang-xizhi', titleZh: '王羲之', titleEn: 'Wang Xizhi', works: ['lanting'], objects: ['witness-lanting'],
    sources: ['src-catalogue-lanting'],
    zh: '《兰亭序》传统上归于王羲之。故宫博物院将神龙本列为唐摹本，并在同一页面讨论摹者与神龙印的年代。读这一页时，可把“王羲之其文”与“某位唐人摹写”分开记。',
    en: 'The Preface to the Orchid Pavilion is traditionally attributed to Wang Xizhi. The Palace Museum catalogues the Shenlong copy as a Tang manuscript copy and discusses both the copyist and the date of the Shenlong seal. Keep the author and the later copyist as separate claims.',
  },
  {
    id: 'feng-chengsu', titleZh: '冯承素', titleEn: 'Feng Chengsu', works: ['lanting'], objects: ['witness-lanting'],
    sources: ['src-catalogue-lanting'],
    zh: '神龙本卷后项元汴题记将摹写归于冯承素。故宫博物院在藏品说明中对这一归名及神龙印的年代提出疑问，因此本项目把冯承素列作有争议的摹写者，而不把归名当作定论。',
    en: 'Xiang Yuanbian’s colophon on the Shenlong copy attributes the copying to Feng Chengsu. The Palace Museum questions both that attribution and the date of the Shenlong seal, so the project records Feng as a disputed copyist rather than a settled one.',
  },
  {
    id: 'weng-fanggang', titleZh: '翁方纲', titleEn: 'Weng Fanggang', works: ['liqi-bei'], objects: ['liqi-ming-44512'],
    sources: ['src-dpm-234635'],
    zh: '故宫博物院《明拓东汉礼器碑》条目引翁方纲说，认为碑文由七人书写。这是有出处的学术意见；本项目不据此生成七名确定书家。',
    en: 'The Palace Museum’s entry for the Ming rubbing of the Liqi Stele cites Weng Fanggang’s view that seven people wrote the inscription. It is a sourced scholarly opinion; the project does not turn it into seven established calligraphers.',
  },
  {
    id: 'xianyu-shu', titleZh: '鲜于枢', titleEn: 'Xianyu Shu', works: ['jizhi'], objects: ['witness-jizhi'],
    sources: ['src-catalogue-jizhi', 'src-jizhi-colophon-bingxu', 'src-jizhi-colophon-wuzi'],
    zh: '《祭侄文稿》卷后鲜于枢两跋都记从曹彦礼处得卷，但丙戌署款跋记壬午（1282），戊子署款跋记癸未（1283）。两说并列，不合并为一个确定年份，也不据此补出交接地点。',
    en: 'Two colophons by Xianyu Shu on the Draft Requiem both say that he received the scroll from Cao Yanli, but the bingxu colophon gives 1282 and the wuzi colophon gives 1283. The project keeps both readings and does not supply a place of transfer.',
  },
];
for (const person of newPeople) {
  const fields = {
    schemaVersion: 1, titleZh: person.titleZh, titleEn: person.titleEn, aliases: [], state: 'draft',
    works: person.works, objects: person.objects, sources: person.sources,
  };
  const body = ['# ' + person.titleZh + '（草稿）', '', '## 中文', '', person.zh, '', '## English', '', person.en].join('\n');
  writeFileSync(join(knowledge, 'people', person.id + '.md'), document(fields, body), 'utf8');
}

for (const note of noteArticles) {
  const fields = {
    schemaVersion: 1,
    titleZh: text(note.fields.titleZh, note.id),
    titleEn: text(note.fields.titleEn, text(note.fields.titleZh, note.id)),
    state: text(note.fields.state, 'draft'),
    works: typeof note.fields.works === 'string' ? note.fields.works.split(',').map((id) => id.trim()).filter(Boolean) : [],
    objects: typeof note.fields.objects === 'string' ? note.fields.objects.split(',').map((id) => id.trim()).filter(Boolean) : [],
    sources: typeof note.fields.sources === 'string' ? note.fields.sources.split(',').map((id) => id.trim()).filter(Boolean) : [],
  };
  writeFileSync(join(knowledge, 'notes', note.id + '.md'), document(fields, note.body), 'utf8');
}

const relationBody = [
  '# 人物关系',
  '',
  '每条关系记录双方、类型、方向、来源和审核状态。关系本身不等于史实定论；有疑问时保留原文与出处。',
].join('\n');
writeFileSync(join(knowledge, 'relations.md'), document({ schemaVersion: 1, relations }, relationBody), 'utf8');

console.log('Migration wrote knowledge/ records.');
console.log('Works:', works.length + modernWorks.length, 'Objects:', objects.length + modernWorks.filter((item) => item.object).length,
  'Places:', allPlaces.length, 'Sources:', allSources.length, 'People:', peopleArticles.length + newPeople.length,
  'Notes:', noteArticles.length, 'Relations:', relations.length);
