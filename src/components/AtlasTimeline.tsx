import { type MouseEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isReleaseBuild } from '../domain/build';
import { getDataset, getObject, getPlace } from '../domain/data';
import { findEntry, libraryEntries, matchesQuery, type LibraryEntry } from '../domain/library';
import { DYNASTIES, findDynasty } from '../domain/dynasties';
import { formatDate } from '../domain/dates';
import { formatAttribution } from '../domain/attribution';
import type { ObjectRecord } from '../domain/types';
import { useLocale, type Locale } from '../i18n';
import { zhStrings } from '../i18n/zh';
import { enStrings } from '../i18n/en';
import { buildMarkers } from '../map/markers';
import { InkRiver } from './InkRiver';
import { CollectionAtlas } from './CollectionAtlas';
import { HistoryPoints } from './HistoryPoints';
import { MapPanel } from './MapPanel';
import { KnowledgeProse } from './KnowledgeProse';
import { ProvenanceEvents } from './ProvenanceEvents';
import { ClaimSection } from './ClaimSection';
import { SourceList } from './SourceList';
import './atlas-timeline.css';

const localMedia = import.meta.glob<string>('../assets/*.webp', { eager: true, query: '?url', import: 'default' });

const dataset = getDataset();
const works = libraryEntries.filter(entry => entry.kind === 'works');
function period(entry: LibraryEntry) {
  if (entry.work) return findDynasty(entry.work.dynastyId);
  const year = entry.guide?.timelineYear;
  return year == null ? undefined : DYNASTIES.find(d => d.startYear <= year && (d.endYear == null || year <= d.endYear));
}
const ordered = [...works].sort((a,b) =>
  (period(a)?.order ?? Infinity) - (period(b)?.order ?? Infinity) ||
  (a.work?.compositionDate.startYear ?? a.guide?.timelineYear ?? Infinity) -
  (b.work?.compositionDate.startYear ?? b.guide?.timelineYear ?? Infinity) ||
  a.titleZh.localeCompare(b.titleZh,'zh-Hans'));
function dateLine(entry: LibraryEntry, locale: Locale) {
  if (entry.work) {
    const date = entry.work.compositionDate;
    const base = date.kind === 'era' && date.startYear == null && date.eraLabel && locale === 'zh'
      ? date.original ?? date.eraLabel
      : formatDate(date, locale);
    return date.meaning
      ? base + ' · ' + (locale === 'zh' ? zhStrings.dateMeaningLabels[date.meaning] : enStrings.dateMeaningLabels[date.meaning])
      : base;
  }
  return entry.guide?.timelineYear?.toString() ?? (locale === 'zh' ? '年代待考' : 'Date unknown');
}
function witnessesFor(entry: LibraryEntry) {
  return dataset.objects.filter(o => o.workId === entry.id || entry.guide?.objects.includes(o.id));
}
function title(entry: LibraryEntry, locale: Locale) {
  return locale === 'zh' ? entry.titleZh : entry.titleEn;
}
function holding(object: ObjectRecord, locale: Locale) {
  const place = getPlace(object.currentCollection.placeId);
  if (!place || object.currentCollection.locationKind === 'unknown') return locale === 'zh' ? '地点待考' : 'Location unknown';
  const name = place.names[locale];
  return object.currentCollection.locationKind === 'last-known'
    ? (locale === 'zh' ? '最后见于 ' : 'Last known at ') + name : name;
}
function byline(entry: LibraryEntry, locale: Locale, labels: Parameters<typeof formatAttribution>[2]) {
  return entry.work ? formatAttribution(entry.work.attribution,locale,labels) :
    entry.guide?.people.map(id => findEntry('people',id)).filter((p): p is LibraryEntry => Boolean(p)).map(p => title(p,locale)).join(' · ');
}

function WorkFolio({ entry, close }: { entry: LibraryEntry; close: () => void }) {
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const d = dialog.current!;
    d.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { d.close(); document.body.style.overflow = oldOverflow; };
  }, []);
  const witnesses = witnessesFor(entry);
  return <dialog ref={dialog} className="folio" aria-labelledby="folio-title"
    onCancel={e => {e.preventDefault(); close();}}
    onClick={e => {if (e.target === dialog.current) close();}}>
    <div className="folio__page">
      <div className="folio__bar"><span>{period(entry)?.[locale]} · {dateLine(entry,locale)}</span>
        <button ref={closeRef} type="button" onClick={close} aria-label={zh ? '关闭阅读卡片' : 'Close reading card'}>×</button></div>
      <h2 id="folio-title">{title(entry,locale)}</h2>
      <p className="folio__byline">{byline(entry,locale,strings.attributionRoleShort)}</p>
      {dataset.media.filter(media => witnesses.some(object => object.id === media.objectId)).map(media => {
        const url = localMedia[media.assetPathOrUrl.replace(/^src\//, '../')];
        if (!url) return null;
        const witness = witnesses.find(object => object.id === media.objectId)!;
        return <figure key={media.id}><img src={url} alt={witness.titles[locale]} />
          <figcaption>{witness.titles[locale]} · <a href={media.rightsEvidence}>{media.credit}</a></figcaption></figure>;
      })}
      <h3>{zh ? '实物与流传' : 'Witnesses and transmission'}</h3>
      {witnesses.length ? <ul className="folio__witnesses">{witnesses.map(o => <li key={o.id}>
        <a className="folio-witness" href={'#/transmission/'+o.id} onClick={e => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          window.history.pushState({fromFolio:entry.id},'',e.currentTarget.hash);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }}>
          <strong>{o.titles[locale]}</strong>
          <small>{formatDate(o.productionDate,locale)} · {holding(o,locale)}</small>
          <span>{zh ? '查看地图与流传' : 'Map and transmission'}</span>
        </a>
      </li>)}</ul> : <p>{zh ? '本项目尚未收录可定位的具体实物。' : 'No physical witness is catalogued for this work yet.'}</p>}
      {entry.guide ? <KnowledgeProse guide={entry.guide} /> : <p className="folio__prose">{zh ? entry.work?.backgroundZh ?? entry.work?.background : entry.work?.background}</p>}
      <p className="folio__status">{(entry.guide?.state ?? entry.work?.review.state) === 'draft' ? strings.reviewDraft : strings.reviewReviewed}</p>
      <SourceList ids={[...new Set([...(entry.work?.sourceRefs ?? []),...(entry.guide?.sources ?? [])])]} compact />
      <a href={'#/work/'+entry.id}>{zh ? '阅读完整条目' : 'Read the full entry'}</a>
    </div>
  </dialog>;
}

function Transmission({ object }: { object: ObjectRecord }) {
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  const objects = useMemo(() => [object],[object]);
  const markers = useMemo(() => buildMarkers(dataset.places,objects,locale).markers,[objects,locale]);
  const heading = useRef<HTMLHeadingElement>(null);
  const page = useRef<HTMLElement>(null);
  useLayoutEffect(() => {heading.current?.focus({preventScroll:true}); page.current?.scrollIntoView?.({block:'start'});},[object.id]);
  return <main className="atlas-journey" ref={page}>
    <a href={'#/folio/'+object.workId} onClick={e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || window.history.state?.fromFolio !== object.workId) return;
      e.preventDefault(); window.history.back();
    }}>{zh ? '← 返回阅读卡片' : '← Back to reading card'}</a>
    <p className="atlas-kicker">{strings.objectTypeLabels[object.objectType]} · {zh ? '流传' : 'Transmission'}</p>
    <h1 ref={heading} tabIndex={-1}>{object.titles[locale]}</h1>
    <p className="atlas-journey__place">{strings.locationKindLabels[object.currentCollection.locationKind]} · {holding(object,locale)}</p>
    <a href={'#/object/'+object.id}>{zh ? '查看实物档案' : 'Open witness record'}</a>
    <div className="atlas-journey__columns"><div className="atlas-journey__map">
      {markers.length ? <MapPanel markers={markers} objects={objects} originalsOnly={false} selectedPlaceId={markers[0].placeId}
        onOpenObject={id => {window.location.hash='/object/'+id;}} /> :
        <section className="atlas-no-point"><h2>{zh ? '位置待考' : 'Location unresolved'}</h2>
          <p>{zh ? '现有记录不足以标注现藏位置。' : 'The record does not establish a mappable current location.'}</p>
          <SourceList ids={object.currentCollection.sourceRefs} compact /></section>}
      {object.id === 'yan-qinli-original-stele' && !isReleaseBuild && <a href="#/object/yan-qinli-original-stele/journey">{zh ? '循西安地标读原石流传 →' : 'Follow the stone through Xi’an →'}</a>}
    </div><div className="atlas-journey__story"><HistoryPoints key={object.id} object={object} /><ProvenanceEvents object={object} /><ClaimSection claims={object.claims} /></div></div>
  </main>;
}

export function AtlasTimeline({ hash }: { hash: string }) {
  const { locale, setLocale, strings } = useLocale();
  const zh = locale === 'zh';
  const [query,setQuery] = useState('');
  const [jump,setJump] = useState('');
  const rail = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
  const lastCard = useRef<HTMLAnchorElement | null>(null);
  const selected = /^#\/folio\/([a-z0-9-]+)$/.exec(hash)?.[1];
  const objectId = /^#\/transmission\/([a-z0-9-]+)$/.exec(hash)?.[1];
  const entry = selected ? findEntry('works',selected) : undefined;
  const object = objectId ? getObject(objectId) : undefined;
  const groups = new Map<string,LibraryEntry[]>();
  for (const item of ordered) {
    if (!matchesQuery(item,query)) continue;
    const key = period(item)?.id ?? 'unknown';
    const group = groups.get(key) ?? [];
    group.push(item); groups.set(key,group);
  }
  useLayoutEffect(() => {
    if (hash === '#catalogue') {
      if (lastCard.current?.isConnected) lastCard.current.focus();
      else main.current?.focus({preventScroll:true});
    }
  },[hash]);
  useEffect(() => { if (hash === '#catalogue' && !lastCard.current) main.current?.scrollIntoView?.({block:'start'}); },[hash]);
  function goPeriod(id: string) {
    setJump(id);
    document.getElementById('period-'+id)?.scrollIntoView({block:'nearest',inline:'start',behavior:'instant'});
  }
  function openCard(e: MouseEvent<HTMLAnchorElement>) {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    lastCard.current = e.currentTarget;
    window.history.pushState({fromTimeline:true},'',e.currentTarget.hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
  function close() {
    if (lastCard.current && window.history.state?.fromTimeline) window.history.back();
    else window.location.replace('#catalogue');
  }
  return <div className="atlas-reader"><header className="atlas-mast">
    <a href="#" className="atlas-brand"><span className="atlas-seal" aria-hidden="true">碑</span>{strings.siteTitleZh}<small>Between Steles</small></a>
    <button type="button" onClick={() => setLocale(zh ? 'en' : 'zh')}>{zh ? 'EN' : '中文'}</button>
  </header>
  <nav className="reader-sections" aria-label={strings.sectionsLabel}>
    <a href="#catalogue" aria-current={hash !== '#/collections' ? 'page' : undefined}>{zh ? '年代长河' : 'Chronology'}</a>
    <a href="#/collections" aria-current={hash === '#/collections' ? 'page' : undefined}>{zh ? '馆藏地图' : 'Collection map'}</a>
    <a href="#/library">{zh ? '知识库' : 'Library'}</a>
  </nav>
  {hash === '#/collections' && <CollectionAtlas />}
  <main ref={main} id="catalogue" tabIndex={-1} hidden={Boolean(object) || hash === '#/collections'} className="atlas-time">
    <div className="atlas-time__intro"><div><h1>{zh ? '碑帖时间轴' : 'A chronology of calligraphy'}</h1>
      <p>{zh ? '循年代展读作品，再随一件原石、拓本或墨迹，读它的流传。' : 'Read works in time, then follow a surviving stone, rubbing or manuscript.'}</p></div>
    </div>
    <div className="atlas-toolbar"><span>{zh ? '收录作品' : 'Works'} <b>{ordered.length}</b></span>
      <div className="atlas-tools"><label>{zh ? '跳至时代' : 'Jump to period'}<select value={jump} onChange={e => goPeriod(e.target.value)}>
        <option value="">{zh ? '选择时代' : 'Select a period'}</option>
        {[...groups].map(([id,items]) => <option key={id} value={id}>{period(items[0])?.[locale] ?? strings.dynastyUnknown}</option>)}</select></label>
        <input type="search" aria-label={strings.searchLabel} placeholder={zh ? '搜索作品或书家' : 'Find a work or calligrapher'} value={query} onChange={e => {setQuery(e.target.value);setJump('');rail.current?.scrollTo?.({left:0});}} /></div>
    </div>
    {(selected && !entry || objectId && !object) && <p role="status">{zh ? '未找到这条记录。可从时间轴重新选择。' : 'Record unavailable. Select a work from the timeline.'}</p>}
    <div className="river-reach">{!!groups.size && hash === '#catalogue' && <InkRiver />}
    <div className="atlas-rail" ref={rail} tabIndex={0} aria-label={zh ? '作品时间轴' : 'Works in chronological order'}>
      {[...groups].map(([id,items]) => <section id={'period-'+id} key={id} className="atlas-period">
        <h2>{period(items[0])?.[locale] ?? strings.dynastyUnknown}</h2>
        <ul>{items.map(item => <li key={item.id} data-bank={ordered.indexOf(item) % 2 ? 'lower' : 'upper'}>
          <a href={'#/folio/'+item.id} className="atlas-card" onClick={openCard}>
            <span className="atlas-date">{dateLine(item,locale)}</span>
            <h3>{title(item,locale)}</h3>
            <span className="atlas-hand">{byline(item,locale,strings.attributionRoleShort)}</span>
          </a></li>)}</ul>
      </section>)}
    </div></div>
    {!groups.size && <p role="status">{strings.noResults} <button onClick={() => setQuery('')}>{strings.clearSearch}</button></p>}
    {!!groups.size && <div className="atlas-controls"><span>{zh ? '由古及今' : 'Earlier to later'}</span>
      <button aria-label={zh ? '向前翻阅' : 'Scroll earlier'} onClick={() => rail.current?.scrollBy({left:-rail.current.clientWidth*.8})}>←</button>
      <button aria-label={zh ? '向后翻阅' : 'Scroll later'} onClick={() => rail.current?.scrollBy({left:rail.current.clientWidth*.8})}>→</button></div>}
  </main>
  {object && <Transmission object={object} />}
  {entry && <WorkFolio key={entry.id} entry={entry} close={close} />}
  </div>;
}
