/**
 * Read-only compiler from `knowledge/` Markdown to the versioned interface.
 *
 * The compiler never writes a source file. `npm run knowledge:compile` writes
 * only `data/index/knowledge-v1.json`; `--check` compares the expected bytes
 * with that file. The browser imports the compiled interface, not this module.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { formatReport, validateDataset, type ValidationIssue, type ValidationReport } from '../../src/domain/validate';
import type { KnowledgeArticle, KnowledgeRelation } from '../../src/domain/knowledge-types';
import type { Dataset, MediaItem } from '../../src/domain/types';
import {
  AUTHOR_SCHEMA_VERSION,
  KNOWLEDGE_FORMAT_VERSION,
  KNOWLEDGE_SCHEMA_VERSION,
  RELATION_FIELDS,
  RELATION_FILE_FIELDS,
  assertFields,
  canonical,
  idList,
  readObject,
  readPerson,
  readPlace,
  readSource,
  readWork,
  record,
  reviewState,
  splitFrontmatter,
  stableId,
  text,
  type GuideInput,
  type MarkdownRecord,
} from './knowledge-schema';

export interface CompiledKnowledge {
  formatVersion: string;
  schemaVersion: number;
  counts: {
    works: number;
    objects: number;
    places: number;
    sources: number;
    media: number;
    events: number;
    workArticles: number;
    peopleArticles: number;
    noteArticles: number;
    peopleRelations: number;
  };
  works: Dataset['works'];
  objects: Dataset['objects'];
  places: Dataset['places'];
  sources: Dataset['sources'];
  media: MediaItem[];
  articles: KnowledgeArticle[];
  relations: KnowledgeRelation[];
}

export interface CompileResult {
  knowledge: CompiledKnowledge;
  issues: ValidationIssue[];
  validation: ValidationReport;
  files: string[];
}

export const COMPILED_PATH = 'data/index/knowledge-v1.json';

function directory(root: string, kind: string): string {
  return join(root, 'knowledge', kind);
}

function records(root: string, kind: string): MarkdownRecord[] {
  const dir = directory(root, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const id = name.slice(0, -3);
      if (!stableId(id)) throw new Error('knowledge/' + kind + '/' + name + ': use a lowercase stable ID');
      const { fields, body } = splitFrontmatter(readFileSync(join(dir, name), 'utf8'));
      const schemaVersion = fields.schemaVersion;
      if (schemaVersion !== AUTHOR_SCHEMA_VERSION) {
        throw new Error('knowledge/' + kind + '/' + name + ': schemaVersion must be ' + AUTHOR_SCHEMA_VERSION);
      }
      assertFields(kind, fields, 'knowledge/' + kind + '/' + name);
      return { id, fields, body, path: 'knowledge/' + kind + '/' + name };
    });
}

function readRelations(root: string): KnowledgeRelation[] {
  const path = join(root, 'knowledge', 'relations.md');
  if (!existsSync(path)) return [];
  const { fields } = splitFrontmatter(readFileSync(path, 'utf8'));
  if (fields.schemaVersion !== AUTHOR_SCHEMA_VERSION) {
    throw new Error('knowledge/relations.md: schemaVersion must be ' + AUTHOR_SCHEMA_VERSION);
  }
  const fileFields = new Set<string>(RELATION_FILE_FIELDS);
  const strayFile = Object.keys(fields).filter((key) => !fileFields.has(key));
  if (strayFile.length) {
    throw new Error('knowledge/relations.md: unknown frontmatter field(s) ' +
      strayFile.map((key) => '"' + key + '"').join(', ') + '; only schemaVersion and relations are read');
  }
  if (!Array.isArray(fields.relations)) throw new Error('knowledge/relations.md: relations must be a list');
  const seen = new Set<string>();
  return fields.relations.map((input, index) => {
    const at = 'relations[' + index + ']';
    if (!record(input)) throw new Error(at + ' must be a mapping');
    const relationFields = new Set<string>(RELATION_FIELDS);
    const strayRelation = Object.keys(input).filter((key) => !relationFields.has(key));
    if (strayRelation.length) {
      throw new Error(at + ': unknown field(s) ' +
        strayRelation.map((key) => '"' + key + '"').join(', ') + '; only ' + RELATION_FIELDS.join(', ') + ' are read');
    }
    const { from, to, type } = input;
    if ([from, to, type].some((value) => typeof value !== 'string' || !stableId(value as string))) {
      throw new Error(at + ': endpoints and type must be stable IDs');
    }
    const sourceRefs = idList(input.sourceRefs, at + '.sourceRefs');
    if (!sourceRefs.length) throw new Error(at + ' requires at least one source');
    if (from === to) throw new Error(at + ' needs two different people');
    const symmetric = type === 'correspondence' || type === 'poetic-exchange';
    const key = [type, ...(symmetric ? [from, to].sort() : [from, to])].join('/');
    if (seen.has(key)) throw new Error('Duplicate relationship: ' + key);
    seen.add(key);
    return {
      from: from as string,
      to: to as string,
      type: type as string,
      labelZh: text(input.labelZh, at + '.labelZh'),
      labelEn: text(input.labelEn, at + '.labelEn'),
      sourceRefs,
      state: reviewState(input.state, at + '.state'),
    };
  });
}

interface ArticleInput {
  kind: KnowledgeArticle['kind'];
  id: string;
  titleZh: string;
  titleEn: string;
  state: KnowledgeArticle['state'];
  timelineYear?: number;
  dynastyId?: KnowledgeArticle['dynastyId'];
  dynastySource?: string;
  people: string[];
  works: string[];
  objects: string[];
  sources: string[];
  zh: string;
  en: string;
  path: string;
}

function localLinkIssue(root: string, sourcePath: string, body: string, workIds: Set<string>, objectWork: Map<string, string>, articlePaths: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const match of body.matchAll(/\]\(\s*(?:<([^>\n]+)>|([^\s)]+))/g)) {
    const href = match[1] ?? match[2];
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) continue;
    const [file, anchor] = href.split('#');
    if (!file.endsWith('.md')) continue;
    const target = posix.normalize(posix.join('knowledge', sourcePath.split('/')[0], file));
    const entry = /^knowledge\/(works|people|notes|catalogue)\/([^/]+)\.md$/.exec(target);
    if (!entry) {
      if (target !== 'knowledge/README.md' && (target.startsWith('../') || !existsSync(join(root, target)))) {
        issues.push({ code: 'BROKEN_KNOWLEDGE_LINK', path: sourcePath, message: 'Broken local Markdown link: ' + href });
      }
      continue;
    }
    const [, kind, id] = entry;
    if (kind === 'catalogue') {
      if (!workIds.has(id) || (anchor && objectWork.get(anchor) !== id)) {
        issues.push({ code: 'BROKEN_KNOWLEDGE_LINK', path: sourcePath, message: 'Broken catalogue or witness link: ' + href });
      }
    } else if (kind === 'works' ? !workIds.has(id) : !articlePaths.has(kind + '/' + id + '.md')) {
      issues.push({ code: 'BROKEN_KNOWLEDGE_LINK', path: sourcePath, message: 'Broken knowledge page link: ' + href });
    }
  }
  return issues;
}

export function compileKnowledge(root: string = process.cwd(), options: { releaseMode?: boolean } = {}): CompileResult {
  const issues: ValidationIssue[] = [];
  const files: string[] = [];
  const workInputs = records(root, 'works');
  const objectInputs = records(root, 'objects');
  const personInputs = records(root, 'people');
  const placeInputs = records(root, 'places');
  const sourceInputs = records(root, 'sources');
  const noteInputs = records(root, 'notes');
  for (const group of [workInputs, objectInputs, personInputs, placeInputs, sourceInputs, noteInputs]) {
    for (const input of group) files.push(input.path);
  }
  files.push('knowledge/relations.md');

  const works = [];
  const guides: Array<GuideInput & { workId: string; zh: string; en: string; path: string }> = [];
  for (const input of workInputs) {
    try {
      const parsed = readWork(input);
      works.push(parsed.work);
      if (parsed.guide) {
        guides.push({
          ...parsed.guide,
          workId: parsed.work.id,
          path: input.path,
        });
      }
    } catch (error) {
      issues.push({ code: 'INVALID_WORK_RECORD', path: input.path, message: (error as Error).message });
    }
  }

  const objects = [];
  const media: MediaItem[] = [];
  for (const input of objectInputs) {
    try {
      const parsed = readObject(input);
      objects.push(parsed.object);
      media.push(...parsed.media);
    } catch (error) {
      issues.push({ code: 'INVALID_OBJECT_RECORD', path: input.path, message: (error as Error).message });
    }
  }

  const places = [];
  for (const input of placeInputs) {
    try {
      places.push(readPlace(input));
    } catch (error) {
      issues.push({ code: 'INVALID_PLACE_RECORD', path: input.path, message: (error as Error).message });
    }
  }

  const sources = [];
  for (const input of sourceInputs) {
    try {
      sources.push(readSource(input));
    } catch (error) {
      issues.push({ code: 'INVALID_SOURCE_RECORD', path: input.path, message: (error as Error).message });
    }
  }

  const articles: KnowledgeArticle[] = [];
  const articleInputs: ArticleInput[] = [];
  for (const guide of guides) {
    const work = works.find((item) => item.id === guide.workId);
    articleInputs.push({
      kind: 'works', id: guide.workId, titleZh: work?.titles.zh ?? guide.workId,
      titleEn: work?.titles.en ?? guide.workId, state: guide.state,
      timelineYear: guide.timelineYear ?? undefined, people: guide.people,
      works: [guide.workId], objects: guide.objects, sources: guide.sources,
      zh: guide.zh, en: guide.en, path: guide.path,
    });
  }
  for (const input of personInputs) {
    try {
      const person = readPerson(input);
      articleInputs.push({
        kind: 'people', id: person.id, titleZh: person.titleZh, titleEn: person.titleEn,
        state: person.state, dynastyId: person.dynastyId, dynastySource: person.dynastySource,
        people: [], works: person.works, objects: person.objects,
        sources: person.sources, zh: person.zh, en: person.en, path: input.path,
      });
    } catch (error) {
      issues.push({ code: 'INVALID_PERSON_RECORD', path: input.path, message: (error as Error).message });
    }
  }
  for (const input of noteInputs) {
    try {
      const note = readNoteRecord(input);
      articleInputs.push({
        kind: 'notes', id: note.id, titleZh: note.titleZh, titleEn: note.titleEn,
        state: note.state, people: idList(input.fields.people, 'people'), works: note.works, objects: note.objects,
        sources: note.sources, zh: note.zh, en: note.en, path: input.path,
      });
    } catch (error) {
      issues.push({ code: 'INVALID_NOTE_RECORD', path: input.path, message: (error as Error).message });
    }
  }
  const articleIds = new Set<string>();
  for (const input of articleInputs) {
    if (articleIds.has(input.id)) {
      issues.push({ code: 'DUPLICATE_KNOWLEDGE_ID', path: input.path, message: 'Duplicate knowledge ID: ' + input.id });
    }
    articleIds.add(input.id);
    if (input.state === 'reviewed' && input.sources.length === 0) {
      issues.push({ code: 'REVIEWED_WITHOUT_SOURCE', path: input.path, message: 'A reviewed page requires a source reference' });
    }
    if (options.releaseMode && input.state === 'draft') {
      issues.push({ code: 'DRAFT_KNOWLEDGE_IN_RELEASE', path: input.path, message: 'Draft article: ' + input.id });
    }
    articles.push({
      kind: input.kind, id: input.id, titleZh: input.titleZh, titleEn: input.titleEn,
      ...(input.timelineYear == null ? {} : { timelineYear: input.timelineYear }),
      ...(input.dynastyId == null ? {} : { dynastyId: input.dynastyId }),
      ...(input.dynastySource == null ? {} : { dynastySource: input.dynastySource }),
      state: input.state, people: input.people, works: input.works, objects: input.objects,
      sources: input.sources, zh: input.zh, en: input.en,
    });
  }

  let relations: KnowledgeRelation[] = [];
  try {
    relations = readRelations(root);
  } catch (error) {
    issues.push({ code: 'INVALID_RELATION_RECORD', path: 'knowledge/relations.md', message: (error as Error).message });
  }
  if (options.releaseMode) {
    for (const relation of relations) {
      if (relation.state === 'draft') {
        issues.push({ code: 'DRAFT_KNOWLEDGE_IN_RELEASE', path: 'knowledge/relations.md', message: 'Draft relationship: ' + relation.from + '/' + relation.type + '/' + relation.to });
      }
    }
  }

  const workIds = new Set(works.map((work) => work.id));
  const objectIds = new Set(objects.map((object) => object.id));
  const placeIds = new Set(places.map((place) => place.id));
  const sourceIds = new Set(sources.map((source) => source.id));
  const personIds = new Set(personInputs.map((input) => input.id));
  const articlePaths = new Set(articles.map((article) => article.kind + '/' + article.id + '.md'));
  const objectWork = new Map(objects.map((object) => [object.id, object.workId]));

  const check = (ids: string[], kind: 'works' | 'objects' | 'places' | 'sources' | 'people', path: string) => {
    if (!Array.isArray(ids)) {
      issues.push({ code: 'UNKNOWN_REFERENCE', path, message: 'Expected a list of ' + kind + ' references' });
      return;
    }
    const set = kind === 'works' ? workIds : kind === 'objects' ? objectIds : kind === 'places' ? placeIds : kind === 'sources' ? sourceIds : personIds;
    for (const id of ids) {
      if (!set.has(id)) issues.push({ code: 'UNKNOWN_REFERENCE', path, message: 'Unknown ' + kind + ' reference: ' + id });
    }
  };
  for (const work of works) {
    check(work.sourceRefs, 'sources', 'works/' + work.id);
    for (const entry of work.attribution) {
      check(entry.sourceRefs, 'sources', 'works/' + work.id);
      if (entry.personId) check([entry.personId], 'people', 'works/' + work.id);
    }
    for (const claim of work.claims ?? []) {
      check(claim.sourceRefs, 'sources', 'works/' + work.id);
      if (claim.personId) check([claim.personId], 'people', 'works/' + work.id);
    }
    if (work.notesZh && work.notesZh.length !== work.notes.length) {
      issues.push({ code: 'BILINGUAL_MISALIGNMENT', path: 'works/' + work.id, message: 'notesZh must align with notes' });
    }
  }
  for (const object of objects) {
    if (!workIds.has(object.workId)) issues.push({ code: 'UNKNOWN_REFERENCE', path: 'objects/' + object.id, message: 'Unknown work reference: ' + object.workId });
    check(object.currentCollection.sourceRefs, 'sources', 'objects/' + object.id);
    if (object.currentCollection.placeId) check([object.currentCollection.placeId], 'places', 'objects/' + object.id);
    for (const relation of object.relationships) {
      if (relation.targetObjectId === object.id) issues.push({ code: 'SELF_RELATION', path: 'objects/' + object.id, message: 'An object cannot relate to itself' });
      else if (!objectIds.has(relation.targetObjectId)) issues.push({ code: 'UNKNOWN_REFERENCE', path: 'objects/' + object.id, message: 'Unknown object reference: ' + relation.targetObjectId });
      check(relation.sourceRefs, 'sources', 'objects/' + object.id);
    }
    for (const event of object.provenanceEvents) {
      check(event.sourceRefs, 'sources', 'objects/' + object.id);
      if (event.placeId) check([event.placeId], 'places', 'objects/' + object.id);
      if (event.referencePlaceId) check([event.referencePlaceId], 'places', 'objects/' + object.id);
      if (event.objectId !== object.id) issues.push({ code: 'EVENT_OBJECT_MISMATCH', path: 'objects/' + object.id, message: 'Event ' + event.id + ' belongs to another object' });
    }
    for (const entry of object.attribution ?? []) {
      check(entry.sourceRefs, 'sources', 'objects/' + object.id);
      if (entry.personId) check([entry.personId], 'people', 'objects/' + object.id);
    }
    if (object.version) check(object.version.sourceRefs, 'sources', 'objects/' + object.id);
    for (const claim of object.claims ?? []) {
      check(claim.sourceRefs, 'sources', 'objects/' + object.id);
      if (claim.personId) check([claim.personId], 'people', 'objects/' + object.id);
    }
    if (object.notesZh && object.notesZh.length !== object.notes.length) {
      issues.push({ code: 'BILINGUAL_MISALIGNMENT', path: 'objects/' + object.id, message: 'notesZh must align with notes' });
    }
  }
  for (const place of places) {
    check(place.sourceRefs, 'sources', 'places/' + place.id);
    if (place.coordinates) check(place.coordinates.sourceRefs, 'sources', 'places/' + place.id);
    if (place.notesZh && place.notesZh.length !== place.notes.length) {
      issues.push({ code: 'BILINGUAL_MISALIGNMENT', path: 'places/' + place.id, message: 'notesZh must align with notes' });
    }
  }
  for (const article of articles) {
    check(article.works, 'works', article.kind + '/' + article.id);
    check(article.objects, 'objects', article.kind + '/' + article.id);
    check(article.people, 'people', article.kind + '/' + article.id);
    check(article.sources, 'sources', article.kind + '/' + article.id);
    issues.push(...localLinkIssue(root, article.kind + '/' + article.id + '.md', article.zh + '\n' + article.en, workIds, objectWork, articlePaths));
    for (const objectId of article.objects) {
      if (objectWork.get(objectId) !== article.id && article.kind === 'works') {
        issues.push({ code: 'GUIDE_OBJECT_MISMATCH', path: article.kind + '/' + article.id, message: 'Guide object ' + objectId + ' belongs to another work' });
      }
    }
  }
  for (const relation of relations) {
    check([relation.from, relation.to], 'people', 'relations.md');
    check(relation.sourceRefs, 'sources', 'relations.md');
  }

  const eventIds = new Set<string>();
  for (const object of objects) {
    for (const event of object.provenanceEvents) {
      if (eventIds.has(event.id)) issues.push({ code: 'DUPLICATE_EVENT_ID', path: 'objects/' + object.id, message: 'Duplicate event ID: ' + event.id });
      eventIds.add(event.id);
    }
  }

  const dataset: Dataset = { works, objects, places, sources, media };
  const validation = validateDataset(dataset, { releaseMode: options.releaseMode ?? false, knowledgeSources: articles.flatMap((article) => article.sources).concat(relations.flatMap((relation) => relation.sourceRefs)) });
  issues.push(...validation.errors);

  const knowledge: CompiledKnowledge = {
    formatVersion: KNOWLEDGE_FORMAT_VERSION,
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    counts: {
      works: works.length,
      objects: objects.length,
      places: places.length,
      sources: sources.length,
      media: media.length,
      events: dataset.objects.reduce((sum, object) => sum + object.provenanceEvents.length, 0),
      workArticles: articles.filter((article) => article.kind === 'works').length,
      peopleArticles: articles.filter((article) => article.kind === 'people').length,
      noteArticles: articles.filter((article) => article.kind === 'notes').length,
      peopleRelations: relations.length,
    },
    works,
    objects,
    places,
    sources,
    media,
    articles,
    relations,
  };
  return { knowledge, issues, validation, files };
}

function readNoteRecord(input: MarkdownRecord) {
  // Notes share the person article reader: title, state, references, bilingual body.
  return readPerson(input);
}

export function compiledText(result: CompileResult): string {
  if (result.issues.length) {
    throw new Error(result.issues.map((issue) => issue.path + ': ' + issue.message).join('\n'));
  }
  return canonical(result.knowledge);
}

export function writeCompiledKnowledge(root: string = process.cwd()): CompileResult {
  const result = compileKnowledge(root, { releaseMode: false });
  const target = join(root, COMPILED_PATH);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, compiledText(result), 'utf8');
  return result;
}

export function readCompiledKnowledge(root: string = process.cwd()): CompiledKnowledge {
  return JSON.parse(readFileSync(join(root, COMPILED_PATH), 'utf8')) as CompiledKnowledge;
}

export function checkCompiledKnowledge(root: string = process.cwd()): { ok: boolean; message: string } {
  const result = compileKnowledge(root, { releaseMode: false });
  const expected = compiledText(result);
  const file = join(root, COMPILED_PATH);
  if (!existsSync(file)) return { ok: false, message: COMPILED_PATH + ' is missing. Run npm run knowledge:compile.' };
  const actual = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  if (actual !== expected) return { ok: false, message: COMPILED_PATH + ' is stale. Run npm run knowledge:compile.' };
  return { ok: true, message: 'Compiled interface is current: ' + result.knowledge.counts.works + ' works, ' + result.knowledge.counts.objects + ' objects.' };
}

export function formatCompileResult(result: CompileResult): string {
  return formatReport(result.validation);
}
