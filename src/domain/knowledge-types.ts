import type { ReviewState } from './types';

export const knowledgeKinds = ['works', 'people', 'notes'] as const;
export type KnowledgeKind = (typeof knowledgeKinds)[number];

export interface KnowledgeArticle {
  kind: KnowledgeKind;
  id: string;
  titleZh: string;
  titleEn: string;
  timelineYear?: number;
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
