import { useEffect, useRef, useState } from 'react';
import { getPlace } from '../domain/data';
import { compareDates, formatDate } from '../domain/dates';
import type { ObjectRecord, Place, ProvenanceEvent } from '../domain/types';
import { useLocale } from '../i18n';
import { mapIsConfigured } from '../map/config';
import { createTiandituAdapter } from '../map/tianditu';
import { watchTiles } from '../map/tiles';
import type { MapAdapter, MapMarker } from '../map/types';
import { SourceList } from './SourceList';

/**
 * The journey map reads the same events and place records as the text
 * timeline. A reference landmark is deliberately separate from the event's
 * historical place: it orients the reader without asserting a find-spot.
 */
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

  const ordered = [...object.provenanceEvents]
    .filter((event) => Boolean(event.referencePlaceId))
    .sort((a, b) => compareDates(a.date, b.date));
  const landmarks = new Map<string, Place>();
  const points: MapMarker[] = [];
  for (const event of ordered) {
    const place = getPlace(event.referencePlaceId ?? null);
    if (!place?.coordinates || landmarks.has(place.id)) continue;
    landmarks.set(place.id, place);
    points.push({
      placeId: place.id,
      longitude: place.coordinates.longitude,
      latitude: place.coordinates.latitude,
      label: place.names.zh,
      sublabel: place.names.en,
      provisional: true,
      precision: 'site',
      objectIds: [],
    });
  }
  const steps = ordered.filter((event) => landmarks.has(event.referencePlaceId ?? ''));
  const step = steps[index];
  const landmark = step ? landmarks.get(step.referencePlaceId ?? '') : undefined;
  const stepRef = useRef(steps);
  stepRef.current = steps;
  const chooseLandmark = (id: string) => setIndex(current => {
    const list = stepRef.current;
    if (list[current]?.referencePlaceId === id) return current;
    const next = list.findIndex(item => item.referencePlaceId === id);
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
    if (ready && step && landmark) adapter.current?.focus(landmark.id, 15);
  }, [ready, step?.referencePlaceId, landmark?.id]);

  if (!step || !landmark) return null;
  const live = ready && hasTiles;
  const xs = points.map(p => p.longitude), ys = points.map(p => p.latitude);
  const label = (event: ProvenanceEvent) => zh
    ? event.shortLabelZh ?? strings.eventTypeLabels[event.type]
    : event.shortLabel ?? strings.eventTypeLabels[event.type];
  const note = (event: ProvenanceEvent) => zh
    ? event.referenceNoteZh ?? landmark?.notesZh?.[0]
    : event.referenceNote ?? landmark?.notes?.[0];
  return (
    <section id="map" tabIndex={-1} className="pane pane--map journey" aria-labelledby="journey-heading">
      <header><button className="link-button" onClick={onClose}>{zh ? '← 现藏分布' : '← Collection map'}</button>
        <h2 id="journey-heading">{zh ? object.titles.zh + ' · 原石流传' : object.titles.en + ' · journey'}</h2>
        <p>{zh ? '点选时间轴，循同一条事件记录读碑。' : 'Select a stop; the rail and the text timeline read the same events.'}</p>
      </header>
      <ol className="journey-rail" aria-label={zh ? '流传时间轴' : 'Journey timeline'}>
        {steps.map((item, i) => <li key={item.id}><button type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>
          <small>{formatDate(item.date, locale)}</small><strong>{label(item)}</strong>
        </button></li>)}
      </ol>
      <div className="journey-map">
        <div ref={canvas} style={{ visibility: live ? 'visible' : 'hidden' }} className="map__canvas" aria-hidden="true" />
        {!live && <div className="journey-grid" aria-label={zh ? '西安地标方位图' : 'Xi’an landmark map'}>
          <small>{zh ? '西安 · 参照地标方位　北 ↑' : 'Xi’an · reference landmarks　N ↑'}</small>
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
        <small>{zh ? '参照地标' : 'Reference landmark'} · {zh ? landmark.names.zh : landmark.names.en}</small>
        <h3>{formatDate(step.date, locale)} · {zh ? step.placeWording ?? landmark.names.zh : step.placeWording ?? landmark.names.en}</h3>
        <p>{zh ? step.summaryZh ?? step.summary : step.summary}</p>
        {note(step) ? <p>{note(step)}</p> : null}
      </div>
      <p className="section__meta">{zh ? '图钉为现代参照地标，不是各次移碑的实测位置；行经路线未详。' : 'Pins mark modern reference landmarks, not surveyed positions or transport routes.'}</p>
      <SourceList ids={[...new Set([...step.sourceRefs, ...landmark.sourceRefs])]} compact />
      {live && <p className="section__meta">{strings.mapAttributionText}</p>}
    </section>
  );
}
