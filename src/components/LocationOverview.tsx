import { useLocale } from '../i18n';
import type { MapMarker } from '../map/types';

interface LocationOverviewProps {
  markers: MapMarker[];
  activePlaceId: string | null;
  onSelect: (placeId: string) => void;
}

/** An equal-degree coordinate grid without a third-party basemap. */
export function LocationOverview({ markers, activePlaceId, onSelect }: LocationOverviewProps) {
  const { strings } = useLocale();
  const longitudes = markers.map(({ longitude }) => longitude);
  const latitudes = markers.map(({ latitude }) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const span = Math.max(maxLongitude - minLongitude, maxLatitude - minLatitude, 1);

  return (
    <div className="map-overview" role="group" aria-label={strings.coordinateOverview}>
      <p className="map-overview__label">{strings.coordinateOverview}</p>
      {markers.length === 0 ? <p className="map-overview__empty">{strings.noMapPoints}</p> : null}
      {markers.map((marker) => {
        const x = 50 + 70 * (marker.longitude - (minLongitude + maxLongitude) / 2) / span;
        const y = 50 - 70 * (marker.latitude - (minLatitude + maxLatitude) / 2) / span;
        return (
          <button
            key={marker.placeId}
            type="button"
            className="map-overview__marker"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`${marker.label} · ${marker.sublabel}`}
            aria-pressed={activePlaceId === marker.placeId}
            onClick={() => onSelect(marker.placeId)}
          >
            {marker.objectIds.length}
            <span className="map-overview__marker-name" aria-hidden="true">{marker.label}</span>
          </button>
        );
      })}
    </div>
  );
}
