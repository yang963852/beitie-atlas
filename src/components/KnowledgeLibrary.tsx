import { useLayoutEffect, useState, type ReactNode } from 'react';
import { useLocale } from '../i18n';
import { knowledgeRelations, type KnowledgeKind } from '../domain/knowledge';
import { findEntry, libraryEntries, libraryHref, linkedEntries, matchesQuery, type LibraryEntry } from '../domain/library';
import { getDataset, getPlace } from '../domain/data';
import { dynastyLabel } from '../domain/dynasties';
import { formatAttribution } from '../domain/attribution';
import { formatDate } from '../domain/dates';
import { isReleaseBuild } from '../domain/build';
import { EDITION_LABEL } from '../domain/version';
import { SourceList } from './SourceList';
import { ClaimSection } from './ClaimSection';
import { KnowledgeProse } from './KnowledgeProse';
import { ProvenanceEvents } from './ProvenanceEvents';
import { ReaderHeader } from './ReaderHeader';
import './knowledge-library.css';

const github = 'https://github.com/yang963852/beitie-atlas';
const downloadHref = (import.meta.env.BASE_URL || '/') + 'download/beitie-knowledge.zip';
const tabs: KnowledgeKind[] = ['works', 'people', 'notes'];
const tabHref = (kind: KnowledgeKind) => kind === 'works' ? '#/library' : '#/library/' + kind;
const totals = {
  works: libraryEntries.filter((entry) => entry.kind === 'works').length,
  people: libraryEntries.filter((entry) => entry.kind === 'people').length,
  notes: libraryEntries.filter((entry) => entry.kind === 'notes').length,
};
const words = {
  zh: { works: '作品', people: '书家', notes: '读帖笔记', title: '读帖', collection: '实物图录', library: '读帖', beta: EDITION_LABEL.zh, feedback: '反馈', contribute: '补充资料', github: '在 GitHub 阅读', download: '下载完整知识库（ZIP）', search: '搜索作品、书家或笔记', empty: '未找到相关条目。', clear: '清除搜索', objects: '传世实物', objectsHeading: '选择一件实物', objectsHint: '选择一件实物。每件实物只显示自己的履历。', selectedObject: '当前实物', objectMap: '在地图与完整记录中查看', noObjects: '本项目尚未收录可辨实物。', claims: '异说与意见', roles: '关联作品与角色', relations: '人物往来', sources: '参考出处', authored: '作品导读', none: '条目尚未收录', home: '返回读帖', unknownPlace: '收藏地待考' },
  en: { works: 'Works', people: 'Calligraphers', notes: 'Reading notes', title: 'Reading room', collection: 'Object catalogue', library: 'Reading room', beta: EDITION_LABEL.en, feedback: 'Feedback', contribute: 'Suggest a source', github: 'Read on GitHub', download: 'Download the full library (ZIP)', search: 'Search works, people or notes', empty: 'No matching entries.', clear: 'Clear search', objects: 'Surviving witnesses', objectsHeading: 'Choose a witness', objectsHint: 'Choose a witness. Each witness keeps its own record.', selectedObject: 'Selected witness', objectMap: 'Open the map and full record', noObjects: 'No identifiable witness is catalogued yet.', claims: 'Claims and opinions', roles: 'Works and roles', relations: 'Documented relationships', sources: 'Sources', authored: 'Reading guide', none: 'Entry unavailable', home: 'Back to the reading room', unknownPlace: 'Holding unknown' },
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
  const groups = new Map<string, LibraryEntry[]>();
  for (const entry of entries) {
    const label = entry.kind === 'people' && entry.guide?.dynastyId
      ? dynastyLabel(entry.guide.dynastyId, locale)
      : entry.work && !searching
        ? dynastyLabel(entry.work.dynastyId, locale)
        : t[entry.kind];
    const group = groups.get(label) ?? [];
    group.push(entry);
    groups.set(label, group);
  }
  return <>
    <header className="library-head">
      <h1>{kind === 'works' ? t.title : t[kind]}</h1>
      <p className="library-lede">{locale === 'zh'
        ? `共 ${totals.works} 部作品 · ${totals.people} 位书家 · ${totals.notes} 篇读帖笔记${kind === 'works' ? '，依时代编次' : ''}`
        : `${totals.works} works · ${totals.people} calligraphers · ${totals.notes} reading notes${kind === 'works' ? ', arranged by period' : ''}`}</p>
    </header>
    <div className="library-tools">
      <nav aria-label={t.library}>{tabs.map((tab) => <a key={tab} href={tabHref(tab)} aria-current={tab === kind ? 'page' : undefined}>{t[tab]}</a>)}</nav>
      <input type="search" aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>
    {Array.from(groups, ([label, group]) => <section className="library-shelf" key={label}>
      <h2>{label} <small>{group.length}</small></h2>
      <ul className="library-index">{group.map(entry => <li key={entry.id}>
        <EntryLink entry={entry} />
        {entry.work ? <small>{dynastyLabel(entry.work.dynastyId, locale, entry.work.dynastyQualifier)}</small> : null}
      </li>)}</ul>
    </section>)}
    {!entries.length && <p role="status">{t.empty} <button onClick={() => setQuery('')}>{t.clear}</button></p>}
  </>;
}

function Entry({ entry }: { entry: LibraryEntry }) {
  const { locale, strings } = useLocale();
  const t = words[locale];
  const { guide, work } = entry;
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const people = linkedEntries(entry, 'people');
  const links = [...linkedEntries(entry, 'works'), ...linkedEntries(entry, 'notes')];
  const objects = getDataset().objects.filter((object) => (entry.kind === 'works' && entry.id === object.workId) || guide?.objects.includes(object.id));
  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? objects[0];
  const relations = entry.kind === 'people' ? knowledgeRelations.filter((r) => r.from === entry.id || r.to === entry.id) : [];
  const objectHeading = objects.every(o => o.survivalStatus === 'surviving') ? t.objects : t.collection;
  const sourceIds = [...new Set([...(guide?.sources ?? []), ...(work?.sourceRefs ?? [])])];
  const sourceName = entry.kind === 'works' ? 'works' : entry.kind === 'people' ? 'people' : 'notes';
  const original = 'knowledge/' + sourceName + '/' + entry.id + '.md';
  const editPath = original;
  const relatedWorks = entry.kind === 'people'
    ? getDataset().works.filter((candidate) => candidate.attribution.some((credit) => credit.personId === entry.id))
    : [];
  const relatedObjects = entry.kind === 'people'
    ? getDataset().objects.filter((object) => (object.attribution ?? []).some((credit) => credit.personId === entry.id))
    : [];
  const selectedPlace = selectedObject && selectedObject.currentCollection.locationKind !== 'unknown' ? getPlace(selectedObject.currentCollection.placeId) : undefined;
  const personDynasty = entry.kind === 'people' ? entry.guide?.dynastyId : undefined;
  return <article>
    <header className="library-heading">
      <p className="library-kicker">{personDynasty ? dynastyLabel(personDynasty, locale) + ' · ' : ''}{t[entry.kind]}{(work?.review.state ?? guide?.state) === 'draft' ? ' · ' + strings.reviewDraft : ''}</p>
      <h1>{locale === 'zh' ? entry.titleZh : entry.titleEn || entry.titleZh}</h1>
      {work && <p className="library-byline">{formatDate(work.compositionDate, locale)}
        {work.compositionDate.meaning ? ' · ' + strings.dateMeaningLabels[work.compositionDate.meaning] : ''}
        {' · '}{formatAttribution(work.attribution, locale, strings.attributionRoleShort)}</p>}
      <a className="library-edit" href={github + '/edit/main/' + editPath}>{locale === 'zh' ? '编辑条目并提交' : 'Edit and submit changes'}</a>
    </header>
    {guide && work && <p className="library-guide-meta">{t.authored}{guide.state === 'draft' ? ' · ' + strings.reviewDraft : ''}</p>}
    {guide ? <KnowledgeProse guide={guide} /> : work && <p className="library-intro">{(locale === 'zh' && work.backgroundZh) || work.background}</p>}
    {people.length > 0 && <Section title={t.people}><ul>{people.map((p) => <li key={p.id}><EntryLink entry={p} /></li>)}</ul></Section>}
    {entry.kind === 'people' && (relatedWorks.length > 0 || relatedObjects.length > 0) && <Section title={t.roles}>
      <ul>
        {relatedWorks.map((candidate) => {
          const roles = candidate.attribution
            .filter((credit) => credit.personId === entry.id)
            .map((credit) => [strings.attributionRoleLabels[credit.role], credit.certainty !== 'documented' ? strings.certaintyLabels[credit.certainty] : undefined].filter(Boolean).join(' · '))
            .join(locale === 'zh' ? '、' : ', ');
          return <li key={candidate.id}><a href={'#/work/' + candidate.id}>{locale === 'zh' ? candidate.titles.zh : candidate.titles.en}</a> <small>{roles}</small></li>;
        })}
        {relatedObjects.map((object) => {
          const roles = (object.attribution ?? [])
            .filter((credit) => credit.personId === entry.id)
            .map((credit) => [strings.attributionRoleLabels[credit.role], credit.certainty !== 'documented' ? strings.certaintyLabels[credit.certainty] : undefined].filter(Boolean).join(' · '))
            .join(locale === 'zh' ? '、' : ', ');
          return <li key={object.id}><a href={'#/object/' + object.id}>{locale === 'zh' ? object.titles.zh : object.titles.en}</a> <small>{roles}</small></li>;
        })}
      </ul>
    </Section>}
    {objects.length > 0 && <Section title={objectHeading}>
      <p className="section__meta">{t.objectsHint}</p>
      <div className="library-objects" role="group" aria-label={t.objectsHeading}>
        {objects.map((object) => <button type="button" key={object.id} aria-pressed={selectedObject?.id === object.id} onClick={() => setSelectedObjectId(object.id)}>
          <strong>{object.titles[locale]}</strong>
          <small>{strings.objectTypeLabels[object.objectType]} · {formatDate(object.productionDate, locale)}</small>
        </button>)}
      </div>
      {selectedObject ? <div className="library-object">
        <h3>{selectedObject.titles[locale]}</h3>
        <p className="section__meta">{selectedObject.review.state === 'draft' ? strings.reviewDraft + ' · ' : ''}{strings.objectTypeLabels[selectedObject.objectType]} · {strings.survivalLabels[selectedObject.survivalStatus]} · {selectedPlace && selectedObject.currentCollection.locationKind === 'last-known' ? strings.lastKnownPlace(selectedPlace.names[locale]) : selectedPlace?.names[locale] ?? t.unknownPlace}</p>
        <a href={'#/object/' + selectedObject.id}>{t.objectMap}</a>
        <a className="library-edit" href={github + '/edit/main/knowledge/objects/' + selectedObject.id + '.md'}>{locale === 'zh' ? '编辑这件实物的源稿' : 'Edit this object record'}</a>
        <ProvenanceEvents object={selectedObject} />
        <ClaimSection claims={selectedObject.claims} />
      </div> : <p className="section__empty">{t.noObjects}</p>}
    </Section>}
    {objects.length === 0 && entry.kind === 'works' ? <Section title={objectHeading}><p className="section__empty">{t.noObjects}</p></Section> : null}
    {work ? <ClaimSection claims={work.claims} /> : null}
    {links.length > 0 && tabs.filter((tab) => tab !== 'people').map((tab) => {
      const subset = links.filter((item) => item.kind === tab);
      return subset.length > 0 && <Section key={tab} title={t[tab]}><ul>{subset.map((item) => <li key={item.id}><EntryLink entry={item} /></li>)}</ul></Section>;
    })}
    {relations.length > 0 && <Section title={t.relations}><ul>{relations.map((r) => {
      const from = findEntry('people', r.from);
      const to = findEntry('people', r.to);
      return from && to && <li key={[r.from, r.type, r.to].join('/')}>
        <EntryLink entry={from} /> · {locale === 'zh' ? r.labelZh : r.labelEn} · <EntryLink entry={to} />
        {r.state === 'draft' ? <small> {strings.reviewDraft}</small> : null}<SourceList ids={r.sourceRefs} compact />
      </li>;
    })}</ul></Section>}
    {sourceIds.length > 0 && <Section title={t.sources}><SourceList ids={sourceIds} plain /></Section>}
    <div className="library-footlinks"><a href={github + '/blob/main/' + original}>{t.github}</a>
      <a href={downloadHref} download>{t.download}</a>
      <a href={github + '/issues/new?template=knowledge.yml&title=' + encodeURIComponent(entry.titleZh)}>{t.contribute}</a></div>
  </article>;
}

export function KnowledgeLibrary({ hash }: { hash: string }) {
  const { locale } = useLocale();
  const t = words[locale];
  const [, route, id] = hash.split('/');
  const kind = route === 'work' ? 'works' : route === 'person' ? 'people' : 'notes';
  const entry = route !== 'library' && id ? findEntry(kind, id) : undefined;
  const indexKind = id === 'people' || id === 'notes' ? id : 'works';
  useLayoutEffect(() => {
    const heading = document.getElementById('reading-main');
    heading?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [hash]);
  return <div className="reading-room">
    <ReaderHeader active="library" />
    <main className="reading-main" id="reading-main" tabIndex={-1}>
      {route !== 'library' && <nav className="library-back" aria-label={t.library}><a href={tabHref(kind)}>← {t.home}</a></nav>}
      {route === 'library' ? <Index key={indexKind} kind={indexKind} /> : entry ? <Entry entry={entry} /> : <h1>{t.none}</h1>}
    </main>
    <footer className="reading-footer">{route === 'library' && <a href={downloadHref} download>{t.download}</a>}<a href={github + '/tree/main/knowledge'}>{t.github}</a>
      <a href={github + '/issues/new?template=knowledge.yml'}>{t.contribute}</a>
      {!isReleaseBuild && <a href={github + '/issues/new?template=beta-feedback.yml'}>{t.beta} · {t.feedback}</a>}
      <p className="reading-colophon">碑帖之间 · {t.library} · {t.beta}</p></footer>
  </div>;
}
