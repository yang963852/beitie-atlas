/**
 * The contribution channel is deliberately not a form endpoint.
 *
 * A reader's message becomes text they can read, copy, and hand to the project
 * themselves. Nothing is posted from this page, no address is collected, and no
 * submission is treated as evidence until an editor has checked an openable
 * source. The channel is the project's public issue page, so the composed text
 * travels with its own caveat.
 */

export const CONTRIBUTION_ISSUE_URL = 'https://github.com/yang963852/beitie-atlas/issues/new';

export interface ContributionDraft {
  objectId: string | null;
  objectTitle: string | null;
  pageUrl: string;
  details: string;
  source: string;
  contact: string;
}

const LABELS = {
  zh: {
    heading: '【碑帖之间 · 资料补充】',
    record: '记录',
    link: '页面',
    details: '■ 掌握的信息',
    source: '■ 可核对来源',
    contact: '■ 联系方式',
    none: '（未提供）',
    caveat:
      '说明：这是读者提交的线索，不是已核实的结论。请以可打开的机构、政府页面或印刷图录核对后，再决定是否收录。',
  },
  en: {
    heading: '[Between Steles — contribution]',
    record: 'Record',
    link: 'Page',
    details: '■ What the contributor knows',
    source: '■ Where it can be checked',
    contact: '■ Contact',
    none: '(not given)',
    caveat:
      'Note: this is a reader-submitted lead, not a verified claim. Please check an openable institutional, government or printed source before adding it to the corpus.',
  },
} as const;

function filled(value: string): string {
  const trimmed = value.trim();
  return trimmed === '' ? '' : trimmed;
}

/** Human-readable text, shown in the form and copied by the reader. */
export function buildContributionBody(draft: ContributionDraft, locale: 'zh' | 'en'): string {
  const text = LABELS[locale];
  const record = draft.objectTitle ?? text.none;

  return [
    text.heading,
    `${text.record}：${record}`,
    `${text.link}：${draft.pageUrl}`,
    '',
    text.details,
    filled(draft.details) || text.none,
    '',
    text.source,
    filled(draft.source) || text.none,
    '',
    text.contact,
    filled(draft.contact) || text.none,
    '',
    '——',
    text.caveat,
  ].join('\n');
}

export function buildContributionTitle(draft: ContributionDraft, locale: 'zh' | 'en'): string {
  const prefix = locale === 'zh' ? '[资料补充]' : '[Contribution]';
  return `${prefix} ${draft.objectTitle ?? (locale === 'zh' ? '新资料' : 'new information')}`;
}

/** The public issue page, pre-filled. It opens only when the reader follows it. */
export function buildContributionUrl(draft: ContributionDraft, locale: 'zh' | 'en'): string {
  const url = new URL(CONTRIBUTION_ISSUE_URL);
  url.searchParams.set('title', buildContributionTitle(draft, locale));
  url.searchParams.set('template', 'knowledge.yml');
  if (draft.objectTitle) url.searchParams.set('subject', draft.objectTitle);
  url.searchParams.set('claim', filled(draft.details) + '\n\n' + draft.pageUrl);
  if (filled(draft.source)) url.searchParams.set('evidence', filled(draft.source));
  if (filled(draft.contact)) url.searchParams.set('credit', filled(draft.contact));
  return url.toString();
}

/** The share link a reader came from, without a query or fragment duplication. */
export function objectPageUrl(objectId: string | null, pageUrl: string): string {
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = objectId ? `/object/${objectId}` : '';
  return url.href;
}
