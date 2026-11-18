import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchTiles } from '../src/map/tiles';

const tileUrl = 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile';

function addImage(container: HTMLElement, src = tileUrl) {
  const image = document.createElement('img');
  image.src = src;
  return container.appendChild(image);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('tile watcher', () => {
  it('does not report a failure when another tile succeeds within the grace period', () => {
    const container = document.createElement('div');
    const onBlockedChange = vi.fn();
    const watch = watchTiles(container, onBlockedChange);
    watch.start();

    addImage(container).dispatchEvent(new Event('error'));
    addImage(container).dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(4000);

    expect(onBlockedChange).not.toHaveBeenCalled();
    watch.stop();
  });

  it('starts the deadline after SDK mount, then recovers when a late tile succeeds', () => {
    const container = document.createElement('div');
    const onBlockedChange = vi.fn();
    const watch = watchTiles(container, onBlockedChange);
    vi.advanceTimersByTime(10_000);
    expect(onBlockedChange).not.toHaveBeenCalled();

    watch.start();
    const tile = addImage(container);
    vi.advanceTimersByTime(3999);
    expect(onBlockedChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    tile.dispatchEvent(new Event('load'));

    expect(onBlockedChange.mock.calls).toEqual([[true], [false]]);
    watch.stop();
  });

  it('does not count marker icons or map annotations as a working basemap', () => {
    const container = document.createElement('div');
    const onBlockedChange = vi.fn();
    const watch = watchTiles(container, onBlockedChange);
    watch.start();
    addImage(container, 'https://api.tianditu.gov.cn/img/marker.png').dispatchEvent(new Event('load'));
    addImage(container, tileUrl.replace('vec_w', 'cva_w')).dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(4000);

    expect(onBlockedChange.mock.calls).toEqual([[true]]);
    watch.stop();
  });

  it('clears a pending deadline on cleanup', () => {
    const container = document.createElement('div');
    const onBlockedChange = vi.fn();
    const watch = watchTiles(container, onBlockedChange);
    watch.start();
    watch.stop();
    vi.advanceTimersByTime(4000);

    expect(onBlockedChange).not.toHaveBeenCalled();
  });

  it('detaches the recovery listener on cleanup', () => {
    const container = document.createElement('div');
    const onBlockedChange = vi.fn();
    const watch = watchTiles(container, onBlockedChange);
    watch.start();
    vi.advanceTimersByTime(4000);
    watch.stop();
    addImage(container).dispatchEvent(new Event('load'));

    expect(onBlockedChange.mock.calls).toEqual([[true]]);
  });
});
