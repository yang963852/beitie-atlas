import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MapMarker } from '../src/map/types';
import { createTiandituAdapter } from '../src/map/tianditu';
import type { TiandituNamespace } from '../src/map/tianditu';

const SCRIPT_SELECTOR = 'script[data-map-provider="tianditu"]';

function providerScripts(): HTMLScriptElement[] {
  return Array.from(document.querySelectorAll<HTMLScriptElement>(SCRIPT_SELECTOR));
}

function clearProviderScripts(): void {
  for (const node of providerScripts()) node.remove();
}

/** A fresh module instance per test, so the loader's singleton state is isolated. */
async function freshLoad(): Promise<() => Promise<TiandituNamespace>> {
  vi.resetModules();
  const module = await import('../src/map/tianditu');
  return module.loadTiandituSdk;
}

function fakeSdk() {
  const map = {
    centerAndZoom: vi.fn(),
    addOverLay: vi.fn(),
    clearOverLays: vi.fn(),
    panTo: vi.fn(),
    destroy: vi.fn(),
  };
  const markerInstances: Array<{ addEventListener: ReturnType<typeof vi.fn> }> = [];

  const MapCtor = vi.fn(function () {
    return map;
  });
  const LngLatCtor = vi.fn(function (this: unknown, longitude: number, latitude: number) {
    return { longitude, latitude };
  });
  const MarkerCtor = vi.fn(function () {
    const instance = { addEventListener: vi.fn() };
    markerInstances.push(instance);
    return instance;
  });

  const namespace = {
    Map: MapCtor,
    LngLat: LngLatCtor,
    Marker: MarkerCtor,
  } as unknown as TiandituNamespace;

  return { namespace, map, markerInstances, MapCtor, LngLatCtor, MarkerCtor };
}

const marker: MapMarker = {
  placeId: 'place-a',
  longitude: 108.94,
  latitude: 34.25,
  label: 'A',
  sublabel: '1 record',
  objectIds: ['object-1'],
  provisional: true,
  precision: 'institution',
};

beforeEach(() => {
  clearProviderScripts();
  delete window.T;
});

afterEach(() => {
  vi.useRealTimers();
  clearProviderScripts();
  delete window.T;
});

describe('Tianditu SDK loader', () => {
  it('creates a genuinely new script after a script error', async () => {
    const load = await freshLoad();
    const first = load();
    const firstScript = providerScripts()[0];

    expect(firstScript).toBeDefined();
    expect(firstScript?.src).toContain('api.tianditu.gov.cn');

    firstScript?.dispatchEvent(new Event('error'));
    await expect(first).rejects.toMatchObject({ code: 'script-error' });
    expect(providerScripts()).toHaveLength(0);

    const sdk = fakeSdk();
    const second = load();
    const secondScript = providerScripts()[0];
    expect(secondScript).toBeDefined();
    expect(secondScript).not.toBe(firstScript);

    window.T = sdk.namespace;
    secondScript?.dispatchEvent(new Event('load'));
    await expect(second).resolves.toBe(sdk.namespace);
    expect(providerScripts()).toHaveLength(1);
  });

  it('cleans up and retries after a timeout', async () => {
    vi.useFakeTimers();
    const load = await freshLoad();
    const first = load();
    const firstScript = providerScripts()[0];

    vi.advanceTimersByTime(15_000);
    await expect(first).rejects.toMatchObject({ code: 'timeout' });
    expect(providerScripts()).toHaveLength(0);

    const sdk = fakeSdk();
    const second = load();
    const secondScript = providerScripts()[0];
    expect(secondScript).toBeDefined();
    expect(secondScript).not.toBe(firstScript);

    window.T = sdk.namespace;
    secondScript?.dispatchEvent(new Event('load'));
    await expect(second).resolves.toBe(sdk.namespace);
  });

  it('ignores a late load event from an abandoned attempt', async () => {
    const load = await freshLoad();
    const first = load();
    const firstScript = providerScripts()[0];

    firstScript?.dispatchEvent(new Event('error'));
    await expect(first).rejects.toMatchObject({ code: 'script-error' });

    const second = load();
    let settled = false;
    void second.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );

    const sdk = fakeSdk();
    window.T = sdk.namespace;
    firstScript?.dispatchEvent(new Event('load'));
    await Promise.resolve();
    expect(settled).toBe(false);

    providerScripts()[0]?.dispatchEvent(new Event('load'));
    await expect(second).resolves.toBe(sdk.namespace);
  });

  it('shares one request between concurrent callers', async () => {
    const load = await freshLoad();
    const a = load();
    const b = load();

    expect(a).toBe(b);
    expect(providerScripts()).toHaveLength(1);

    const sdk = fakeSdk();
    window.T = sdk.namespace;
    providerScripts()[0]?.dispatchEvent(new Event('load'));

    await expect(a).resolves.toBe(sdk.namespace);
    await expect(b).resolves.toBe(sdk.namespace);
  });

  it('does not request a second script once the SDK is present', async () => {
    const load = await freshLoad();
    const sdk = fakeSdk();
    window.T = sdk.namespace;

    await expect(load()).resolves.toBe(sdk.namespace);
    expect(providerScripts()).toHaveLength(0);
  });
});

describe('map adapter lifecycle', () => {
  it('creates one map, one marker per place, and forwards the place id', async () => {
    const sdk = fakeSdk();
    const adapter = createTiandituAdapter(async () => sdk.namespace);
    const container = document.createElement('div');
    const onMarkerClick = vi.fn();

    await adapter.mount(container, [marker], { onMarkerClick });

    expect(sdk.MapCtor).toHaveBeenCalledTimes(1);
    expect(sdk.map.centerAndZoom).toHaveBeenCalledTimes(1);
    expect(sdk.map.addOverLay).toHaveBeenCalledTimes(1);

    const handler = sdk.markerInstances[0]?.addEventListener.mock.calls[0]?.[1] as
      | (() => void)
      | undefined;
    handler?.();
    expect(onMarkerClick).toHaveBeenCalledWith('place-a');
  });

  it('does not create a map when the component unmounts during loading', async () => {
    const sdk = fakeSdk();
    let resolveLoad: ((sdk: TiandituNamespace) => void) | undefined;
    const adapter = createTiandituAdapter(
      () =>
        new Promise<TiandituNamespace>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const container = document.createElement('div');

    const mounting = adapter.mount(container, [marker], { onMarkerClick: vi.fn() });
    adapter.destroy();
    resolveLoad?.(sdk.namespace);

    await expect(mounting).resolves.toBeUndefined();
    expect(sdk.MapCtor).not.toHaveBeenCalled();
  });
});
