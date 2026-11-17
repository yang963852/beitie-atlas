import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCoordinate } from '../domain/coordinates';
import { getDataset, getPlace, objectsAtCurrentPlace, partitionByLocation } from '../domain/data';
import type { ObjectRecord, Place } from '../domain/types';
import { strings } from '../i18n/en';
import { mapIsConfigured } from '../map/config';
import { createTiandituAdapter, toMapFailure } from '../map/tianditu';
import type { MapAdapter, MapFailure, MapMarker } from '../map/types';
import { SourceList } from './SourceList';

type Status = 'unconfigured' | 'loading' | 'ready' | 'error';

type UnmappedReason = 'historical' | 'unknown' | 'no-point';

interface UnmappedRow {
  object: ObjectRecord;
  place: Place | undefined;
  reason: UnmappedReason;
}

interface MapPanelProps {
  markers: MapMarker[];
  /** Records matching the current search. The panel never reads the full corpus. */
  objects: ObjectRecord[];
  onOpenObject: (id: string) => void;
}

export function MapPanel({ markers, objects, onOpenObject }: MapPanelProps) {
  const [status, setStatus] = useState<Status>(mapIsConfigured ? 'loading' : 'unconfigured');
  const [failure, setFailure] = useState<MapFailure | null>(null);
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
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus('loading');
    setFailure(null);
    container.replaceChildren();

    const adapter = createTiandituAdapter();
    adapterRef.current = adapter;

    adapter
      .mount(container, markersRef.current, { onMarkerClick: (placeId) => setActivePlaceId(placeId) })
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailure(toMapFailure(error));
        setStatus('error');
      });

    return () => {
      cancelled = true;
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [markerSignature, attempt]);

  // The popover is derived from the same filtered records as the list, so a
  // search cannot leave an institution from another record on screen.
  const activeObjects = useMemo(
    () => (activePlaceId ? objectsAtCurrentPlace(objects, activePlaceId) : []),
    [objects, activePlaceId],
  );
  const activePlace =
    activeObjects.length > 0 && activePlaceId ? requirePlace(activePlaceId) : undefined;

  return (
    <section className="panel panel--map" id="map" aria-labelledby="map-heading" tabIndex={-1}>
      <div className="panel__head">
        <h2 id="map-heading" className="panel__heading">
          {strings.mapHeading}
        </h2>
        <p className="panel__sub">{strings.mapSubheading}</p>
      </div>

      <div className="map">
        <div ref={containerRef} className="map__canvas" aria-hidden="true" />

        {status !== 'ready' ? (
          <div
            className="map__overlay"
            role={status === 'error' ? 'alert' : 'status'}
            aria-live={status === 'error' ? 'assertive' : 'polite'}
          >
            {status === 'loading' ? (
              <>
                <p className="map__overlay-title">{strings.mapLoading}</p>
                <p className="map__overlay-body">{strings.mapLoadingHint}</p>
                <div className="skeleton" aria-hidden="true" />
              </>
            ) : null}

            {status === 'unconfigured' ? (
              <>
                <p className="map__overlay-title">{strings.mapUnconfiguredTitle}</p>
                <p className="map__overlay-body">{strings.mapUnconfiguredBody}</p>
                <p className="map__overlay-action">{strings.mapUnconfiguredAction}</p>
              </>
            ) : null}

            {status === 'error' ? (
              <>
                <p className="map__overlay-title">{strings.mapErrorTitle}</p>
                <p className="map__overlay-body">{strings.mapErrorBody}</p>
                {failure ? (
                  <p className="map__overlay-detail">
                    {failure.code}: {failure.message}
                  </p>
                ) : null}
                <button type="button" className="button" onClick={() => setAttempt((value) => value + 1)}>
                  {strings.mapRetry}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {status === 'ready' ? (
        <>
          <p className="map__attribution">
            <strong>{strings.mapAttributionLabel}:</strong> {strings.mapAttributionText}
          </p>
          <p className="map__frame-note">{strings.mapFrameNote}</p>
        </>
      ) : null}

      {activePlace ? (
        <div className="place-card">
          <p className="place-card__name">
            <span lang="zh-Hans">{activePlace.names.zh}</span>
            <span className="place-card__en">{activePlace.names.en}</span>
          </p>
          <p className="meta-line">{strings.objectsAtPlace(activeObjects.length)}</p>
          <ul className="place-card__list">
            {activeObjects.map((object) => (
              <li key={object.id}>
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => onOpenObject(object.id)}
                >
                  <span lang="zh-Hans">{object.titles.zh}</span> · {object.titles.en}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="map__locations" open>
        <summary>
          {strings.locationsHeading} ({placeRows.length})
        </summary>
        <p className="meta-line">{strings.locationsIntro}</p>
        <ul className="location-list">
          {placeRows.map(({ place, objects: list }) => {
            const coordinates = place.coordinates;
            return (
              <li key={place.id} className="location">
                <p className="location__name">
                  <span lang="zh-Hans">{place.names.zh}</span>
                  <span className="location__en">{place.names.en}</span>
                </p>
                <p className="location__meta">
                  <span className="mono">
                    {coordinates
                      ? formatCoordinate(coordinates.longitude, coordinates.latitude)
                      : strings.noCoordinates}
                  </span>
                  {coordinates ? (
                    <>
                      <span className="tag">{strings.precisionLabel}: {coordinates.precision}</span>
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
                <SourceList
                  ids={coordinates?.sourceRefs ?? place.sourceRefs}
                  label={strings.coordinateSourceLabel}
                  compact
                />
                {coordinates && status === 'ready' ? (
                  <button
                    type="button"
                    className="button button--quiet"
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
            <p className="meta-line">{strings.locationsWithoutPointIntro}</p>
            <ul className="location-list location-list--plain">
              {unmappedRows.map(({ object, place, reason }) => (
                <li key={object.id}>
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => onOpenObject(object.id)}
                  >
                    <span lang="zh-Hans">{object.titles.zh}</span> · {object.titles.en}
                  </button>
                  <p className="location__meta">
                    <span className="tag">
                      {strings.locationKindLabels[object.currentCollection.locationKind]}
                    </span>
                    <span>{place ? place.names.en : strings.placeNotRecorded}</span>
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
