import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCoordinate } from '../domain/coordinates';
import { getObjectsForPlace, getPlace, groupByPlace } from '../domain/data';
import type { ObjectRecord, Place } from '../domain/types';
import { strings } from '../i18n/en';
import { mapIsConfigured } from '../map/config';
import { createTiandituAdapter, toMapFailure } from '../map/tianditu';
import type { MapAdapter, MapFailure, MapMarker } from '../map/types';
import { SourceList } from './SourceList';

type Status = 'unconfigured' | 'loading' | 'ready' | 'error';

interface MapPanelProps {
  markers: MapMarker[];
  objects: ObjectRecord[];
  onOpenObject: (id: string) => void;
}

interface PlaceRow {
  place: Place;
  objects: ObjectRecord[];
}

export function MapPanel({ markers, objects, onOpenObject }: MapPanelProps) {
  const [status, setStatus] = useState<Status>(mapIsConfigured ? 'loading' : 'unconfigured');
  const [failure, setFailure] = useState<MapFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<MapAdapter | null>(null);

  const placeRows = useMemo<PlaceRow[]>(() => {
    const groups = groupByPlace(objects);
    return Array.from(groups.entries())
      .map(([placeId, list]) => ({ place: getPlace(placeId), objects: list }))
      .filter((row): row is PlaceRow => Boolean(row.place))
      .sort((a, b) => a.place.id.localeCompare(b.place.id));
  }, [objects]);

  const withoutPoint = useMemo(
    () =>
      objects.filter((object) => {
        const place = getPlace(object.currentCollection.placeId);
        return !place || !place.coordinates;
      }),
    [objects],
  );

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
      .mount(container, markers, { onMarkerClick: (placeId) => setActivePlaceId(placeId) })
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
  }, [markers, attempt]);

  const activePlace = getPlace(activePlaceId);
  const activeObjects = activePlaceId ? getObjectsForPlace(activePlaceId) : [];

  return (
    <section className="panel panel--map" id="map" aria-labelledby="map-heading">
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

        {withoutPoint.length > 0 ? (
          <>
            <h3 className="location-list__heading">{strings.locationsUnmappedHeading}</h3>
            <ul className="location-list location-list--plain">
              {withoutPoint.map((object) => (
                <li key={object.id}>
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => onOpenObject(object.id)}
                  >
                    <span lang="zh-Hans">{object.titles.zh}</span> · {object.titles.en}
                  </button>
                  <span className="location__count">{strings.noCoordinates}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </details>
    </section>
  );
}
