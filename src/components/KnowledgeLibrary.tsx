import { useLayoutEffect, useState, type ReactNode } from 'react';
import { useLocale } from '../i18n';
import { knowledgeRelations, type KnowledgeKind } from '../domain/knowledge';
import { findEntry, libraryEntries, libraryHref, linkedEntries, matchesQuery, type LibraryEntry } from '../domain/library';
import { getDataset, getPlace } from '../domain/data';
import { dynastyLabel } from '../domain/dynasties';
import { formatAttribution } from '../domain/attribution';
import { formatDate } from '../domain/dates';
import { isReleaseBuild } from '../domain/build';
import { SourceList } from './SourceList';
import { KnowledgeProse } from './KnowledgeProse';
import './knowledge-library.css';

const github = 'https://github.com/yang963852/beitie-atlas';
const tabs: KnowledgeKind[] = ['works', 'people', 'notes'];
const tabHref = (kind: KnowledgeKind) => kind === 'works' ? '#/library' : '#/library/' + kind;
const words = {
  zh: { works: '作品', people: '书家', notes: '读帖笔记', title: '作品与书家', collection: '实物图录', library: '知识库', beta: '内部测试第一版', feedback: '内测反馈', contribute: '补充资料', github: '在 GitHub 阅读', search: '搜索作品、书家或笔记', empty: '未找到相关条目。', clear: '清除搜索', objects: '传世实物', relations: '人物往来', sources: '参考出处', authored: '作品导读', none: '条目尚未收录', home: '返回知识目录', selected: '本期选读', unknownPlace: '收藏地待考' },
  en: { works: 'Works', people: 'Calligraphers', notes: 'Reading notes', title: 'Works and calligraphers', collection: 'Object catalogue', library: 'Library', beta: 'Internal beta 1', feedback: 'Beta feedback', contribute: 'Suggest a source', github: 'Read on GitHub', search: 'Search works, people or notes', empty: 'No matching entries.', clear: 'Clear search', objects: 'Surviving witnesses', relations: 'Documented relationships', sources: 'Sources', authored: 'Reading guide', none: 'Entry unavailable', home: 'Back to the library', selected: 'Selected readings', unknownPlace: 'Holding unknown' },
};
function EntryLink({ entry }: { entry: LibraryEntry }) {
  const { locale } = useLocale();
  return <a href={libraryHref(entry)}>{locale === 'zh' ? entry.titleZh : entry.titleEn || entry.titleZh}</a>;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="library-section"><h2>{title}</h2>{children}</section>;
}

function Index({ kind }: { kind: KnowledgeKind }) {
  const { locale } = useLocale();
  const t = words[locale];
  const [query, setQuery] = useState('');
  const searching = Boolean(query.trim());
  const entries = libraryEntries.filter((entry) => searching ? matchesQuery(entry, query) : entry.kind === kind);
  const features = ['yan-qinli-bei', 'shen-yinmo-dakai-jia'].flatMap((id) => {
    const entry = findEntry('works', id);
    return entry?.guide ? [entry] : [];
  });
  return <>
    <h1>{t.title}</h1>
    {kind === 'works' && !query && features.length > 0 && <section className="library-feature" aria-label={t.selected}>
      <span>{t.selected}</span>
      {features.map((entry) => <EntryLink key={entry.id} entry={entry} />)}
    </section>}
    <div className="library-tools">
      <nav aria-label={t.library}>{tabs.map((tab) => <a key={tab} href={tabHref(tab)} aria-current={tab === kind ? 'page' : undefined}>{t[tab]}</a>)}</nav>
      <input type="search" aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>
    <ul className="library-index">{entries.map((entry) => <li key={entry.id}>
      <EntryLink entry={entry} />
      <small>{entry.work ? dynastyLabel(entry.work.dynastyId, locale, entry.work.dynastyQualifier) : t[entry.kind]}</small>
    </li>)}</ul>
    {!entries.length && <p role="status">{t.empty} <button onClick={() => setQuery('')}>{t.clear}</button></p>}
  </>;
}

function Entry({ entry }: { entry: LibraryEntry }) {
  const { locale, strings } = useLocale();
  const t = words[locale];
  const { guide, work } = entry;
  const people = linkedEntries(entry, 'people');
  const links = [...linkedEntries(entry, 'works'), ...linkedEntries(entry, 'notes')];
  const objects = getDataset().objects.filter((object) => (entry.kind === 'works' && entry.id === object.workId) || guide?.objects.includes(object.id));
  const relations = entry.kind === 'people' ? knowledgeRelations.filter((r) => r.from === entry.id || r.to === entry.id) : [];
  const objectHeading = objects.every(o => o.survivalStatus === 'surviving') ? t.objects : t.collection;
  const sourceIds = [...new Set([...(guide?.sources ?? []), ...(work?.sourceRefs ?? [])])];
  const original = guide ? 'knowledge/' + guide.kind + '/' + guide.id + '.md' : 'knowledge/catalogue/' + entry.id + '.md';
  return <article>
    <p className="library-kicker">{t[entry.kind]} · {(guide?.state ?? work?.review.state) === 'draft' ? strings.reviewDraft : strings.reviewReviewed}</p>
    <h1>{locale === 'zh' ? entry.titleZh : entry.titleEn || entry.titleZh}</h1>
    {work && <p className="library-byline">{formatDate(work.compositionDate, locale)} · {formatAttribution(work.attribution, locale, strings.attributionRoleShort)}</p>}
    {guide ? <KnowledgeProse guide={guide} /> : work && <p className="library-intro">{(locale === 'zh' && work.backgroundZh) || work.background}</p>}
    {people.length > 0 && <Section title={t.people}><ul>{people.map((p) => <li key={p.id}><EntryLink entry={p} /></li>)}</ul></Section>}
    {links.length > 0 && tabs.filter((tab) => tab !== 'people').map((tab) => {
      const subset = links.filter((item) => item.kind === tab);
      return subset.length > 0 && <Section key={tab} title={t[tab]}><ul>{subset.map((item) => <li key={item.id}><EntryLink entry={item} /></li>)}</ul></Section>;
    })}
    {relations.length > 0 && <Section title={t.relations}><ul>{relations.map((r) => {
      const from = findEntry('people', r.from);
      const to = findEntry('people', r.to);
      return from && to && <li key={[r.from, r.type, r.to].join('/')}>
        <EntryLink entry={from} /> · {locale === 'zh' ? r.labelZh : r.labelEn} · <EntryLink entry={to} />
        <small> {r.state === 'draft' ? strings.reviewDraft : strings.reviewReviewed}</small><SourceList ids={r.sourceRefs} compact />
      </li>;
    })}</ul></Section>}
    {objects.length > 0 && <Section title={objectHeading}><ul>{objects.map((o) => {
      const { locationKind, placeId } = o.currentCollection;
      const place = locationKind === 'unknown' ? undefined : getPlace(placeId);
      const holding = place?.names[locale] ?? t.unknownPlace;
      return <li key={o.id}><a href={'#/object/' + o.id}>{o.titles[locale]}</a>
        <small> · {strings.survivalLabels[o.survivalStatus]} · {locationKind === 'last-known' ? strings.lastKnownPlace(holding) : holding}</small></li>;
    })}</ul></Section>}
    {sourceIds.length > 0 && <Section title={t.sources}><SourceList ids={sourceIds} plain /></Section>}
    <div className="library-footlinks"><a href={github + '/blob/main/' + original}>{t.github}</a>
      <a href={github + '/issues/new?template=knowledge.yml&title=' + encodeURIComponent(entry.titleZh)}>{t.contribute}</a></div>
  </article>;
}

export function KnowledgeLibrary({ hash }: { hash: string }) {
  const { locale, setLocale } = useLocale();
  const t = words[locale];
  const [, route, id] = hash.split('/');
  const kind = route === 'work' ? 'works' : route === 'person' ? 'people' : 'notes';
  const entry = route !== 'library' && id ? findEntry(kind, id) : undefined;
  const indexKind = id === 'people' || id === 'notes' ? id : 'works';
  useLayoutEffect(() => {
    const heading = document.getElementById('reading-main');
    heading?.focus({ preventScroll: true });
    document.querySelector('.reading-top')?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  }, [hash]);
  return <div className="reading-room">
    <header className="reading-top">
      <a className="reading-brand" href="#/library">碑帖之间</a>
      <a href="#catalogue">{t.collection}</a>
      <button type="button" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'English' : '简体中文'}</button>
    </header>
    <main className="reading-main" id="reading-main" tabIndex={-1}>
      <div className="reading-status">{route === 'library' ? <span>{t.library}</span> : <a href={tabHref(kind)}>← {t.home}</a>}
        {!isReleaseBuild && <a href={github + '/issues/new?template=beta-feedback.yml'}>{t.beta} · {t.feedback}</a>}</div>
      {route === 'library' ? <Index key={indexKind} kind={indexKind} /> : entry ? <Entry entry={entry} /> : <h1>{t.none}</h1>}
    </main>
    <footer className="reading-footer"><a href={github + '/tree/main/knowledge'}>{t.github}</a>
      <a href={github + '/issues/new?template=knowledge.yml'}>{t.contribute}</a></footer>
  </div>;
}
