import type { DynastyId, ReviewState } from './types';

export const knowledgeKinds = ['works', 'people', 'notes'] as const;
export type KnowledgeKind = (typeof knowledgeKinds)[number];

export interface KnowledgeArticle {
  kind: KnowledgeKind;
  id: string;
  titleZh: string;
  titleEn: string;
  timelineYear?: number;
  /** The conventional period of a calligrapher, for the library reading order. */
  dynastyId?: DynastyId;
  /** The person source that states that period. */
  dynastySource?: string;
  state: ReviewState;
  people: string[];
  works: string[];
  objects: string[];
  sources: string[];
  zh: string;
  en: string;
}

export interface KnowledgeRelation {
  from: string;
  to: string;
  type: string;
  labelZh: string;
  labelEn: string;
  sourceRefs: string[];
  state: ReviewState;
}

export function knowledgeSourceIds(articles: KnowledgeArticle[], relations: KnowledgeRelation[]): string[] {
  return [...articles.flatMap(article => article.sources), ...relations.flatMap(relation => relation.sourceRefs)];
}
