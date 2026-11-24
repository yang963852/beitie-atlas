import Markdown from 'react-markdown';
import type { KnowledgeArticle, KnowledgeKind } from '../domain/knowledge';
import { libraryHref } from '../domain/library';
import { useLocale } from '../i18n';

const repository = 'https://github.com/yang963852/beitie-atlas/blob/main/';

function readingLink(href: string | undefined, guide: KnowledgeArticle) {
  if (!href || /^(?:https?:|mailto:|#)/i.test(href)) return href;
  const base = repository + 'knowledge/' + guide.kind + '/' + guide.id + '.md';
  const url = new URL(href, base);
  if (!url.href.startsWith(repository)) return url.href;
  const path = url.href.slice(repository.length).split('#')[0];
  const catalogue = /^knowledge\/catalogue\/([a-z0-9-]+)\.md$/.exec(path);
  if (catalogue) return url.hash ? '#/object/' + url.hash.slice(1) : '#/work/' + catalogue[1];
  const object = /^knowledge\/objects\/([a-z0-9-]+)\.md$/.exec(path);
  if (object) return '#/object/' + object[1];
  const article = /^knowledge\/(works|people|notes)\/([a-z0-9-]+)\.md$/.exec(path);
  return article ? libraryHref({ kind: article[1] as KnowledgeKind, id: article[2] }) : url.href;
}

export function KnowledgeProse({ guide }: { guide: KnowledgeArticle }) {
  const { locale } = useLocale();
  const useEnglish = locale === 'en' && Boolean(guide.en);
  return <div className="knowledge-prose" lang={useEnglish ? 'en' : 'zh-Hans'}>
    <Markdown skipHtml components={{
      a: ({ href, children }) => <a href={readingLink(href, guide)}>{children}</a>,
      img: ({ alt }) => <span>{alt}</span>,
      h1: ({ children }) => <h2>{children}</h2>,
    }}>{useEnglish ? guide.en : guide.zh}</Markdown>
  </div>;
}
