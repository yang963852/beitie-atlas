/**
 * Authoring schema for `knowledge/`.
 *
 * YAML holds only fields a program needs. Prose lives in the Markdown body.
 * The parser is deliberately strict: an unknown field, a broken reference or a
 * misaligned translation is a build error, never a silent fallback.
 */

import { parse } from 'yaml';
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

export const KNOWLEDGE_FORMAT_VERSION = 'beitie-knowledge/1';
export const KNOWLEDGE_SCHEMA_VERSION = 1;

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

export function readReview(value: unknown, path: string): { state: ReviewState; note: string | null; noteZh?: string | null } {
  if (!record(value)) throw new Error(path + ' must be a mapping');
  return {
    state: reviewState(value.state, path + '.state'),
    note: optionalText(value.note, path + '.note'),
    ...(value.noteZh == null ? {} : { noteZh: optionalText(value.noteZh, path + '.noteZh') }),
  };
}

const DATE_KINDS = new Set<DateKind>(['single', 'range', 'approximate', 'era', 'unknown']);
const CERTAINTIES = new Set<DateCertainty>(['documented', 'approximate', 'disputed', 'unknown']);
const DATE_MEANINGS = new Set<DateMeaning>([
  'composition', 'publication', 'colophon', 'production', 'discovery', 'accession', 'other',
]);

export function readDate(value: unknown, path: string): HistoricalDate {
  if (!record(value)) throw new Error(path + ' must be a date mapping');
  const kind = value.kind;
  if (typeof kind !== 'string' || !DATE_KINDS.has(kind as DateKind)) throw new Error(path + '.kind is invalid');
  const certainty = value.certainty ?? 'documented';
  if (typeof certainty !== 'string' || !CERTAINTIES.has(certainty as DateCertainty)) {
    throw new Error(path + '.certainty is invalid');
  }
  const meaning = value.meaning;
  if (meaning != null && (typeof meaning !== 'string' || !DATE_MEANINGS.has(meaning as DateMeaning))) {
    throw new Error(path + '.meaning is invalid');
  }
  return {
    kind: kind as DateKind,
    startYear: integer(value.start, path + '.start'),
    startMonth: integer(value.month, path + '.month'),
    endYear: integer(value.end, path + '.end'),
    endMonth: integer(value.endMonth, path + '.endMonth'),
    eraLabel: optionalText(value.era, path + '.era'),
    original: optionalText(value.original, path + '.original'),
    certainty: certainty as DateCertainty,
    ...(meaning == null ? {} : { meaning: meaning as DateMeaning }),
    note: optionalText(value.note, path + '.note'),
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

export function readVersion(value: unknown, path: string): VersionAssertion | null {
  if (value == null) return null;
  if (!record(value)) throw new Error(path + ' must be a mapping or null');
  return {
    label: text(value.label, path + '.label'),
    basis: optionalText(value.basis, path + '.basis'),
    sourceRefs: idList(value.sources, path + '.sources'),
    note: optionalText(value.note, path + '.note'),
    ...(value.noteZh == null ? {} : { noteZh: optionalText(value.noteZh, path + '.noteZh') }),
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

export function readGuide(value: unknown, body: string, path: string): (GuideInput & { zh: string; en: string }) | null {
  if (value == null) return null;
  if (!record(value)) throw new Error(path + ' must be a mapping');
  const section = h2Section(body, '导读');
  if (!section) throw new Error(path + ' requires a "## 导读" body section');
  const languages = languageSections(section);
  const year = value.timelineYear;
  if (year != null && (typeof year !== 'number' || !Number.isInteger(year) || year === 0)) {
    throw new Error(path + '.timelineYear must be a nonzero integer');
  }
  return {
    state: reviewState(value.state, path + '.state'),
    timelineYear: year == null ? null : year,
    people: idList(value.people, path + '.people'),
    objects: idList(value.objects, path + '.objects'),
    sources: idList(value.sources, path + '.sources'),
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
    compositionDate: readDate(f.date, 'date'),
    script: optionalText(f.script, 'script'),
    background: body.background,
    ...(body.backgroundZh ? { backgroundZh: body.backgroundZh } : {}),
    sourceRefs: idList(f.sources, 'sources'),
    review: readReview(f.review, 'review'),
    ...(claims ? { claims } : {}),
    notes: body.notes,
    ...(body.notesZh.length ? { notesZh: body.notesZh } : {}),
  };
  if (work.studyCategory !== 'bei' && work.studyCategory !== 'tie') throw new Error('studyCategory must be bei or tie');
  if (work.notesZh && work.notesZh.length !== work.notes.length) throw new Error('notesZh must align with notes');
  const guide = readGuide(f.guide, recordInput.body, 'guide');
  return { work, guide };
}

const OBJECT_TYPES = new Set<ObjectType>([
  'ink-manuscript', 'manuscript-copy', 'original-stele', 'cliff-inscription', 'bronze-vessel', 'recarving', 'rubbing', 'fragment',
]);
const SURVIVAL = new Set<SurvivalStatus>(['surviving', 'lost', 'unknown']);
const RELATIONSHIP_TYPES = new Set(['rubbing-of', 'recarving-of', 'fragment-of']);
const LOCATION_KINDS = new Set(['collection-institution', 'in-situ', 'last-known', 'unknown']);
const EVENT_TYPES = new Set(['composition', 'carving', 'discovery', 'relocation', 'custody', 'rubbing-taken', 'accession', 'documented', 'other']);

function readCollection(value: unknown, path: string): CollectionAssertion {
  if (!record(value)) throw new Error(path + ' must be a mapping');
  const kind = text(value.kind, path + '.kind');
  if (!LOCATION_KINDS.has(kind)) throw new Error(path + '.kind is invalid');
  return {
    locationKind: kind as CollectionAssertion['locationKind'],
    placeId: optionalText(value.place, path + '.place'),
    sourceRefs: idList(value.sources, path + '.sources'),
    sourceAccessedAt: text(value.accessedAt, path + '.accessedAt'),
    assertionAsOf: optionalText(value.asOf, path + '.asOf'),
    note: optionalText(value.note, path + '.note'),
    ...(value.noteZh == null ? {} : { noteZh: optionalText(value.noteZh, path + '.noteZh') }),
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
      date: readDate(item.date, at + '.date'),
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
  const dimensions = f.dimensions == null ? null : (() => {
    if (!record(f.dimensions)) throw new Error('dimensions must be a mapping or null');
    return {
      raw: text(f.dimensions.raw, 'dimensions.raw'),
      note: optionalText(f.dimensions.note, 'dimensions.note'),
    };
  })();
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
    productionDate: readDate(f.date, 'date'),
    catalogNumber: optionalText(f.catalogNumber, 'catalogNumber'),
    dimensions,
    survivalStatus: survival as SurvivalStatus,
    relationships: readRelationships(f.relationships, 'relationships'),
    currentCollection: readCollection(f.collection, 'collection'),
    provenanceEvents: readEvents(f.events, recordInput.id, 'events'),
    ...(f.attribution == null ? {} : { attribution: readAttribution(f.attribution, 'attribution') }),
    ...(f.version == null ? {} : { version: readVersion(f.version, 'version') }),
    review: readReview(f.review, 'review'),
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
const PRECISIONS = new Set(['site', 'institution', 'city', 'region']);
const METHODS = new Set(['official-publication', 'secondary-database', 'geocoder', 'field-survey']);
const VERIFICATIONS = new Set(['verified', 'unverified']);

export function readPlace(recordInput: MarkdownRecord): Place {
  const f = recordInput.fields;
  const kind = text(f.kind, 'kind');
  if (!PLACE_KINDS.has(kind)) throw new Error('kind is invalid');
  let coordinates: Coordinates | null = null;
  if (f.coordinates != null) {
    if (!record(f.coordinates)) throw new Error('coordinates must be a mapping or null');
    const precision = text(f.coordinates.precision, 'coordinates.precision');
    const method = text(f.coordinates.method, 'coordinates.method');
    const verification = text(f.coordinates.verification, 'coordinates.verification');
    if (!PRECISIONS.has(precision)) throw new Error('coordinates.precision is invalid');
    if (!METHODS.has(method)) throw new Error('coordinates.method is invalid');
    if (!VERIFICATIONS.has(verification)) throw new Error('coordinates.verification is invalid');
    const longitude = optionalNumber(f.coordinates.longitude, 'coordinates.longitude');
    const latitude = optionalNumber(f.coordinates.latitude, 'coordinates.latitude');
    if (longitude === null || latitude === null) throw new Error('coordinates requires both longitude and latitude');
    if (f.coordinates.crs != null && f.coordinates.crs !== 'WGS84') throw new Error('coordinates.crs must be WGS84');
    coordinates = {
      longitude,
      latitude,
      crs: 'WGS84',
      precision: precision as Coordinates['precision'],
      sourceRefs: idList(f.coordinates.sources, 'coordinates.sources'),
      method: method as Coordinates['method'],
      verification: verification as Coordinates['verification'],
      note: optionalText(f.coordinates.note, 'coordinates.note'),
      ...(f.coordinates.noteZh == null ? {} : { noteZh: optionalText(f.coordinates.noteZh, 'coordinates.noteZh') }),
    };
  }
  return {
    id: recordInput.id,
    names: { zh: text(f.nameZh, 'nameZh'), en: optionalText(f.nameEn, 'nameEn') ?? text(f.nameZh, 'nameZh') },
    historicalName: optionalText(f.historicalName, 'historicalName'),
    kind: kind as Place['kind'],
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
