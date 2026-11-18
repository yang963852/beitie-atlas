function isTiandituTile(image: HTMLImageElement): boolean {
  const source = image.currentSrc || image.src;
  if (!source) return false;
  const url = new URL(source);
  return /^t[0-7]\.tianditu\.gov\.cn$/.test(url.hostname) && /^\/vec_[cw]\/wmts\/?$/i.test(url.pathname);
}

export function watchTiles(
  container: HTMLElement,
  onBlockedChange: (blocked: boolean) => void,
  timeoutMs = 4000,
): { start: () => void; stop: () => void } {
  let loaded = false;
  let blocked = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const handleLoad = (event: Event) => {
    if (!(event.target instanceof HTMLImageElement) || !isTiandituTile(event.target)) return;
    loaded = true;
    if (blocked) {
      blocked = false;
      onBlockedChange(false);
    }
  };

  container.addEventListener('load', handleLoad, true);

  return {
    start() {
      timer = setTimeout(() => {
        const hasDecodedTile = Array.from(container.querySelectorAll('img')).some(
          (image) => image.complete && image.naturalWidth > 0 && isTiandituTile(image),
        );
        if (!loaded && !hasDecodedTile) {
          blocked = true;
          onBlockedChange(true);
        }
      }, timeoutMs);
    },
    stop() {
      clearTimeout(timer);
      container.removeEventListener('load', handleLoad, true);
    },
  };
}
