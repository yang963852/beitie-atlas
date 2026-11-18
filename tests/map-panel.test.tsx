import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocaleProvider } from '../src/i18n';
import type { MapMarker } from '../src/map/types';

/**
 * A provider that loads but whose tiles are refused is the failure the adapter
 * cannot see: the SDK reports nothing, so the reader would get a blank grid of
 * broken images with no explanation. This test drives that state through a stub
 * provider, because the real one depends on a key, a whitelist and the network.
 */
vi.mock('../src/map/config', () => ({
  tiandituKey: 'test-key',
  mapIsConfigured: true,
  TIANDITU_API_ORIGIN: 'https://example.invalid',
  TIANDITU_SCRIPT_URL: 'https://example.invalid/api',
  LOAD_TIMEOUT_MS: 1000,
  DEFAULT_VIEW: { longitude: 104.2, latitude: 35.9, zoom: 4 },
}));

vi.mock('../src/map/tianditu', () => ({
  createTiandituAdapter: () => ({
    mount: async (container: HTMLElement) => {
      const tile = document.createElement('img');
      tile.src = 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile';
      container.appendChild(tile);
      queueMicrotask(() => tile.dispatchEvent(new Event('error')));
    },
    focus: () => {},
    fit: () => {},
    destroy: () => {},
  }),
  toMapFailure: (error: unknown) => ({ code: 'sdk-error', message: String(error) }),
}));

const markers: MapMarker[] = [
  {
    placeId: 'place-xian-beilin-museum',
    longitude: 108.948333,
    latitude: 34.255,
    label: '西安碑林博物馆',
    sublabel: "Xi'an Beilin Museum",
    objectIds: ['stele-cao-quan'],
    provisional: true,
    precision: 'institution',
  },
];

beforeEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
  vi.useFakeTimers();
});

afterEach(() => vi.useRealTimers());

describe('map panel with a refused basemap', () => {
  it('tells the reader the tiles did not load and keeps the schematic', async () => {
    const { MapPanel } = await import('../src/components/MapPanel');

    const { container } = render(
      <LocaleProvider>
        <MapPanel
          markers={markers}
          objects={[]}
          originalsOnly={false}
          onOriginalsOnlyChange={() => {}}
          onOpenObject={() => {}}
        />
      </LocaleProvider>,
    );

    await act(async () => {});
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByText(/底图未能加载/)).toBeInTheDocument();
    // The schematic replaces the provider canvas, so no broken image icons.
    expect(document.querySelector('.map-overview')).not.toBeNull();
    expect(document.querySelector('#map')?.getAttribute('data-map-tiles')).toBe('blocked');

    const tile = container.querySelector('.map__canvas img');
    act(() => { tile?.dispatchEvent(new Event('load')); });
    expect(screen.queryByText(/底图未能加载/)).not.toBeInTheDocument();
    expect(container.querySelector('.map-overview')).toBeNull();
  });
});
