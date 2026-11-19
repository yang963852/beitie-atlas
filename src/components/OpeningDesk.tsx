import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getDataset, getObject, getPlace, getWork } from '../domain/data';
import { formatDate } from '../domain/dates';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';
import { buildMarkers } from '../map/markers';
import { MapPanel } from './MapPanel';
import { SourceList } from './SourceList';
import './opening-desk.css';

const deskRecords = ['stone-drums-original-set', 'witness-lanting', 'yan-qinli-original-stele']
  .flatMap(id => getObject(id) ?? []);

function RecordPreview({ object, close, read }: {
  object: ObjectRecord; close: () => void; read: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { locale, strings } = useLocale();
  const work = getWork(object.workId);
  const collection = object.currentCollection;
  const place = getPlace(collection.placeId);
  const { markers } = buildMarkers(getDataset().places, [object], locale);
  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog ref={dialog} className="desk-preview" aria-labelledby="desk-preview-title"
      onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="desk-preview__sheet">
        <button className="desk-preview__close" type="button" autoFocus onClick={close}
          aria-label={locale === 'zh' ? '关闭，返回书案' : 'Close and return to the desk'}>×</button>
        <p className="section__meta">{strings.objectTypeLabels[object.objectType]} · {formatDate(object.productionDate, locale)} · {object.review.state === 'draft' ? strings.reviewDraft : strings.reviewReviewed}</p>
        <h2 id="desk-preview-title">{object.titles[locale]}</h2>
        <p>{locale === 'zh' ? work?.backgroundZh ?? work?.background : work?.background}</p>
        <p><strong>{strings.locationKindLabels[collection.locationKind]}</strong>　{place?.names[locale] ?? strings.collectionNotStated}</p>
        {markers.length ? <MapPanel compact markers={markers} objects={[object]} originalsOnly={false}
          onOriginalsOnlyChange={() => {}} onOpenObject={read} /> : <p>{strings.noCoordinates}</p>}
        <SourceList ids={[...(work?.sourceRefs ?? []), ...collection.sourceRefs, ...(place?.coordinates?.sourceRefs ?? [])]} compact />
        <a href={'#/object/' + object.id} onClick={event => { event.preventDefault(); read(); }}>
          {locale === 'zh' ? '读完整记录与流传故事' : 'Read the full record and provenance'} →
        </a>
      </section>
    </dialog>
  );
}

export function OpeningDesk({ enter, open }: { enter: () => void; open: (id: string) => void }) {
  const { locale, strings } = useLocale();
  const [settled, setSettled] = useState(() => Boolean(window.location.hash) ||
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [object, setObject] = useState<ObjectRecord | null>(null);
  const index = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const finish = () => { if (media?.matches) setSettled(true); };
    media?.addEventListener('change', finish);
    return () => media?.removeEventListener('change', finish);
  }, []);
  return (
    <section className="desk" data-settled={settled} aria-labelledby="opening-title">
      {!settled && <button className="desk__skip" onClick={() => {
        setSettled(true);
        index.current?.querySelector('button')?.focus({ preventScroll: true });
      }}>{locale === 'zh' ? '跳过动画' : 'Skip animation'}</button>}
      <div className="desk__scroll">
        <div className="desk__paper">
          <div className="desk__ink" aria-hidden="true" />
          <div className="desk__copy">
            <h1 id="opening-title"><span>{strings.taglineLead}</span>{' '}<span>{strings.tagline}</span></h1>
            <p>{strings.taglineDetail}</p>
          </div>
          <div className="desk__index" ref={index} onFocus={() => setSettled(true)}
            onAnimationEnd={event => { if (event.target === event.currentTarget) setSettled(true); }}>
            <div className="desk__records">
              {deskRecords.map(record => <button key={record.id} onClick={() => setObject(record)}>
                <small>{strings.objectTypeLabels[record.objectType]}</small>
                <strong>{getWork(record.workId)?.titles[locale] ?? record.titles[locale]}</strong>
                <span aria-hidden="true">↗</span>
              </button>)}
            </div>
            <a href="#catalogue" onClick={event => { event.preventDefault(); enter(); }}>
              {strings.enterCatalogue}<span aria-hidden="true"> ↓</span>
            </a>
          </div>
        </div>
        <i className="desk__roller desk__roller--left" aria-hidden="true" />
        <i className="desk__roller desk__roller--right" aria-hidden="true" />
      </div>
      {object && <RecordPreview object={object} close={() => setObject(null)} read={() => {
        setObject(null); open(object.id);
      }} />}
    </section>
  );
}
