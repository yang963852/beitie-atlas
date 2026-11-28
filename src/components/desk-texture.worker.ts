import { paintDeskSurface, type DeskSurface } from './classroom-textures';

self.onmessage = ({ data: { width, height } }: MessageEvent<{ width: number; height: number }>) => {
  const paint = (surface: DeskSurface) => {
    const canvas = new OffscreenCanvas(width, height);
    paintDeskSurface(canvas.getContext('2d')!, surface, width, height);
    return canvas.transferToImageBitmap();
  };
  const felt = paint('felt'), paper = paint('paper');
  // The DOM lib types `self` as Window; inside a dedicated worker the
  // transferable overload is the one that exists at runtime.
  (self as unknown as { postMessage(message: unknown, transfer: Transferable[]): void })
    .postMessage({ felt, paper }, [felt, paper]);
};