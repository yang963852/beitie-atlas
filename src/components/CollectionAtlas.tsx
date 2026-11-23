import { useMemo, useState } from 'react';
import { getDataset } from '../domain/data';
import { useLocale } from '../i18n';
import { buildMarkers } from '../map/markers';
import { MapPanel } from './MapPanel';

export function CollectionAtlas() {
  const { locale, strings } = useLocale();
  const [saved] = useState(() => window.history.state?.collectionAtlas);
  const [kind, setKind] = useState<string>(saved?.kind ?? '');
  const data = getDataset();
  const surviving = useMemo(() => data.objects.filter(o => o.survivalStatus === 'surviving'), [data]);
  const kinds = [...new Set(surviving.map(o => o.objectType))];
  const objects = useMemo(() => surviving.filter(o => !kind || o.objectType === kind), [surviving, kind]);
  const markers = useMemo(() => buildMarkers(data.places, objects, locale).markers, [data, objects, locale]);
  return <main className="atlas-journey collection-atlas">
    <h1>{locale === 'zh' ? '传世实物地图' : 'Map of surviving witnesses'}</h1>
    <div className="atlas-toolbar"><span>{locale === 'zh' ? '实物' : 'Witnesses'} <b>{objects.length}</b></span>
      <div className="atlas-tools"><label>{locale === 'zh' ? '实物类型' : 'Witness type'}
        <select value={kind} onChange={e => setKind(e.target.value)}>
          <option value="">{locale === 'zh' ? '全部类型' : 'All types'}</option>
          {kinds.map(k => <option key={k} value={k}>{strings.objectTypeLabels[k]}</option>)}
        </select></label></div></div>
    <MapPanel key={kind} selectedPlaceId={kind === saved?.kind ? saved.placeId : undefined} objects={objects} markers={markers} originalsOnly={false}
      onOpenObject={(id, placeId) => {
        window.history.replaceState({ ...window.history.state, collectionAtlas: { kind, placeId } }, '');
        window.location.hash = '/transmission/' + id;
      }} />
  </main>;
}
