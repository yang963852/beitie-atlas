import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getDataset, groupObjectsByProvince, type ProvinceGroup, type ProvinceGroupKey } from '../domain/data';
import { useLocale } from '../i18n';
import { buildMarkers } from '../map/markers';
import { MapPanel } from './MapPanel';

type Selection = ProvinceGroupKey | 'all';

export function CollectionAtlas() {
  const { locale, strings } = useLocale();
  const main = useRef<HTMLElement>(null);
  const [saved] = useState(() => window.history.state?.collectionAtlas);
  const [kind, setKind] = useState<string>(saved?.kind ?? '');
  const [province, setProvince] = useState<Selection>(saved?.province ?? 'all');
  const [placeId, setPlaceId] = useState<string | undefined>(saved?.placeId);
  const data = getDataset();
  const surviving = useMemo(() => data.objects.filter(o => o.survivalStatus === 'surviving'), [data]);
  const kinds = [...new Set(surviving.map(o => o.objectType))];
  const filteredByKind = useMemo(
    () => surviving.filter(o => !kind || o.objectType === kind),
    [surviving, kind],
  );
  const groups = useMemo(
    () => groupObjectsByProvince(filteredByKind, data.places),
    [filteredByKind, data.places],
  );
  const activeGroup = groups.find(group => group.key === province);
  const activeProvince: Selection = province === 'all' || activeGroup ? province : 'all';
  const objects = activeGroup ? activeGroup.objects : filteredByKind;
  const markers = useMemo(() => buildMarkers(data.places, objects, locale).markers, [data, objects, locale]);

  useLayoutEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, []);

  function labelFor(group: ProvinceGroup): string {
    if (group.key === 'unplaced') return strings.provinceUnplaced;
    if (group.key === 'unknown') return strings.provinceUnknown;
    return locale === 'zh' ? group.province!.zh : group.province!.en;
  }

  function openObject(id: string, place?: string) {
    window.history.replaceState(
      { ...window.history.state, collectionAtlas: { kind, province: activeProvince, placeId: place } },
      '',
    );
    window.location.hash = '/transmission/' + id;
  }

  return <main ref={main} id="catalogue" tabIndex={-1} className="atlas-journey collection-atlas">
    <header className="collection-atlas__intro">
      <h1>{strings.collectionAtlasTitle}</h1>
      <p className="collection-atlas__lede">{strings.collectionAtlasLede}</p>
      <p className="collection-atlas__gap">{strings.collectionAtlasGapNote}</p>
    </header>
    <div className="atlas-toolbar">
      <span>{strings.collectionAtlasWitnesses} <b>{objects.length}</b></span>
      <div className="atlas-tools">
        <label>{locale === 'zh' ? '实物类型' : 'Witness type'}
          <select value={kind} onChange={e => { setKind(e.target.value); setPlaceId(undefined); }}>
            <option value="">{locale === 'zh' ? '全部类型' : 'All types'}</option>
            {kinds.map(k => <option key={k} value={k}>{strings.objectTypeLabels[k]}</option>)}
          </select></label>
      </div>
    </div>

    <div className="collection-atlas__layout">
      <aside className="province-panel" aria-labelledby="province-heading">
        <h2 id="province-heading" className="province-panel__title">{strings.provincesHeading}</h2>
        <p className="province-panel__hint">{strings.provincesHint}</p>
        <div className="province-panel__grid" role="group" aria-label={strings.provincesFilterLabel}>
          <button
            type="button"
            className="province-panel__button"
            aria-pressed={activeProvince === 'all'}
            onClick={() => { setProvince('all'); setPlaceId(undefined); }}
          >
            <span>{strings.provincesAll}</span>
            <span className="province-panel__count">{strings.provinceCount(filteredByKind.length)}</span>
          </button>
          {groups.map(group => (
            <button
              key={group.key}
              type="button"
              className="province-panel__button"
              aria-pressed={activeProvince === group.key}
              onClick={() => { setProvince(group.key); setPlaceId(undefined); }}
            >
              <span>{labelFor(group)}</span>
              <span className="province-panel__count">{strings.provinceCount(group.objects.length)}</span>
            </button>
          ))}
        </div>

        {activeGroup ? <div className="province-panel__detail">
          <h3 className="province-panel__detail-title">
            {labelFor(activeGroup)}
            <span>
              {strings.provinceCount(activeGroup.objects.length)}
              {activeGroup.places.length ? ` · ${strings.provincePlaceCount(activeGroup.places.length)}` : ''}
            </span>
          </h3>
          {activeGroup.places.map(({ place, objects: list }) => <section className="province-place" key={place.id}>
            <h4 className="province-place__name">
              <span lang={locale === 'zh' ? 'zh-Hans' : 'en'}>
                {locale === 'zh' ? place.names.zh : place.names.en}
              </span>
              {!place.coordinates ? <span className="tag">{strings.provinceNotMapped}</span> : null}
            </h4>
            <ul className="province-place__objects">
              {list.map(object => <li key={object.id}>
                <button type="button" className="link-button link-button--row" onClick={() => openObject(object.id, place.id)}>
                  <span className="place-card__type">{strings.objectTypeLabels[object.objectType]}</span>
                  <span lang={locale === 'zh' ? 'zh-Hans' : 'en'}>
                    {locale === 'zh' ? object.titles.zh : object.titles.en}
                  </span>
                </button>
              </li>)}
            </ul>
          </section>)}
          {activeGroup.key === 'unplaced' ? <>
            <p className="province-panel__empty">{strings.provinceUnplacedHint}</p>
            <ul className="province-place__objects">
              {activeGroup.objects.map(object => <li key={object.id}>
                <button type="button" className="link-button link-button--row" onClick={() => openObject(object.id)}>
                  <span className="place-card__type">{strings.objectTypeLabels[object.objectType]}</span>
                  <span lang={locale === 'zh' ? 'zh-Hans' : 'en'}>
                    {locale === 'zh' ? object.titles.zh : object.titles.en}
                  </span>
                </button>
              </li>)}
            </ul>
          </> : null}
        </div> : null}
      </aside>

      <div className="collection-atlas__map">
        <MapPanel
          key={`${kind}:${activeProvince}`}
          selectedPlaceId={placeId}
          objects={objects}
          markers={markers}
          originalsOnly={false}
          onOpenObject={openObject}
        />
      </div>
    </div>
  </main>;
}
