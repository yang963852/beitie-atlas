import { useEffect, useRef, useState } from 'react';
import journey from '../../data/yan-qinli-journey.json';
import { getPlace } from '../domain/data';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';
import { mapIsConfigured } from '../map/config';
import { createTiandituAdapter } from '../map/tianditu';
import { watchTiles } from '../map/tiles';
import type { MapAdapter, MapMarker } from '../map/types';
import { SourceList } from './SourceList';

const points: MapMarker[] = journey.landmarks.flatMap((landmark) => {
  const point = landmark.placeId ? getPlace(landmark.placeId)?.coordinates : landmark;
  if (point?.longitude == null || point.latitude == null) return [];
  return [{ placeId: landmark.id, longitude: point.longitude, latitude: point.latitude,
    label: landmark.zh, sublabel: landmark.en, provisional: true, precision: 'site', objectIds: [] }];
});

export function JourneyMap({ object, active, onClose }: {
  object: ObjectRecord; active: boolean; onClose: () => void;
}) {
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasTiles, setHasTiles] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const adapter = useRef<MapAdapter | null>(null);
  const steps = journey.steps.flatMap(step => {
    const event = object.provenanceEvents.find(item => item.id === step.event);
    const landmark = journey.landmarks.find(item => item.id === step.landmark);
    return event && landmark ? [{ ...step, event, landmark }] : [];
  });
  const step = steps[index];
  const stepRef = useRef(steps);
  stepRef.current = steps;
  const chooseLandmark = (id: string) => setIndex(current => {
    const list = stepRef.current;
    if (list[current]?.landmark.id === id) return current;
    const next = list.findIndex(item => item.landmark.id === id);
    return next < 0 ? current : next;
  });
  useEffect(() => {
    const container = canvas.current;
    if (!active || !mapIsConfigured || !container) return;
    let cancelled = false;
    const map = createTiandituAdapter();
    const tiles = watchTiles(container, blocked => setHasTiles(!blocked), 4000, () => setHasTiles(true));
    adapter.current = map;
    setHasTiles(false);
    map.mount(container, points, { onMarkerClick: chooseLandmark }).then(() => {
      if (!cancelled) { setReady(true); tiles.start(); }
    }).catch(() => { if (!cancelled) setHasTiles(false); });
    return () => {
      cancelled = true;
      tiles.stop(); map.destroy(); adapter.current = null; setReady(false);
    };
  }, [active]);

  useEffect(() => {
    if (ready && step) adapter.current?.focus(step.landmark.id, 15);
  }, [ready, step?.landmark.id]);

  if (!step) return null;
  const { landmark, event } = step;
  const live = ready && hasTiles;
  const xs = points.map(p => p.longitude), ys = points.map(p => p.latitude);
  return (
    <section id="map" tabIndex={-1} className="pane pane--map journey" aria-labelledby="journey-heading">
      <header><button className="link-button" onClick={onClose}>{zh ? '← 现藏分布' : '← Collection map'}</button>
        <h2 id="journey-heading">{zh ? '颜勤礼碑 · 原石流传' : 'The journey of the Yan Qinli stone'}</h2>
        <p>{zh ? '西安 · 1922–1948　点选时间轴，循地读碑。' : 'Xi’an · 1922–1948. Select a stop to explore the stone’s journey.'}</p>
      </header>
      <ol className="journey-rail" aria-label={zh ? '流传时间轴' : 'Journey timeline'}>
        {steps.map((item, i) => <li key={item.event.id}><button type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
          <small>{zh ? item.event.date.original : item.dateEn}</small><strong>{item[locale]}</strong>
        </button></li>)}
      </ol>
      <div className="journey-map">
        <div ref={canvas} style={{ visibility: live ? 'visible' : 'hidden' }} className="map__canvas" aria-hidden="true" />
        {!live && <div className="journey-grid" aria-label={zh ? '西安地标方位图' : 'Xi’an landmark map'}>
          <small>{zh ? '西安 · 地标方位　北 ↑' : 'Xi’an · Landmarks　N ↑'}</small>
          {points.map(point => {
            const x = (point.longitude - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs));
            const y = (Math.max(...ys) - point.latitude) / (Math.max(...ys) - Math.min(...ys));
            return <button key={point.placeId} style={{ left: (22 + 55*x)+'%', top: (28 + 46*y)+'%' }}
              aria-pressed={point.placeId === landmark.id} onClick={() => chooseLandmark(point.placeId)}>
              {zh ? point.label : point.sublabel}</button>;
          })}
        </div>}
      </div>
      <div aria-live="polite" className="journey-stop">
        <small>{zh ? '地图参照' : 'Map landmark'} · {landmark[locale]}</small>
        <h3>{zh ? event.date.original : step.dateEn} · {zh ? event.placeWording : step.en}</h3>
        <p>{zh ? event.summaryZh ?? event.summary : event.summary}</p>
        <p>{zh ? landmark.noteZh : landmark.noteEn}</p>
      </div>
      <p className="section__meta">{zh ? '图钉为现代参照地标。各次移碑的精确位置与行经路线未详。' : 'Pins mark modern landmarks. Exact historical positions and transport routes remain unknown.'}</p>
      <SourceList ids={event.sourceRefs} compact />
      <a href={landmark.source} target="_blank" rel="noreferrer">{zh ? '参照位置来源' : 'Landmark coordinate source'} · {landmark.credit}</a>
      {live && <p className="section__meta">{strings.mapAttributionText}</p>}
    </section>
  );
}
