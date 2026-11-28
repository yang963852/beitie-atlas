/**
 * Authoring schema for `knowledge/`.
 *
 * YAML holds only fields a program needs. Prose lives in the Markdown body.
 * The parser is deliberately strict: an unknown field, a broken reference or a
 * misaligned translation is a build error, never a silent fallback.
 */

import { parse } from 'yaml';
import { PROVINCE_IDS } from '../../src/domain/provinces';
import type {
  Attribution,
  Claim,
  CollectionAssertion,
  Coordinates,
  DateCertainty,
  DateKind,
  DateMeaning,
  HistoricalDate,
  MediaItem,
  ObjectRecord,
  ObjectRelationship,
  ObjectType,
  Place,
  ProvenanceEvent,
  ReviewState,
  Source,
  StudyCategory,
  SurvivalStatus,
  VersionAssertion,
  Work,
} from '../../src/domain/types';

/** Format and schema of the compiled interface consumed by the site and checks. */
export const KNOWLEDGE_FORMAT_VERSION = 'beitie-knowledge/1';
export const KNOWLEDGE_SCHEMA_VERSION = 1;
/** Version of the author frontmatter under `knowledge/`, independent of the interface. */
export const AUTHOR_SCHEMA_VERSION = 2;

/**
 * Every top-level frontmatter key each record type may carry.
 *
 * The compiler rejects anything outside this table, so a field that no reader
 * consumes — a leftover nested v1 block, a renamed key, a typo — stops the
 * build instead of vanishing from the site without a trace. Add the name here
 * in the same change that teaches a reader to consume it.
 */
export const FIELD_NAMES: Readonly<Record<string, readonly string[]>> = {
  works: [
    'schemaVersion',
    'titleZh', 'titleEn', 'aliases', 'attribution',
    'studyCategory', 'dynastyId', 'dynastyQualifier', 'script',
    'dateKind', 'dateStart', 'dateMonth', 'dateEnd', 'dateEndMonth',
    'dateEra', 'dateOriginal', 'dateCertainty', 'dateMeaning', 'dateNote',
    'sources', 'claims',
    'reviewState', 'reviewNote', 'reviewNoteZh',
    'guideState', 'guideTimelineYear', 'guidePeople', 'guideObjects', 'guideSources',
  ],
  objects: [
    'schemaVersion',
    'work', 'objectType', 'titleZh', 'titleEn', 'catalogNumber',
    'dateKind', 'dateStart', 'dateMonth', 'dateEnd', 'dateEndMonth',
    'dateEra', 'dateOriginal', 'dateCertainty', 'dateMeaning', 'dateNote',
    'dimensionsRaw', 'dimensionsNote', 'survival',
    'relationships', 'events', 'media',
    'collectionKind', 'collectionPlace', 'collectionSources',
    'collectionAccessedAt', 'collectionAsOf', 'collectionNote', 'collectionNoteZh',
    'attribution',
    'versionLabel', 'versionBasis', 'versionSources', 'versionNote', 'versionNoteZh',
    'reviewState', 'reviewNote', 'reviewNoteZh',
    'claims',
  ],
  people: [
    'schemaVersion', 'titleZh', 'titleEn', 'state', 'works', 'objects', 'sources', 'aliases',
  ],
  // Notes share the person reader and add `people`, read directly by the compiler.
  notes: [
    'schemaVersion', 'titleZh', 'titleEn', 'state', 'works', 'objects', 'sources', 'aliases', 'people',
  ],
  places: [
    'schemaVersion', 'nameZh', 'nameEn', 'historicalName', 'kind', 'province',
    'sources', 'notes', 'notesZh',
    'coordinateLongitude', 'coordinateLatitude', 'coordinatePrecision', 'coordinateMethod',
    'coordinateVerification', 'coordinateSources', 'coordinateNote', 'coordinateNoteZh',
  ],
  sources: [
    'schemaVersion', 'kind', 'title', 'publisher', 'url',
    'publicationDate', 'accessedAt', 'locator', 'note',
  ],
};

/** Keys `knowledge/relations.md` itself may carry. */
export const RELATION_FILE_FIELDS = ['schemaVersion', 'relations'] as const;
/** Keys each entry under `relations:` may carry. */
export const RELATION_FIELDS = ['from', 'to', 'type', 'labelZh', 'labelEn', 'sourceRefs', 'state'] as const;

/** Template that documents each record type's field list, for error messages. */
const FIELD_GUIDE: Readonly<Record<string, string>> = {
  works: 'work', objects: 'object', people: 'person', notes: 'note', places: 'place', sources: 'source',
};

/**
 * Reject a frontmatter key that no reader consumes.
 *
 * A key that parses but is never read is the failure mode this guard exists
 * for: the author sees their edit accepted, and the site silently drops it.
 */
export function assertFields(kind: string, fields: Record<string, unknown>, path: string): void {
  const allowed = FIELD_NAMES[kind];
  if (!allowed) throw new Error(path + ': no field list is declared for "' + kind + '"');
  const known = new Set(allowed);
  const unknown = Object.keys(fields).filter((key) => !known.has(key));
  if (unknown.length === 0) return;
  const guide = FIELD_GUIDE[kind] ? 'knowledge/_templates/' + FIELD_GUIDE[kind] + '.md' : 'the schema';
  throw new Error(
    path + ': unknown frontmatter ' + (unknown.length === 1 ? 'field ' : 'fields ') +
    unknown.map((key) => '"' + key + '"').join(', ') +
    '. Author records use flat v2 keys; see ' + guide + '.',
  );
}

export interface GuideInput {
  state: ReviewState;
  timelineYear: number | null;
  people: string[];
  objects: string[];
  sources: string[];
}

export interface RawWork {
  id: string;
  fields: Record<string, unknown>;
  body: string;
  path: string;
}

export interface MarkdownRecord {
  id: string;
  fields: Record<string, unknown>;
  body: string;
  path: string;
}

export function stableId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function splitFrontmatter(text: string): { fields: Record<string, unknown>; body: string } {
  const input = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const header = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(input);
  if (!header) throw new Error('Missing YAML frontmatter');
  const fields = parse(header[1], { uniqueKeys: true }) as unknown;
  if (!record(fields)) throw new Error('Frontmatter must be a mapping');
  return { fields, body: input.slice(header[0].length) };
}

export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(path + ' must be non-empty text');
  return value.trim();
}

export function optionalText(value: unknown, path: string): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') throw new Error(path + ' must be text or null');
  return value.trim() || null;
}

export function optionalNumber(value: unknown, path: string): number | null {
  if (value == null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(path + ' must be a number or null');
  return value;
}

export function integer(value: unknown, path: string): number | null {
  const parsed = optionalNumber(value, path);
  if (parsed != null && !Number.isInteger(parsed)) throw new Error(path + ' must be an integer');
  return parsed;
}

export function stringList(value: unknown, path: string): string[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(path + ' must be a list of non-empty strings');
  }
  return value.map((item) => (item as string).trim());
}

export function idList(value: unknown, path: string): string[] {
  const list = stringList(value, path);
  for (const id of list) if (!stableId(id)) throw new Error(path + ' contains an invalid stable ID: ' + id);
  if (new Set(list).size !== list.length) throw new Error(path + ' contains a duplicate ID');
  return list;
}

export function reviewState(value: unknown, path: string): ReviewState {
  if (value !== 'draft' && value !== 'reviewed') throw new Error(path + ' must be draft or reviewed');
  return value;
}

export function readReview(fields: Record<string, unknown>): { state: ReviewState; note: string | null; noteZh?: string | null } {
  return {
    state: reviewState(fields.reviewState, 'reviewState'),
    note: optionalText(fields.reviewNote, 'reviewNote'),
    ...(fields.reviewNoteZh == null ? {} : { noteZh: optionalText(fields.reviewNoteZh, 'reviewNoteZh') }),
  };
}

const DATE_KINDS = new Set<DateKind>(['single', 'range', 'approximate', 'era', 'unknown']);
const CERTAINTIES = new Set<DateCertainty>(['documented', 'approximate', 'disputed', 'unknown']);
const DATE_MEANINGS = new Set<DateMeaning>([
  'composition', 'publication', 'colophon', 'production', 'discovery', 'accession', 'other',
]);

/** `date` + `kind` -> `dateKind`; keeps the flat frontmatter and its errors in step. */
function flatKey(prefix: string, name: string): string {
  return prefix + name[0].toUpperCase() + name.slice(1);
}

export function readDate(fields: Record<string, unknown>, prefix: string, at = ''): HistoricalDate {
  const key = (name: string) => at + flatKey(prefix, name);
  const kind = fields[flatKey(prefix, 'kind')];
  if (typeof kind !== 'string' || !DATE_KINDS.has(kind as DateKind)) throw new Error(key('kind') + ' is invalid');
  const certainty = fields[flatKey(prefix, 'certainty')] ?? 'documented';
  if (typeof certainty !== 'string' || !CERTAINTIES.has(certainty as DateCertainty)) {
    throw new Error(key('certainty') + ' is invalid');
  }
  const meaning = fields[flatKey(prefix, 'meaning')];
  if (meaning != null && (typeof meaning !== 'string' || !DATE_MEANINGS.has(meaning as DateMeaning))) {
    throw new Error(key('meaning') + ' is invalid');
  }
  return {
    kind: kind as DateKind,
    startYear: integer(fields[flatKey(prefix, 'start')], key('start')),
    startMonth: integer(fields[flatKey(prefix, 'month')], key('month')),
    endYear: integer(fields[flatKey(prefix, 'end')], key('end')),
    endMonth: integer(fields[flatKey(prefix, 'endMonth')], key('endMonth')),
    eraLabel: optionalText(fields[flatKey(prefix, 'era')], key('era')),
    original: optionalText(fields[flatKey(prefix, 'original')], key('original')),
    certainty: certainty as DateCertainty,
    ...(meaning == null ? {} : { meaning: meaning as DateMeaning }),
    note: optionalText(fields[flatKey(prefix, 'note')], key('note')),
  };
}

const ATTRIBUTION_ROLES = new Set([
  'author-and-calligrapher', 'author', 'calligrapher', 'copyist', 'colophon-author',
  'engraver', 'title-writer', 'compiler', 'sponsor', 'unknown',
]);

export function readAttribution(value: unknown, path: string): Attribution[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(path + ' must list at least one credit');
  return value.map((item, index) => {
    const at = path + '[' + index + ']';
    if (!record(item)) throw new Error(at + ' must be a mapping');
    const role = text(item.role, at + '.role');
    if (!ATTRIBUTION_ROLES.has(role)) throw new Error(at + '.role is unknown');
    const certainty = item.certainty ?? 'documented';
    if (typeof certainty !== 'string' || !CERTAINTIES.has(certainty as DateCertainty)) {
      throw new Error(at + '.certainty is invalid');
    }
    return {
      role: role as Attribution['role'],
      name: text(item.name, at + '.name'),
      nameEn: optionalText(item.nameEn, at + '.nameEn'),
      ...(item.person == null ? {} : { personId: optionalText(item.person, at + '.person') }),
      certainty: certainty as DateCertainty,
      sourceRefs: idList(item.sources, at + '.sources'),
      note: optionalText(item.note, at + '.note'),
      ...(item.noteZh == null ? {} : { noteZh: optionalText(item.noteZh, at + '.noteZh') }),
    };
  });
}

const CLAIM_KINDS = new Set(['source-report', 'scholarly-opinion', 'editor-interpretation']);
const CLAIM_STANCES = new Set(['supports', 'questions', 'neutral']);

export function readClaims(value: unknown, path: string): Claim[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) throw new Error(path + ' must be a list');
  return value.map((item, index) => {
    const at = path + '[' + index + ']';
    if (!record(item)) throw new Error(at + ' must be a mapping');
    const kind = text(item.kind, at + '.kind');
    if (!CLAIM_KINDS.has(kind)) throw new Error(at + '.kind is unknown');
    const stance = item.stance ?? 'neutral';
    if (typeof stance !== 'string' || !CLAIM_STANCES.has(stance)) throw new Error(at + '.stance is invalid');
    const certainty = item.certainty ?? 'documented';
    if (typeof certainty !== 'string' || !CERTAINTIES.has(certainty as DateCertainty)) {
      throw new Error(at + '.certainty is invalid');
    }
    const sourceRefs = idList(item.sources, at + '.sources');
    if (!sourceRefs.length) throw new Error(at + ' requires a source');
    return {
      id: text(item.id, at + '.id'),
      kind: kind as Claim['kind'],
      predicate: text(item.predicate, at + '.predicate'),
      value: text(item.value, at + '.value'),
      voice: optionalText(item.voice, at + '.voice'),
      ...(item.person == null ? {} : { personId: optionalText(item.person, at + '.person') }),
      stance: stance as Claim['stance'],
      certainty: certainty as DateCertainty,
      sourceRefs,
      locator: text(item.locator, at + '.locator'),
      note: optionalText(item.note, at + '.note'),
      ...(item.noteZh == null ? {} : { noteZh: optionalText(item.noteZh, at + '.noteZh') }),
    };
  });
}

export function readVersion(fields: Record<string, unknown>): VersionAssertion | null {
  const hasVersion = ['versionLabel', 'versionBasis', 'versionSources', 'versionNote', 'versionNoteZh']
    .some((key) => fields[key] != null);
  if (!hasVersion) return null;
  return {
    label: text(fields.versionLabel, 'versionLabel'),
    basis: optionalText(fields.versionBasis, 'versionBasis'),
    sourceRefs: idList(fields.versionSources, 'versionSources'),
    note: optionalText(fields.versionNote, 'versionNote'),
    ...(fields.versionNoteZh == null ? {} : { noteZh: optionalText(fields.versionNoteZh, 'versionNoteZh') }),
  };
}

/** Split a body under one H2 into the optional `### 中文` and `### English` halves. */
export function languageSections(body: string): { zh: string; en: string } {
  const zh = /^### 中文[ \t]*$/m.exec(body);
  if (!zh) throw new Error('Missing "### 中文" section');
  const en = /^### English[ \t]*$/m.exec(body);
  const zhBody = body.slice(zh.index + zh[0].length, en?.index).trim();
  const enBody = en ? body.slice(en.index + en[0].length).trim() : '';
  if (!zhBody) throw new Error('Chinese section is empty');
  return { zh: zhBody, en: enBody };
}

/**
 * Notes may be recorded in one language while the translation is still open.
 * A missing half is empty, never machine-filled.
 */
export function optionalLanguageSections(body: string): { zh: string; en: string } {
  const zh = /^### 中文[ \t]*$/m.exec(body);
  const en = /^### English[ \t]*$/m.exec(body);
  if (!zh && !en) throw new Error('Expected a "### 中文" or "### English" section');
  const cut = (start: RegExpExecArray, next?: RegExpExecArray) =>
    body.slice(start.index + start[0].length, next?.index).trim();
  const zhBody = zh ? cut(zh, en && en.index > zh.index ? en : undefined) : '';
  const enBody = en ? cut(en, zh && zh.index > en.index ? zh : undefined) : '';
  return { zh: zhBody, en: enBody };
}

export function h2Section(body: string, heading: string): string | null {
  const pattern = new RegExp('^## ' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[ \\t]*$', 'm');
  const match = pattern.exec(body);
  if (!match) return null;
  const rest = body.slice(match.index + match[0].length);
  const next = /^## [^\n]+$/m.exec(rest);
  return rest.slice(0, next?.index).trim();
}

export function bullets(text: string | null): string[] {
  if (!text) return [];
  return text.split('\n')
    .map((line) => /^[-*]\s+(.+)$/.exec(line.trim())?.[1]?.trim())
    .filter((line): line is string => Boolean(line));
}

const GUIDE_KEYS = ['guideState', 'guideTimelineYear', 'guidePeople', 'guideObjects', 'guideSources'] as const;

export function readGuide(fields: Record<string, unknown>, body: string): (GuideInput & { zh: string; en: string }) | null {
  if (GUIDE_KEYS.every((key) => fields[key] == null)) return null;
  const section = h2Section(body, '导读');
  if (!section) throw new Error('guide requires a "## 导读" body section');
  const languages = languageSections(section);
  const year = fields.guideTimelineYear;
  if (year != null && (typeof year !== 'number' || !Number.isInteger(year) || year === 0)) {
    throw new Error('guideTimelineYear must be a nonzero integer');
  }
  return {
    state: reviewState(fields.guideState, 'guideState'),
    timelineYear: year == null ? null : year,
    people: idList(fields.guidePeople, 'guidePeople'),
    objects: idList(fields.guideObjects, 'guideObjects'),
    sources: idList(fields.guideSources, 'guideSources'),
    zh: languages.zh,
    en: languages.en,
  };
}

function readWorkBody(body: string): { backgroundZh: string; background: string; notesZh: string[]; notes: string[] } {
  const backgroundSection = h2Section(body, '背景');
  if (!backgroundSection) throw new Error('Work body needs a "## 背景" section');
  const background = optionalLanguageSections(backgroundSection);
  const notesSection = h2Section(body, '待考');
  let notesZh: string[] = [];
  let notes: string[] = [];
  if (notesSection) {
    const languages = optionalLanguageSections(notesSection);
    const zhNotes = bullets(languages.zh);
    const enNotes = bullets(languages.en);
    notesZh = zhNotes;
    notes = enNotes.length ? enNotes : zhNotes;
    if (zhNotes.length && enNotes.length && zhNotes.length !== enNotes.length) {
      throw new Error('Work notes must have the same Chinese and English count');
    }
    if (notesZh.length !== notes.length) notesZh = [];
  }
  return {
    backgroundZh: background.zh,
    background: background.en || background.zh,
    notesZh,
    notes,
  };
}

export function readWork(recordInput: MarkdownRecord): { work: Work; guide: (GuideInput & { zh: string; en: string }) | null } {
  const f = recordInput.fields;
  const body = readWorkBody(recordInput.body);
  const claims = readClaims(f.claims, 'claims');
  const work: Work = {
    id: recordInput.id,
    titles: { zh: text(f.titleZh, 'titleZh'), en: optionalText(f.titleEn, 'titleEn') ?? text(f.titleZh, 'titleZh') },
    aliases: stringList(f.aliases, 'aliases'),
    attribution: readAttribution(f.attribution, 'attribution'),
    studyCategory: text(f.studyCategory, 'studyCategory') as StudyCategory,
    dynastyId: text(f.dynastyId, 'dynastyId') as Work['dynastyId'],
    dynastyQualifier: optionalText(f.dynastyQualifier, 'dynastyQualifier'),
    compositionDate: readDate(f, 'date'),
    script: optionalText(f.script, 'script'),
    background: body.background,
    ...(body.backgroundZh ? { backgroundZh: body.backgroundZh } : {}),
    sourceRefs: idList(f.sources, 'sources'),
    review: readReview(f),
    ...(claims ? { claims } : {}),
    notes: body.notes,
    ...(body.notesZh.length ? { notesZh: body.notesZh } : {}),
  };
  if (work.studyCategory !== 'bei' && work.studyCategory !== 'tie') throw new Error('studyCategory must be bei or tie');
  if (work.notesZh && work.notesZh.length !== work.notes.length) throw new Error('notesZh must align with notes');
  const guide = readGuide(f, recordInput.body);
  return { work, guide };
}

const OBJECT_TYPES = new Set<ObjectType>([
  'ink-manuscript', 'manuscript-copy', 'original-stele', 'cliff-inscription', 'bronze-vessel', 'recarving', 'rubbing', 'fragment',
]);
const SURVIVAL = new Set<SurvivalStatus>(['surviving', 'lost', 'unknown']);
const RELATIONSHIP_TYPES = new Set(['rubbing-of', 'recarving-of', 'fragment-of']);
const LOCATION_KINDS = new Set(['collection-institution', 'in-situ', 'last-known', 'unknown']);
const EVENT_TYPES = new Set(['composition', 'carving', 'discovery', 'relocation', 'custody', 'rubbing-taken', 'accession', 'documented', 'other']);

function readCollection(fields: Record<string, unknown>): CollectionAssertion {
  const kind = text(fields.collectionKind, 'collectionKind');
  if (!LOCATION_KINDS.has(kind)) throw new Error('collectionKind is invalid');
  return {
    locationKind: kind as CollectionAssertion['locationKind'],
    placeId: optionalText(fields.collectionPlace, 'collectionPlace'),
    sourceRefs: idList(fields.collectionSources, 'collectionSources'),
    sourceAccessedAt: text(fields.collectionAccessedAt, 'collectionAccessedAt'),
    assertionAsOf: optionalText(fields.collectionAsOf, 'collectionAsOf'),
    note: optionalText(fields.collectionNote, 'collectionNote'),
    ...(fields.collectionNoteZh == null ? {} : { noteZh: optionalText(fields.collectionNoteZh, 'collectionNoteZh') }),
  };
}

function readEvents(value: unknown, objectId: string, path: string): ProvenanceEvent[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(path + ' must be a list');
  return value.map((item, index) => {
    const at = path + '[' + index + ']';
    if (!record(item)) throw new Error(at + ' must be a mapping');
    const type = text(item.type, at + '.type');
    if (!EVENT_TYPES.has(type)) throw new Error(at + '.type is invalid');
    const certainty = item.certainty ?? 'documented';
    if (typeof certainty !== 'string' || !CERTAINTIES.has(certainty as DateCertainty)) {
      throw new Error(at + '.certainty is invalid');
    }
    return {
      id: text(item.id, at + '.id'),
      objectId,
      type: type as ProvenanceEvent['type'],
      date: readDate(item, 'date', at + '.'),
      placeId: optionalText(item.place, at + '.place'),
      placeWording: optionalText(item.placeWording, at + '.placeWording'),
      ...(item.referencePlace == null ? {} : { referencePlaceId: optionalText(item.referencePlace, at + '.referencePlace') }),
      referenceNote: optionalText(item.referenceNote, at + '.referenceNote'),
      ...(item.referenceNoteZh == null ? {} : { referenceNoteZh: optionalText(item.referenceNoteZh, at + '.referenceNoteZh') }),
      shortLabel: optionalText(item.shortLabel, at + '.shortLabel'),
      ...(item.shortLabelZh == null ? {} : { shortLabelZh: optionalText(item.shortLabelZh, at + '.shortLabelZh') }),
      summary: text(item.summary, at + '.summary'),
      ...(item.summaryZh == null ? {} : { summaryZh: optionalText(item.summaryZh, at + '.summaryZh') }),
      sourceRefs: idList(item.sources, at + '.sources'),
      certainty: certainty as DateCertainty,
    };
  });
}

function readRelationships(value: unknown, path: string): ObjectRelationship[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(path + ' must be a list');
  return value.map((item, index) => {
    const at = path + '[' + index + ']';
    if (!record(item)) throw new Error(at + ' must be a mapping');
    const type = text(item.type, at + '.type');
    if (!RELATIONSHIP_TYPES.has(type)) throw new Error(at + '.type is invalid');
    return {
      type: type as ObjectRelationship['type'],
      targetObjectId: text(item.target, at + '.target'),
      sourceRefs: idList(item.sources, at + '.sources'),
      note: optionalText(item.note, at + '.note'),
    };
  });
}

function readMedia(value: unknown, objectId: string, path: string): MediaItem[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(path + ' must be a list');
  return value.map((item, index) => {
    const at = path + '[' + index + ']';
    if (!record(item)) throw new Error(at + ' must be a mapping');
    const asset = text(item.asset, at + '.asset');
    return {
      id: text(item.id, at + '.id'),
      objectId,
      assetPathOrUrl: asset,
      creator: text(item.creator, at + '.creator'),
      sourceRefs: idList(item.sources, at + '.sources'),
      license: text(item.license, at + '.license'),
      credit: text(item.credit, at + '.credit'),
      rightsEvidence: text(item.rightsEvidence, at + '.rightsEvidence'),
      acquiredAt: text(item.acquiredAt, at + '.acquiredAt'),
    };
  });
}

export function readObject(recordInput: MarkdownRecord): { object: ObjectRecord; media: MediaItem[] } {
  const f = recordInput.fields;
  const objectType = text(f.objectType, 'objectType');
  if (!OBJECT_TYPES.has(objectType as ObjectType)) throw new Error('objectType is invalid');
  const survival = text(f.survival, 'survival');
  if (!SURVIVAL.has(survival as SurvivalStatus)) throw new Error('survival is invalid');
  const dimensions = f.dimensionsRaw == null && f.dimensionsNote == null ? null : {
    raw: text(f.dimensionsRaw, 'dimensionsRaw'),
    note: optionalText(f.dimensionsNote, 'dimensionsNote'),
  };
  const version = readVersion(f);
  const notesSection = h2Section(recordInput.body, '待考');
  let notesZh: string[] = [];
  let notes: string[] = [];
  if (notesSection) {
    const languages = optionalLanguageSections(notesSection);
    const zhNotes = bullets(languages.zh);
    const enNotes = bullets(languages.en);
    notesZh = zhNotes;
    notes = enNotes.length ? enNotes : zhNotes;
    if (zhNotes.length && enNotes.length && zhNotes.length !== enNotes.length) {
      throw new Error('Object notes must have the same Chinese and English count');
    }
    if (notesZh.length !== notes.length) notesZh = [];
  }
  const claims = readClaims(f.claims, 'claims');
  const object: ObjectRecord = {
    id: recordInput.id,
    workId: text(f.work, 'work'),
    objectType: objectType as ObjectType,
    titles: { zh: text(f.titleZh, 'titleZh'), en: optionalText(f.titleEn, 'titleEn') ?? text(f.titleZh, 'titleZh') },
    productionDate: readDate(f, 'date'),
    catalogNumber: optionalText(f.catalogNumber, 'catalogNumber'),
    dimensions,
    survivalStatus: survival as SurvivalStatus,
    relationships: readRelationships(f.relationships, 'relationships'),
    currentCollection: readCollection(f),
    provenanceEvents: readEvents(f.events, recordInput.id, 'events'),
    ...(f.attribution == null ? {} : { attribution: readAttribution(f.attribution, 'attribution') }),
    ...(version ? { version } : {}),
    review: readReview(f),
    ...(claims ? { claims } : {}),
    notes,
    ...(notesZh.length ? { notesZh } : {}),
  };
  return { object, media: readMedia(f.media, recordInput.id, 'media') };
}

/**
 * People and note articles keep the original `## 中文` / `## English` layout so
 * existing GitHub and Obsidian links continue to read naturally.
 */
function articleLanguageSections(body: string): { zh: string; en: string } {
  const zh = /^## 中文[ \t]*$/m.exec(body);
  if (!zh) throw new Error('Missing "## 中文" section');
  const en = /^## English[ \t]*$/m.exec(body);
  const zhBody = body.slice(zh.index + zh[0].length, en?.index).trim();
  const enBody = en ? body.slice(en.index + en[0].length).trim() : '';
  if (!zhBody) throw new Error('Chinese section is empty');
  return { zh: zhBody, en: enBody };
}

export function readPerson(recordInput: MarkdownRecord): {
  id: string;
  titleZh: string;
  titleEn: string;
  state: ReviewState;
  works: string[];
  objects: string[];
  sources: string[];
  aliases: string[];
  zh: string;
  en: string;
} {
  const f = recordInput.fields;
  const body = articleLanguageSections(recordInput.body);
  return {
    id: recordInput.id,
    titleZh: text(f.titleZh, 'titleZh'),
    titleEn: optionalText(f.titleEn, 'titleEn') ?? text(f.titleZh, 'titleZh'),
    state: reviewState(f.state, 'state'),
    works: idList(f.works, 'works'),
    objects: idList(f.objects, 'objects'),
    sources: idList(f.sources, 'sources'),
    aliases: stringList(f.aliases, 'aliases'),
    zh: body.zh,
    en: body.en,
  };
}

export function readNote(recordInput: MarkdownRecord): {
  id: string;
  titleZh: string;
  titleEn: string;
  state: ReviewState;
  works: string[];
  objects: string[];
  sources: string[];
  zh: string;
  en: string;
} {
  return readPerson(recordInput);
}

const PLACE_KINDS = new Set(['institution', 'historical-site', 'district', 'city', 'region']);
const PROVINCES = new Set<string>(PROVINCE_IDS);
const PRECISIONS = new Set(['site', 'institution', 'city', 'region']);
const METHODS = new Set(['official-publication', 'secondary-database', 'geocoder', 'field-survey']);
const VERIFICATIONS = new Set(['verified', 'unverified']);

export function readPlace(recordInput: MarkdownRecord): Place {
  const f = recordInput.fields;
  const kind = text(f.kind, 'kind');
  if (!PLACE_KINDS.has(kind)) throw new Error('kind is invalid');
  const province = optionalText(f.province, 'province');
  if (province && !PROVINCES.has(province)) {
    throw new Error('province must be one of: ' + PROVINCE_IDS.join(', '));
  }
  let coordinates: Coordinates | null = null;
  const hasCoordinates = ['coordinateLongitude', 'coordinateLatitude', 'coordinatePrecision', 'coordinateMethod']
    .some((key) => f[key] != null);
  if (hasCoordinates) {
    const precision = text(f.coordinatePrecision, 'coordinatePrecision');
    const method = text(f.coordinateMethod, 'coordinateMethod');
    const verification = text(f.coordinateVerification, 'coordinateVerification');
    if (!PRECISIONS.has(precision)) throw new Error('coordinatePrecision is invalid');
    if (!METHODS.has(method)) throw new Error('coordinateMethod is invalid');
    if (!VERIFICATIONS.has(verification)) throw new Error('coordinateVerification is invalid');
    const longitude = optionalNumber(f.coordinateLongitude, 'coordinateLongitude');
    const latitude = optionalNumber(f.coordinateLatitude, 'coordinateLatitude');
    if (longitude === null || latitude === null) {
      throw new Error('coordinates require both coordinateLongitude and coordinateLatitude');
    }
    coordinates = {
      longitude,
      latitude,
      crs: 'WGS84',
      precision: precision as Coordinates['precision'],
      sourceRefs: idList(f.coordinateSources, 'coordinateSources'),
      method: method as Coordinates['method'],
      verification: verification as Coordinates['verification'],
      note: optionalText(f.coordinateNote, 'coordinateNote'),
      ...(f.coordinateNoteZh == null ? {} : { noteZh: optionalText(f.coordinateNoteZh, 'coordinateNoteZh') }),
    };
  }
  return {
    id: recordInput.id,
    names: { zh: text(f.nameZh, 'nameZh'), en: optionalText(f.nameEn, 'nameEn') ?? text(f.nameZh, 'nameZh') },
    historicalName: optionalText(f.historicalName, 'historicalName'),
    kind: kind as Place['kind'],
    province: province as Place['province'],
    coordinates,
    sourceRefs: idList(f.sources, 'sources'),
    notes: stringList(f.notes, 'notes'),
    ...(f.notesZh == null ? {} : { notesZh: stringList(f.notesZh, 'notesZh') }),
  };
}

export function readSource(recordInput: MarkdownRecord): Source {
  const f = recordInput.fields;
  const kind = optionalText(f.kind, 'kind') ?? 'web';
  if (kind !== 'web' && kind !== 'book') throw new Error('kind must be web or book');
  const url = optionalText(f.url, 'url');
  if (kind === 'web' && !url) throw new Error('A web source needs a URL');
  return {
    id: recordInput.id,
    kind,
    title: text(f.title, 'title'),
    publisher: text(f.publisher, 'publisher'),
    url,
    publicationDate: optionalText(f.publicationDate, 'publicationDate'),
    accessedAt: text(f.accessedAt, 'accessedAt'),
    locator: optionalText(f.locator, 'locator'),
    note: optionalText(f.note, 'note'),
  };
}

/** Deterministic key order for the compiled interface. */
export function canonical(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}
