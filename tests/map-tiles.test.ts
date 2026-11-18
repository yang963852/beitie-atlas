import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchTiles } from '../src/map/tiles';

/**
 * The provider gives no signal when tiles are refused. These tests pin the
 * behaviour of the watcher that stands in for that signal, including the case
 * where the browser fires nothing at all.
 */
function makeContainer(tiles: number): { container: HTMLDivElement; images: HTMLImageElement[] } {
  const container = document.createElement('div');
  const images = Array.from({ length: tiles }, () => {
    const image = document.createElement('img');
    container.appendChild(image);
    return image;
  });
  document.body.appendChild(container);
  return { container, images };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('tile watcher', () => {
  it('reports as soon as a tile fails before any has loaded', () => {
    const { container, images } = makeContainer(2);
    const onFailure = vi.fn();

    watchTiles(container, onFailure);
    images[0].dispatchEvent(new Event('error'));

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when a tile loads', () => {
    const { container, images } = makeContainer(2);
    const onFailure = vi.fn();

    watchTiles(container, onFailure);
    images[0].dispatchEvent(new Event('load'));
    images[1].dispatchEvent(new Event('error'));
    vi.advanceTimersByTime(20_000);

    expect(onFailure).not.toHaveBeenCalled();
  });

  it('reports when images are present but nothing arrives and nothing fails', () => {
    const { container } = makeContainer(1);
    const onFailure = vi.fn();

    watchTiles(container, onFailure, { timeoutMs: 5000 });
    vi.advanceTimersByTime(4999);
    expect(onFailure).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('does not report when the provider renders no images at all', () => {
    const { container } = makeContainer(0);
    const onFailure = vi.fn();

    watchTiles(container, onFailure, { timeoutMs: 5000 });
    vi.advanceTimersByTime(10_000);

    expect(onFailure).not.toHaveBeenCalled();
  });

  it('reports at most once and stops listening after cleanup', () => {
    const { container, images } = makeContainer(2);
    const onFailure = vi.fn();

    const stop = watchTiles(container, onFailure);
    images[0].dispatchEvent(new Event('error'));
    images[1].dispatchEvent(new Event('error'));
    expect(onFailure).toHaveBeenCalledTimes(1);

    stop();
    images[0].dispatchEvent(new Event('error'));
    vi.advanceTimersByTime(20_000);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});
