/**
 * Look-up helpers over the compiled knowledge interface, for agents and
 * maintainers who need a record together with the sources that support it.
 *
 * This reads `CompiledKnowledge` from the compiler rather than a cache, so a
 * query always reflects the Markdown as it is on disk right now.
 */
import type { CompiledKnowledge } from './knowledge-compiler';

export const QUERY_KINDS = ['works', 'objects', 'people', 'notes', 'places', 'sources'] as const;
export type QueryKind = (typeof QUERY_KINDS)[number];

export function isQueryKind(value: string): value is QueryKind {
  return (QUERY_KINDS as readonly string[]).includes(value);
}

export interface QueryHit {
  kind: QueryKind;
  id: string;
  titleZh: string;
  titleEn: string;
}

export interface QueryDetail {
  hit: QueryHit;
  record: Record<string, unknown>;
  /** The authored reading guide attached to a work, when one exists. */
  guide?: Record<string, unknown>;
  /** Recorded relations whose endpoint is this person, with sources. */
  relations?: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  /** Referenced source IDs that no source record defines. */
  missingSources: string[];
}

type Bag = Record<string, unknown>;

function asBag(value: unknown): Bag {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Bag) : {};
}

function asBags(value: unknown): Bag[] {
  return Array.isArray(value) ? value.map(asBag) : [];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function fold(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function entries(knowledge: CompiledKnowledge, kind: QueryKind): Bag[] {
  switch (kind) {
    case 'works':
      return asBags(knowledge.works);
    case 'objects':
      return asBags(knowledge.objects);
    case 'places':
      return asBags(knowledge.places);
    case 'sources':
      return asBags(knowledge.sources);
    case 'people':
    case 'notes':
      return asBags(knowledge.articles).filter((article) => article.kind === kind);
  }
}

function titles(kind: QueryKind, record: Bag): { titleZh: string; titleEn: string } {
  if (kind === 'places') {
    const names = asBag(record.names);
    return { titleZh: text(names.zh), titleEn: text(names.en) };
  }
  if (kind === 'sources') return { titleZh: text(record.title), titleEn: '' };
  if (kind === 'people' || kind === 'notes') {
    return { titleZh: text(record.titleZh), titleEn: text(record.titleEn) };
  }
  const named = asBag(record.titles);
  return { titleZh: text(named.zh), titleEn: text(named.en) };
}

/** Matches an ID, either title or an alias, ignoring case and accents. */
export function searchKnowledge(
  knowledge: CompiledKnowledge,
  query: string,
  kind?: QueryKind,
): QueryHit[] {
  const needle = fold(query);
  if (!needle) return [];
  const hits: QueryHit[] = [];
  for (const current of kind ? [kind] : QUERY_KINDS) {
    for (const record of entries(knowledge, current)) {
      const id = text(record.id);
      if (!id) continue;
      const title = titles(current, record);
      const aliases = Array.isArray(record.aliases) ? record.aliases.map(text) : [];
      const haystack = [id, title.titleZh, title.titleEn, ...aliases].map(fold).join('\n');
      if (haystack.includes(needle)) hits.push({ kind: current, id, ...title });
    }
  }
  return hits;
}

export function findRecord(
  knowledge: CompiledKnowledge,
  kind: QueryKind,
  id: string,
): Bag | undefined {
  return entries(knowledge, kind).find((record) => record.id === id);
}

const SOURCE_KEYS = new Set(['sourceRefs', 'sources']);

/**
 * Collects every source ID a record cites, wherever it sits: attribution,
 * collection, provenance events, relationships, review or guide body.
 */
export function collectSourceIds(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, found);
    return found;
  }
  for (const [key, child] of Object.entries(asBag(value))) {
    const refs = SOURCE_KEYS.has(key) && Array.isArray(child) && child.every((item) => typeof item === 'string');
    if (refs) {
      for (const ref of child as string[]) found.add(ref);
    } else {
      collectSourceIds(child, found);
    }
  }
  return found;
}

export function describeKnowledge(
  knowledge: CompiledKnowledge,
  kind: QueryKind,
  id: string,
): QueryDetail | undefined {
  const record = findRecord(knowledge, kind, id);
  if (!record) return undefined;

  const articles = asBags(knowledge.articles);
  const guide = kind === 'works'
    ? articles.find((article) => article.kind === 'works' && article.id === id)
    : undefined;
  const relations = kind === 'people'
    ? asBags(knowledge.relations).filter((relation) => relation.from === id || relation.to === id)
    : undefined;

  const refs = collectSourceIds(record);
  if (guide) collectSourceIds(guide, refs);
  for (const relation of relations ?? []) collectSourceIds(relation, refs);

  const byId = new Map(asBags(knowledge.sources).map((source) => [text(source.id), source]));
  const sources: Bag[] = [];
  const missingSources: string[] = [];
  for (const ref of [...refs].sort()) {
    const source = byId.get(ref);
    if (source) sources.push(source);
    else missingSources.push(ref);
  }

  return {
    hit: { kind, id, ...titles(kind, record) },
    record,
    ...(guide ? { guide } : {}),
    ...(relations ? { relations } : {}),
    sources,
    missingSources,
  };
}
