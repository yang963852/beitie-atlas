import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { parse } from 'yaml';
import { knowledgeKinds, type KnowledgeArticle, type KnowledgeKind, type KnowledgeRelation } from '../../src/domain/knowledge-types';
import type { ValidationIssue } from '../../src/domain/validate';
import type { RawDataset } from './dataset';

const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const links = ['people', 'works', 'objects', 'sources'] as const;
const articleKeys = new Set(['titleZh', 'titleEn', 'state', ...links]);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textField(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error('Expected nonempty text for ' + key);
  return value.trim();
}

function reviewState(row: Record<string, unknown>) {
  if (row.state !== 'draft' && row.state !== 'reviewed') throw new Error('Expected state draft or reviewed');
  return row.state;
}

function idList(items: unknown, key: string): string[] {
  if (!Array.isArray(items) || items.some(id => typeof id !== 'string' || !stableId.test(id))) {
    throw new Error('Expected stable IDs in ' + key);
  }
  if (new Set(items).size !== items.length) throw new Error('Duplicate reference in ' + key);
  return items as string[];
}

function commaIds(row: Record<string, unknown>, key: string): string[] {
  if (row[key] == null || row[key] === '') return [];
  return idList(textField(row, key).split(',').map(id => id.trim()), key);
}

export function parseKnowledgeArticle(kind: KnowledgeKind, id: string, markdown: string): KnowledgeArticle {
  if (!stableId.test(id)) throw new Error('Use a lowercase stable ID as the filename');
  const input = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const header = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(input);
  if (!header) throw new Error('Missing YAML frontmatter');
  const fields: unknown = parse(header[1], { schema: 'failsafe', uniqueKeys: true });
  if (!record(fields)) throw new Error('Expected YAML fields');
  for (const key of Object.keys(fields)) {
    if (!articleKeys.has(key)) throw new Error('Unrecognized frontmatter field ' + key);
  }

  const body = input.slice(header[0].length);
  const sections = [...body.matchAll(/^## (中文|English)[ \t]*$/gm)];
  if (sections[0]?.[1] !== '中文' || sections.length > 2 || (sections[1] && sections[1][1] !== 'English')) {
    throw new Error('Use one "## 中文" section, followed by an optional "## English" section');
  }
  const prefix = body.slice(0, sections[0].index).trim();
  // An optional H1 makes the standalone file comfortable to read on GitHub.
  if (prefix && !/^# [^\n]+$/.test(prefix)) throw new Error('Place article prose inside the language sections');
  const zh = body.slice(sections[0].index + sections[0][0].length, sections[1]?.index).trim();
  const en = sections[1] ? body.slice(sections[1].index + sections[1][0].length).trim() : '';
  if (!zh || (sections[1] && !en)) throw new Error('A language heading must have a body');
  const titleZh = textField(fields, 'titleZh');
  return {
    kind, id, titleZh, titleEn: fields.titleEn == null ? titleZh : textField(fields, 'titleEn'),
    state: reviewState(fields), people: commaIds(fields, 'people'), works: commaIds(fields, 'works'),
    objects: commaIds(fields, 'objects'), sources: commaIds(fields, 'sources'), zh, en,
  };
}

function parseRelation(input: unknown): KnowledgeRelation {
  if (!record(input)) throw new Error('Expected a relation object');
  const { from, to, type } = input;
  if ([from, to, type].some(value => typeof value !== 'string' || !stableId.test(value))) {
    throw new Error('Relation endpoints and type must be stable IDs');
  }
  if (from === to) throw new Error('A relation needs two different people');
  const sourceRefs = idList(input.sourceRefs, 'sourceRefs');
  if (!sourceRefs.length) throw new Error('A relation requires at least one source');
  return { from: from as string, to: to as string, type: type as string,
    labelZh: textField(input, 'labelZh'), labelEn: textField(input, 'labelEn'),
    sourceRefs, state: reviewState(input) };
}

export function readKnowledge(root: string, dataset: RawDataset, release: boolean) {
  const articles: KnowledgeArticle[] = [];
  const relations: KnowledgeRelation[] = [];
  const errors: ValidationIssue[] = [];
  const issue = (path: string, message: string, code = 'INVALID_KNOWLEDGE') => errors.push({ path, code, message });
  for (const kind of knowledgeKinds) {
    const dir = 'knowledge/' + kind;
    // Git does not retain empty directories when the last draft of a kind is withdrawn.
    if (!existsSync(join(root, dir))) continue;
    for (const file of readdirSync(join(root, dir)).filter(file => file.endsWith('.md')).sort()) {
      const path = dir + '/' + file;
      try {
        articles.push(parseKnowledgeArticle(kind, file.slice(0, -3), readFileSync(join(root, path), 'utf8')));
      } catch (error) {
        issue(path, (error as Error).message);
      }
    }
  }
  const relationPath = 'data/knowledge-relations.json';
  try {
    const rows: unknown = JSON.parse(readFileSync(join(root, relationPath), 'utf8'));
    if (!Array.isArray(rows)) throw new Error('Expected an array of relations');
    for (const [index, row] of rows.entries()) {
      try { relations.push(parseRelation(row)); }
      catch (error) { issue(relationPath + '[' + index + ']', (error as Error).message); }
    }
  } catch (error) {
    issue(relationPath, (error as Error).message);
  }

  const catalogIds = (rows: unknown[]) => rows.filter(record).map(row => row.id);
  const ids = {
    people: new Set(articles.filter(a => a.kind === 'people').map(a => a.id)),
    works: new Set([...catalogIds(dataset.works), ...articles.filter(a => a.kind === 'works').map(a => a.id)]),
    objects: new Set(catalogIds(dataset.objects)), sources: new Set(catalogIds(dataset.sources)),
  };
  const requireRefs = (kind: typeof links[number], refs: string[], path: string) => {
    for (const ref of refs) if (!ids[kind].has(ref)) issue(path, 'Unknown ' + kind + ' reference: ' + ref);
  };
  const articleIds = new Set<string>();
  const authoredPaths = new Set(articles.map(a => a.kind + '/' + a.id + '.md'));
  const objectWork = new Map(dataset.objects.filter(record).map(o => [o.id, o.workId]));
  const catalogueWorkIds = new Set(catalogIds(dataset.works));
  for (const article of articles) {
    const path = 'knowledge/' + article.kind + '/' + article.id + '.md';
    if (articleIds.has(article.id)) issue(path, 'Duplicate knowledge ID: ' + article.id);
    articleIds.add(article.id);
    if (article.state === 'reviewed' && !article.sources.length) issue(path, 'A reviewed page requires a source reference');
    for (const kind of links) requireRefs(kind, article[kind], path);
    const body = article.zh + '\n' + article.en;
    for (const match of body.matchAll(/\]\(\s*(?:<([^>\n]+)>|([^\s)]+))/g)) {
      const href = match[1] ?? match[2];
      if (/^(?:[a-z]+:|\/|#)/i.test(href)) continue;
      const [file, anchor] = href.split('#');
      if (!file.endsWith('.md')) continue;
      const target = posix.normalize(posix.join('knowledge', article.kind, file));
      const entry = /^knowledge\/(works|people|notes|catalogue)\/([^/]+)\.md$/.exec(target);
      if (!entry) {
        if (target !== 'knowledge/README.md' && (target.startsWith('../') || !existsSync(join(root, target)))) {
          issue(path, 'Broken local Markdown link: ' + href);
        }
        continue;
      }
      const [, kind, id] = entry;
      if (kind === 'catalogue') {
        if (!catalogueWorkIds.has(id) || (anchor && objectWork.get(anchor) !== id)) {
          issue(path, 'Broken catalogue or witness link: ' + href);
        }
      } else if (!authoredPaths.has(kind + '/' + id + '.md')) {
        issue(path, 'Broken knowledge page link: ' + href);
      }
    }
    if (release && article.state === 'draft') issue(path, 'Draft article: ' + article.id, 'DRAFT_KNOWLEDGE_IN_RELEASE');
  }
  const relationIds = new Set<string>();
  for (const relation of relations) {
    const endpoints = [relation.from, relation.to];
    const symmetric = relation.type === 'correspondence' || relation.type === 'poetic-exchange';
    const pair = symmetric ? [...endpoints].sort() : endpoints;
    const key = [relation.type, ...pair].join('/');
    const path = relationPath + ' ' + key;
    if (relationIds.has(key)) issue(path, 'Duplicate relationship');
    relationIds.add(key);
    requireRefs('people', endpoints, path);
    requireRefs('sources', relation.sourceRefs, path);
    if (release && relation.state === 'draft') issue(path, 'Draft relationship: ' + key, 'DRAFT_KNOWLEDGE_IN_RELEASE');
  }
  const counts = {
    workArticles: articles.filter(a => a.kind === 'works').length,
    peopleArticles: articles.filter(a => a.kind === 'people').length,
    noteArticles: articles.filter(a => a.kind === 'notes').length,
    peopleRelations: relations.length,
  };
  return { articles, relations, errors, counts };
}
