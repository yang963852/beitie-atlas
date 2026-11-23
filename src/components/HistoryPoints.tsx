import { useState } from 'react';
import { getPlace } from '../domain/data';
import { compareDates, formatDate } from '../domain/dates';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';
import type { MapMarker } from '../map/types';
import { LocationOverview } from './LocationOverview';
import { SourceList } from './SourceList';

export function HistoryPoints({ object }: { object: ObjectRecord }) {
  const { locale, strings } = useLocale();
  const [selected, setSelected] = useState(0);
  const stops = [...object.provenanceEvents].sort((a,b) => compareDates(a.date,b.date)).flatMap(event => {
    const place = getPlace(event.placeId);
    if (!place?.coordinates || place.coordinates.crs !== 'WGS84') return [];
    return [{ event, place, coordinates: place.coordinates }];
  });
  const active = stops[selected];
  if (!active) return null;
  const markers = new Map<string, MapMarker>();
  for (const { place, coordinates } of stops) markers.set(place.id, {
    ...coordinates, placeId: place.id, label: place.names[locale], objectIds: [object.id],
    sublabel: strings.precisionLabels[coordinates.precision], provisional: coordinates.verification !== 'verified',
  });
  return <section className="history-points">
    <h2>{locale === 'zh' ? '流传地点' : 'Documented stops'}</h2>
    <div className="map map--fallback"><LocationOverview markers={[...markers.values()]} activePlaceId={active.place.id}
      onSelect={id => setSelected(stops.findIndex(s => s.place.id === id))} /></div>
    <label>{locale === 'zh' ? '可定位的事件' : 'Mapped events'} <select value={selected} onChange={e => setSelected(Number(e.target.value))}>
      {stops.map(({ event, place }, index) => <option value={index} key={event.id}>{formatDate(event.date,locale)} · {place.names[locale]}</option>)}
    </select></label>
    <p aria-live="polite">{locale === 'zh' ? active.event.summaryZh ?? active.event.summary : active.event.summary}</p>
    <small>{strings.precisionLabels[active.coordinates.precision]} · {strings.certaintyLabels[active.event.certainty]} · {active.coordinates.verification === 'verified' ? strings.coordinateVerified : strings.coordinateUnverified}</small>
    <SourceList ids={[...new Set([...active.event.sourceRefs,...active.coordinates.sourceRefs])]} compact />
  </section>;
}
