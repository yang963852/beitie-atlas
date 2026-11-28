import { type MouseEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isReleaseBuild } from '../domain/build';
import { getDataset, getObject, getPlace } from '../domain/data';
import { findEntry, libraryEntries, matchesQuery, type LibraryEntry } from '../domain/library';
import { knowledgeArticles } from '../domain/knowledge';
import { DYNASTIES, findDynasty } from '../domain/dynasties';
import { formatDate } from '../domain/dates';
import { formatAttribution } from '../domain/attribution';
import type { ObjectRecord } from '../domain/types';
import { useLocale, type Locale } from '../i18n';
import { zhStrings } from '../i18n/zh';
import { enStrings } from '../i18n/en';
import { buildMarkers } from '../map/markers';
import { ReaderHeader } from './ReaderHeader';
import { CollectionAtlas } from './CollectionAtlas';
import { HistoryPoints } from './HistoryPoints';
import { MapPanel } from './MapPanel';
import { KnowledgeProse } from './KnowledgeProse';
import { ProvenanceEvents } from './ProvenanceEvents';
import { ClaimSection } from './ClaimSection';
import { SourceList } from './SourceList';
import { copyingNotesFor, copyingPeopleFor, WorkCopyingEntry } from './WorkCopyingEntry';
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
function metaLine(entry: LibraryEntry, locale: Locale) {
  const dynasty = period(entry)?.[locale];
  const date = dateLine(entry, locale);
  if (!dynasty) return date;
  return date === dynasty ? dynasty : `${dynasty} · ${date}`;
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
function yearText(year: number) {
  return year < 0 ? `前${-year}` : String(year);
}
function rangeText(dynasty: ReturnType<typeof period>) {
  if (!dynasty) return '';
  return `${yearText(dynasty.startYear)}–${dynasty.endYear == null ? '' : yearText(dynasty.endYear)}`;
}
function shortDate(entry: LibraryEntry, locale: Locale) {
  const zh = locale === 'zh';
  if (entry.work) {
    const date = entry.work.compositionDate;
    const base = date.startYear == null
      ? (date.kind === 'era' && date.eraLabel ? date.eraLabel : (zh ? '年代待考' : 'Date unknown'))
      : formatDate(date, locale);
    const meaning = date.meaning && date.meaning !== 'composition'
      ? (zh ? zhStrings.dateMeaningLabels[date.meaning] : enStrings.dateMeaningLabels[date.meaning])
      : null;
    return meaning ? `${base} · ${meaning}` : base;
  }
  const year = entry.guide?.timelineYear;
  if (year == null) return zh ? '年代待考' : 'Date unknown';
  return zh ? `${year}年` : String(year);
}
const ordinalById = new Map(ordered.map((entry, index) => [entry.id, index + 1]));
function isSurvivingStone(object: ObjectRecord | undefined) {
  return Boolean(object && object.survivalStatus === 'surviving' &&
    (object.objectType === 'original-stele' || object.objectType === 'cliff-inscription'));
}
const objectsById = new Map(dataset.objects.map(object => [object.id, object]));
const survivingStoneWorkIds = new Set(dataset.objects.filter(isSurvivingStone).map(object => object.workId));
for (const entry of works) {
  if (entry.guide?.objects.some(id => isSurvivingStone(objectsById.get(id)))) survivingStoneWorkIds.add(entry.id);
}

function ReadingDesk({ entry, ordinal, total, openCard }: {
  entry: LibraryEntry;
  ordinal: number;
  total: number;
  openCard: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  const labels = zh ? zhStrings : enStrings;
  const witnesses = witnessesFor(entry);
  const types = [...new Set(witnesses.map(object => labels.objectTypeLabels[object.objectType]))];
  const witnessText = witnesses.length
    ? (zh
      ? `收录实物 ${witnesses.length} 件 · ${types.join('、')}`
      : `${witnesses.length} catalogued witness${witnesses.length === 1 ? '' : 'es'} · ${types.join(', ')}`)
    : (zh ? '尚未收录实物' : 'No catalogued witness');
  return <section className="reading-desk" aria-labelledby="reading-desk-title">
    <div className="reading-desk__head">
      <h2 id="reading-desk-title">{zh ? '案头' : 'On the desk'}</h2>
      <p>{zh ? '指向或聚焦签条，案上换读' : 'Point at or focus a slip to lay it on the desk'}</p>
      <span className="reading-desk__index">{ordinal} / {total}</span>
    </div>
    <div className="reading-desk__leaf">
      <span className="reading-desk__seal" aria-hidden="true">{zh ? '读' : 'R'}</span>
      <div className="reading-desk__body">
        <p className="reading-desk__meta">{metaLine(entry, locale)}</p>
        <h3><a href={'#/folio/' + entry.id} onClick={openCard}>
          <span className="reading-desk__title">{title(entry, locale)}</span>
          <span className="reading-desk__open" aria-hidden="true">{zh ? '展读 →' : 'Open →'}</span>
        </a></h3>
        <p className="reading-desk__byline">{byline(entry, locale, strings.attributionRoleShort)}</p>
        <p className="reading-desk__witness">{witnessText}</p>
      </div>
    </div>
  </section>;
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
      <div className="folio__bar"><span>{metaLine(entry,locale)}</span>
        <button ref={closeRef} type="button" onClick={close} aria-label={zh ? '关闭阅读卡片' : 'Close reading card'}>×</button></div>
      <h2 id="folio-title">{title(entry,locale)}</h2>
      <p className="folio__byline">{byline(entry,locale,strings.attributionRoleShort)}</p>
      <WorkCopyingEntry
        objects={witnesses}
        notes={copyingNotesFor(entry.id, knowledgeArticles)}
        people={copyingPeopleFor(entry)}
        onOpenObject={(objectId) => {
          window.history.pushState({ fromFolio: entry.id }, '', '#/transmission/' + objectId);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }}
      />
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
      {(entry.guide?.state ?? entry.work?.review.state) === 'draft' ? <p className="folio__status">{strings.reviewDraft}</p> : null}
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
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  const [query,setQuery] = useState('');
  const [jump,setJump] = useState('');
  const [peek,setPeek] = useState<string | null>(null);
  const [activePeriod,setActivePeriod] = useState('');
  const rail = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
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
  const firstVisible = groups.values().next().value?.[0];
  const visibleIndex = new Map<string, number>();
  for (const items of groups.values()) {
    for (const item of items) visibleIndex.set(item.id, visibleIndex.size);
  }
  const peekEntry = peek ? findEntry('works', peek) : undefined;
  const deskEntry = peekEntry && matchesQuery(peekEntry, query) ? peekEntry : firstVisible;
  const firstPeriod = groups.keys().next().value ?? '';
  const activeId = activePeriod && groups.has(activePeriod) ? activePeriod : firstPeriod;
  useLayoutEffect(() => {
    if (hash === '#catalogue') {
      if (lastCard.current?.isConnected) lastCard.current.focus();
      else main.current?.focus({preventScroll:true});
    }
  },[hash]);
  useEffect(() => { if (hash === '#catalogue' && !lastCard.current) main.current?.scrollIntoView?.({block:'start'}); },[hash]);
  useEffect(() => {
    const railElement = rail.current;
    if (!railElement) return;
    let frameId = 0;
    const measure = () => {
      const max = railElement.scrollWidth - railElement.clientWidth;
      if (max <= 0) return;
      frame.current?.style.setProperty('--scroll-progress', String(Math.min(1, Math.max(0, railElement.scrollLeft / max))));
      const railBox = railElement.getBoundingClientRect();
      const edge = railBox.left + 72;
      let current = '';
      for (const section of railElement.querySelectorAll<HTMLElement>('.atlas-period')) {
        if (section.getBoundingClientRect().right > edge) {
          current = section.id.replace('period-', '');
          break;
        }
      }
      if (current) setActivePeriod(previous => previous === current ? previous : current);
    };
    const onScroll = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => { frameId = 0; measure(); });
    };
    measure();
    railElement.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      railElement.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [query, hash]);
  useEffect(() => {
    const nav = ruler.current;
    if (!nav || !activeId || !nav.scrollTo) return;
    const button = nav.querySelector<HTMLElement>(`[data-period="${activeId}"]`);
    if (!button) return;
    const navBox = nav.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    if (buttonBox.left < navBox.left) nav.scrollTo({ left: nav.scrollLeft + buttonBox.left - navBox.left - 6, behavior: 'instant' });
    else if (buttonBox.right > navBox.right) nav.scrollTo({ left: nav.scrollLeft + buttonBox.right - navBox.right + 6, behavior: 'instant' });
  }, [activeId]);
  function goPeriod(id: string) {
    setJump(id);
    setActivePeriod(id);
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
  return <div className="atlas-reader">
  <ReaderHeader active={hash === '#/collections' ? 'collections' : 'catalogue'} />
  {hash === '#/collections' && <CollectionAtlas />}
  <main ref={main} id="chronology" tabIndex={-1} hidden={Boolean(object) || hash === '#/collections'} className="atlas-time">
    <div className="atlas-time__intro"><div><h1>{zh ? '碑帖长卷' : 'The long scroll of steles and modelbooks'}</h1>
      <p>{zh ? '循年代展开手卷，再随一件原石、拓本或墨迹，读它的流传。' : 'Unroll the works in time, then follow a surviving stone, rubbing or manuscript.'}</p></div>
    </div>
    <div className="atlas-toolbar"><span>{zh ? '收录作品' : 'Works'} <b>{ordered.length}</b></span>
      <div className="atlas-tools"><label className="atlas-tools__jump">{zh ? '跳至时代' : 'Jump to period'}<select value={jump} onChange={e => goPeriod(e.target.value)}>
        <option value="">{zh ? '选择时代' : 'Select a period'}</option>
        {[...groups].map(([id,items]) => <option key={id} value={id}>{period(items[0])?.[locale] ?? strings.dynastyUnknown}</option>)}</select></label>
        <input type="search" aria-label={strings.searchLabel} placeholder={zh ? '搜索作品或书家' : 'Find a work or calligrapher'} value={query} onChange={e => {setQuery(e.target.value);setJump('');rail.current?.scrollTo?.({left:0});}} /></div>
    </div>
    {!!groups.size && <nav ref={ruler} className="scroll-ruler" aria-label={zh ? '朝代标尺' : 'Period ruler'}>
      {[...groups].map(([id,items]) => {
        const dynasty = period(items[0]);
        return <button key={id} data-period={id} type="button" className="scroll-ruler__period" aria-pressed={activeId === id} onClick={() => goPeriod(id)}>
          <span>{dynasty?.[locale] ?? strings.dynastyUnknown}</span>
          {dynasty ? <small>{rangeText(dynasty)}</small> : null}
        </button>;
      })}
    </nav>}
    {(selected && !entry || objectId && !object) && <p role="status">{zh ? '未找到这条记录。可从长卷重新选择。' : 'Record unavailable. Select a work from the scroll.'}</p>}
    <div className="scroll-frame" ref={frame}>
    <div className="atlas-rail" ref={rail} tabIndex={0} aria-label={zh ? '作品长卷' : 'Works in chronological order'}>
      {[...groups].map(([id,items]) => <section id={'period-'+id} key={id} className="atlas-period">
        <h2>{period(items[0])?.[locale] ?? strings.dynastyUnknown}</h2>
        <ul>{items.map(item => {
          const hand = byline(item, locale, strings.attributionRoleShort);
          const position = visibleIndex.get(item.id) ?? 0;
          return <li key={item.id} data-bank={position % 2 ? 'lower' : 'upper'}>
            <a href={'#/folio/'+item.id} className="atlas-card" onClick={openCard}
              onMouseEnter={() => setPeek(item.id)} onFocus={() => setPeek(item.id)}
              data-on-desk={deskEntry?.id === item.id ? 'true' : undefined}
              style={{ animationDelay: `${position % 14 * 22}ms` }}>
              <span className="atlas-card__top">
                <span className="atlas-card__date">{shortDate(item, locale)}</span>
                {survivingStoneWorkIds.has(item.id) ? <span className="atlas-card__stone" title={zh ? '收录原石存世' : 'Catalogued original stone survives'}>
                  <span aria-hidden="true">石</span><span className="visually-hidden">{zh ? '（收录原石存世）' : ' (original stone survives)'}</span>
                </span> : null}
              </span>
              <h3>{title(item,locale)}</h3>
              {hand ? <span className="atlas-card__hand">{hand}</span> : null}
            </a></li>;
        })}</ul>
      </section>)}
    </div>
    <span className="scroll-frame__roll scroll-frame__roll--start" aria-hidden="true" />
    <span className="scroll-frame__roll scroll-frame__roll--end" aria-hidden="true" />
    <span className="scroll-frame__progress" aria-hidden="true" />
    </div>
    {!groups.size && <p role="status">{strings.noResults} <button onClick={() => setQuery('')}>{strings.clearSearch}</button></p>}
    {!!groups.size && <div className="atlas-controls"><span>{zh ? '由古及今' : 'Earlier to later'}</span>
      <button aria-label={zh ? '向前翻阅' : 'Scroll earlier'} onClick={() => rail.current?.scrollBy({left:-rail.current.clientWidth*.8})}>←</button>
      <button aria-label={zh ? '向后翻阅' : 'Scroll later'} onClick={() => rail.current?.scrollBy({left:rail.current.clientWidth*.8})}>→</button></div>}
    {deskEntry && <ReadingDesk entry={deskEntry} ordinal={ordinalById.get(deskEntry.id) ?? 0} total={ordered.length} openCard={openCard} />}
  </main>
  {object && <Transmission object={object} />}
  {entry && <WorkFolio key={entry.id} entry={entry} close={close} />}
  </div>;
}
