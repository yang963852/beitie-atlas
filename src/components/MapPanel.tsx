import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCoordinate } from '../domain/coordinates';
import { getDataset, getPlace, objectsAtCurrentPlace, partitionByLocation } from '../domain/data';
import type { ObjectRecord, Place } from '../domain/types';
import { detectLang, pickText } from '../domain/text';
import { useLocale } from '../i18n';
import { mapIsConfigured } from '../map/config';
import { watchTiles } from '../map/tiles';
import { createTiandituAdapter, toMapFailure } from '../map/tianditu';
import type { MapAdapter, MapFailure, MapMarker } from '../map/types';
import { LocationOverview } from './LocationOverview';
import { SourceList } from './SourceList';

type Status = 'unconfigured' | 'loading' | 'ready' | 'error';

type UnmappedReason = 'historical' | 'unknown' | 'no-point';

interface UnmappedRow {
  object: ObjectRecord;
  place: Place | undefined;
  reason: UnmappedReason;
}

interface MapPanelProps {
  onJourney?: () => void;
  markers: MapMarker[];
  /** Records matching the current search and map filter. */
  objects: ObjectRecord[];
  originalsOnly: boolean;
  onOriginalsOnlyChange?: (value: boolean) => void;
  onOpenObject: (id: string, placeId?: string) => void;
  selectedPlaceId?: string;
  /**
   * False while the mobile pane is hidden. The provider must not mount into a
   * container with no layout box, so the adapter is created only when shown.
   */
  active?: boolean;
}

export function MapPanel({
  onJourney, markers, objects, originalsOnly, onOriginalsOnlyChange, onOpenObject, selectedPlaceId, active = true,
}: MapPanelProps) {
  const { locale, strings } = useLocale();
  const [status, setStatus] = useState<Status>(mapIsConfigured ? 'loading' : 'unconfigured');
  const [failure, setFailure] = useState<MapFailure | null>(null);
  /** The script loaded but the tiles did not: key refused, quota gone, origin blocked. */
  const [tilesBlocked, setTilesBlocked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<MapAdapter | null>(null);

  const partition = useMemo(
    () => partitionByLocation(objects, getDataset().places),
    [objects],
  );

  const placeRows = useMemo(
    () =>
      Array.from(partition.byPlace.entries())
        .map(([placeId, list]) => ({ place: requirePlace(placeId), objects: list }))
        .sort((a, b) => a.place.id.localeCompare(b.place.id)),
    [partition],
  );

  /**
   * A place without a point is still a documented place. Counting only the
   * plotted ones made the panel look as if the corpus had four locations.
   */
  const documentedPlaceCount = useMemo(() => {
    const ids = new Set<string>();
    for (const placeId of partition.byPlace.keys()) ids.add(placeId);
    for (const object of partition.currentWithoutPoint) {
      if (object.currentCollection.placeId) ids.add(object.currentCollection.placeId);
    }
    return ids.size;
  }, [partition]);

  const unmappedRows = useMemo<UnmappedRow[]>(() => {
    const rows: UnmappedRow[] = [];
    for (const object of partition.lastKnown) {
      rows.push({
        object,
        place: getPlace(object.currentCollection.placeId),
        reason: 'historical',
      });
    }
    for (const object of partition.currentWithoutPoint) {
      rows.push({
        object,
        place: getPlace(object.currentCollection.placeId),
        reason: 'no-point',
      });
    }
    for (const object of partition.unknown) {
      rows.push({ object, place: undefined, reason: 'unknown' });
    }
    return rows;
  }, [partition]);

  // The map is rebuilt only when the set of points changes, not on every
  // keystroke that leaves the same markers visible.
  const markerSignature = markers
    .map((marker) => `${marker.placeId}:${marker.objectIds.join(',')}`)
    .join('|');
  const markersRef = useRef(markers);
  markersRef.current = markers;

  useEffect(() => {
    if (!mapIsConfigured) {
      setStatus('unconfigured');
      return;
    }
    if (!active) {
      // The previous effect run already destroyed its adapter and container
      // children. Mounting now would measure a display:none box.
      setStatus('loading');
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus('loading');
    setFailure(null);
    setTilesBlocked(false);
    container.replaceChildren();

    const tileWatch = watchTiles(container, setTilesBlocked);

    const adapter = createTiandituAdapter();
    adapterRef.current = adapter;

    adapter
      .mount(container, markersRef.current, { onMarkerClick: (placeId) => setActivePlaceId(placeId) })
      .then(() => {
        if (!cancelled) {
          setStatus('ready');
          tileWatch.start();
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailure(toMapFailure(error));
        setStatus('error');
      });

    return () => {
      cancelled = true;
      tileWatch.stop();
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [markerSignature, attempt, active]);

  useEffect(() => {
    setActivePlaceId(selectedPlaceId ?? null);
  }, [selectedPlaceId]);

  useEffect(() => {
    if (status === 'ready' && selectedPlaceId) adapterRef.current?.focus(selectedPlaceId);
  }, [status, selectedPlaceId]);

  // The popover is derived from the same filtered records as the list, so a
  // search cannot leave an institution from another record on screen.
  const activeObjects = useMemo(
    () => (activePlaceId ? objectsAtCurrentPlace(objects, activePlaceId) : []),
    [objects, activePlaceId],
  );
  const activePlace =
    activeObjects.length > 0 && activePlaceId ? requirePlace(activePlaceId) : undefined;

  return (
    <section
      className="pane pane--map"
      id="map"
      aria-labelledby="map-heading"
      tabIndex={-1}
      data-map-state={status === 'ready' ? 'live' : 'fallback'}
      data-map-tiles={tilesBlocked ? 'blocked' : 'ok'}
    >
      <div className="map__head">
        <div className="map__headings">
          <h2 id="map-heading" className="pane__title">
            {strings.mapHeading}
          </h2>
          {onJourney && <button className="link-button" onClick={onJourney}>{locale === 'zh' ? '查看颜勤礼碑流传时间轴 →' : 'Yan Qinli journey timeline →'}</button>}
          <p className="pane__sub">{strings.mapSubheading}</p>
          <p className="pane__sub map__hint">{strings.mapPointHint}</p>
          {onOriginalsOnlyChange && <label className="map__filter">
            <input
              type="checkbox"
              checked={originalsOnly}
              onChange={(event) => onOriginalsOnlyChange(event.currentTarget.checked)}
            />
            {strings.mapOriginalsOnly}
          </label>}
        </div>
        {status === 'ready' ? (
          <button
            type="button"
            className="button button--quiet"
            onClick={() => adapterRef.current?.fit()}
          >
            {strings.mapFitAll}
          </button>
        ) : null}
      </div>

      {/* A map whose tiles are refused looks identical to a map that is still
          loading, forever. Say so, and keep the markers and the place list —
          the coordinates are still readable without a basemap. */}
      {status === 'ready' && tilesBlocked ? (
        <p className="map__notice" role="status">
          <span>{strings.mapTilesBlocked}</span>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => setAttempt((count) => count + 1)}
          >
            {strings.mapRetry}
          </button>
        </p>
      ) : null}

      {/* The fallback box is short by design, so the provider must never be
          mounted into it: the SDK measures the container once and would keep
          loading tiles for a 210 px box after the panel grows. Only the
          unconfigured state uses the short geometry. */}
      <div className={status === 'unconfigured' ? 'map map--fallback' : 'map map--live'}>
        <div ref={containerRef} className="map__canvas" aria-hidden="true" />
        {/* Without tiles the provider canvas is a grid of broken images, which
            looks like a bug in this site. The schematic says the same thing
            without pretending to be a basemap. */}
        {status === 'unconfigured' || status === 'error' || tilesBlocked ? (
          <LocationOverview markers={markers} activePlaceId={activePlaceId} onSelect={setActivePlaceId} />
        ) : null}

        {status === 'loading' ? (
          <div
            className="map__overlay"
            role="status"
          >
            <p className="map__overlay-title">{strings.mapLoading}</p>
            <p className="map__overlay-body">{strings.mapLoadingHint}</p>
            <div className="skeleton" aria-hidden="true" />
          </div>
        ) : null}

        {activePlace && status === 'ready' ? (
          <div className="place-card" role="group" aria-label={strings.placeCardLabel}>
            <div className="place-card__head">
              <p className="place-card__name">
                <span lang="zh-Hans">{activePlace.names.zh}</span>
                <span className="place-card__en" lang="en">
                  {activePlace.names.en}
                </span>
              </p>
              <button
                type="button"
                className="icon-button"
                aria-label={strings.closePlaceCard}
                onClick={() => setActivePlaceId(null)}
              >
                ×
              </button>
            </div>
            <p className="place-card__count">{strings.objectsAtPlace(activeObjects.length)}</p>
            <ul className="place-card__list">
              {activeObjects.map((object) => (
                <li key={object.id}>
                  <button type="button" className="link-button link-button--row" onClick={() => onOpenObject(object.id, activePlaceId ?? undefined)}>
                    <span className="place-card__type">
                      {strings.objectTypeLabels[object.objectType]}
                    </span>
                    <span lang="zh-Hans">{object.titles.zh}</span>
                    <span className="place-card__list-en" lang="en">
                      {object.titles.en}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* The pins are small, and a provider pin does not advertise that it is a
          control. This index names every plotted place, keeps the map usable
          without a mouse, and says how many records sit behind each point. */}
      {markers.length > 0 ? (
        <div className="map__index" role="group" aria-label={strings.mapPointIndexLabel}>
          {markers.map((marker) => (
            <button
              key={marker.placeId}
              type="button"
              className="map__index-item"
              aria-pressed={activePlaceId === marker.placeId}
              onClick={() => {
                adapterRef.current?.focus(marker.placeId);
                setActivePlaceId(marker.placeId);
              }}
            >
              <span className="map__index-name">{marker.label}</span>
              <span className="map__index-count">
                {strings.mapPointIndexCount(marker.objectIds.length)}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {activePlace && status !== 'ready' ? (
        <div className="map-overview__selection" role="group" aria-label={strings.placeCardLabel}>
          <strong>{pickText(locale, activePlace.names.zh, activePlace.names.en)}</strong>
          <ul className="place-card__list">
            {activeObjects.map((object) => (
              <li key={object.id}>
                <button type="button" className="link-button link-button--row" onClick={() => onOpenObject(object.id, activePlaceId ?? undefined)}>
                  <span className="place-card__type">
                    {strings.objectTypeLabels[object.objectType]}
                  </span>
                  {pickText(locale, object.titles.zh, object.titles.en)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="map__caption" role="alert">
          <p>{strings.mapErrorTitle}</p>
          <button type="button" className="button button--quiet" onClick={() => setAttempt((value) => value + 1)}>
            {strings.mapRetry}
          </button>
          {failure ? (
            <details className="devnote">
              <summary>{strings.mapDeveloperDetails}</summary>
              <p className="mono">{strings.mapFailureDevNote(failure.code, failure.message)}</p>
            </details>
          ) : null}
        </div>
      ) : null}

      {status === 'ready' ? (
        <div className="map__caption">
          <p>
            <strong>{strings.mapAttributionLabel}</strong> {strings.mapAttributionText}
          </p>
          <p>{strings.mapFrameNote}</p>
        </div>
      ) : null}

      <details className="locations" open={status !== 'ready'}>
        <summary className="locations__summary">
          {strings.locationsHeading}
          <span className="locations__count">{documentedPlaceCount}</span>
          <span className="locations__coverage">
            {strings.mapCoverage(markers.length, documentedPlaceCount)}
          </span>
        </summary>
        <p className="locations__intro">{strings.locationsIntro}</p>
        <ul className="location-list">
          {placeRows.map(({ place, objects: list }) => {
            const coordinates = place.coordinates;
            const coordinateNote = coordinates
              ? pickText(locale, coordinates.noteZh, coordinates.note)
              : null;
            return (
              <li key={place.id} className="location">
                <p className="location__name">
                  <span lang="zh-Hans">{place.names.zh}</span>
                  <span className="location__en" lang={locale === 'zh' ? 'en' : 'zh-Hans'}>
                    {locale === 'zh' ? place.names.en : place.names.zh}
                  </span>
                </p>
                <p className="location__meta">
                  <span className="mono">
                    {coordinates
                      ? formatCoordinate(coordinates.longitude, coordinates.latitude)
                      : strings.noCoordinates}
                  </span>
                  {coordinates ? (
                    <>
                      <span className="tag">
                        {strings.precisionLabel} {strings.precisionLabels[coordinates.precision]}
                      </span>
                      <span
                        className={
                          coordinates.verification === 'verified' ? 'tag tag--ok' : 'tag tag--warn'
                        }
                      >
                        {coordinates.verification === 'verified'
                          ? strings.coordinateVerified
                          : strings.coordinateUnverified}
                      </span>
                    </>
                  ) : null}
                  <span className="location__count">{strings.objectsAtPlace(list.length)}</span>
                </p>
                {coordinateNote ? (
                  <p className="location__note" lang={detectLang(coordinateNote)}>
                    {coordinateNote}
                  </p>
                ) : null}
                <SourceList
                  ids={coordinates?.sourceRefs ?? place.sourceRefs}
                  label={strings.coordinateSourceLabel}
                  compact
                />
                {coordinates ? (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      adapterRef.current?.focus(place.id);
                      setActivePlaceId(place.id);
                    }}
                  >
                    {strings.openInMap}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>

        {unmappedRows.length > 0 ? (
          <>
            <h3 className="location-list__heading">{strings.locationsWithoutPointHeading}</h3>
            <p className="locations__intro">{strings.locationsWithoutPointIntro}</p>
            <ul className="location-list location-list--plain">
              {unmappedRows.map(({ object, place, reason }) => (
                <li key={object.id}>
                  <button type="button" className="link-button" onClick={() => onOpenObject(object.id, activePlaceId ?? undefined)}>
                    <span lang="zh-Hans">{object.titles.zh}</span>
                    <span className="place-card__list-en" lang={locale === 'zh' ? 'en' : 'zh-Hans'}>
                      {locale === 'zh' ? object.titles.en : object.titles.zh}
                    </span>
                  </button>
                  <p className="location__meta">
                    <span className="tag">
                      {strings.locationKindLabels[object.currentCollection.locationKind]}
                    </span>
                    <span>
                      {place
                        ? pickText(locale, place.names.zh, place.names.en)
                        : strings.placeNotRecorded}
                    </span>
                    <span className="location__count">{strings.unmappedReasons[reason]}</span>
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </details>
    </section>
  );
}

/**
 * `byPlace` keys only contain places that resolved during partitioning, so this
 * is a lookup rather than a fallback. Throwing keeps a broken corpus visible
 * instead of silently hiding a record.
 */
function requirePlace(placeId: string): Place {
  const place = getPlace(placeId);
  if (!place) throw new Error(`Place "${placeId}" is missing from the corpus.`);
  return place;
}
