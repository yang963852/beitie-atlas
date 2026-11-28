export type DeskSurface = 'felt' | 'paper';
export type DeskSurfaces = { felt: TexImageSource; paper: TexImageSource };

export const SURFACE_STROKES: Record<DeskSurface, number> = { felt: 120000, paper: 23500 };

type PaintContext = Pick<CanvasRenderingContext2D,
  'fillStyle' | 'strokeStyle' | 'lineWidth' | 'fillRect' | 'createRadialGradient' |
  'beginPath' | 'moveTo' | 'quadraticCurveTo' | 'stroke'>;

// Pure painter so the same grain can run in a worker, on a fallback canvas,
// or against a stub context in tests. `detail` scales the strand count.
export function paintDeskSurface(
  ctx: PaintContext, surface: DeskSurface,
  width = 1024, height = 768, detail = 1,
) {
  let seed = 2397;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const wool = surface === 'felt';
  const scale = width / 1024;
  ctx.fillStyle = wool ? '#55503f' : '#decfae';
  ctx.fillRect(0, 0, width, height);
  // Soft clumps beneath individual strands break up the uniform digital grain.
  for (let i = 0; i < 560; i++) {
    const x = random()*width, y = random()*height, r = (9 + 67*random())*scale;
    const cloud = ctx.createRadialGradient(x,y,0,x,y,r);
    cloud.addColorStop(0, random()>.5 ? '#efe4c40a' : '#37372c08');
    cloud.addColorStop(1,'transparent');
    ctx.fillStyle = cloud; ctx.fillRect(x-r,y-r,2*r,2*r);
  }
  const strands = Math.round(SURFACE_STROKES[surface] * detail);
  for (let i = 0; i < strands; i++) {
    const x = random()*width, y = random()*height;
    const angle = random()*Math.PI + .48*Math.sin(x/70+y/180);
    const length = ((wool ? 1.8 : 2.4) + random()*(wool ? 9 : 16))*scale;
    const dx = length*Math.cos(angle), dy = length*Math.sin(angle);
    ctx.strokeStyle = random()>.48 ? (wool ? '#ebe8d32e' : '#fff7d52e') : (wool ? '#141b1838' : '#79644729');
    ctx.lineWidth = (.42 + random()*.72)*scale;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+dx*.5-dy*.17,y+dy*.5+dx*.17,x+dx,y+dy); ctx.stroke();
  }
}

let cached: Promise<DeskSurfaces> | null = null;

// Generating ~143k strands on the main thread froze the opening for a second.
// The worker keeps that work off the frame budget; older browsers get a
// lighter texture painted in two yielding passes instead.
export function loadDeskSurfaces(): Promise<DeskSurfaces> {
  if (!cached) {
    cached = (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
      ? workerSurfaces().catch(() => fallbackSurfaces())
      : fallbackSurfaces()
    ).catch(error => { cached = null; throw error; });
  }
  return cached;
}

function workerSurfaces() {
  return new Promise<DeskSurfaces>((resolve, reject) => {
    const worker = new Worker(new URL('./desk-texture.worker.ts', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('desk texture worker timed out')); }, 10000);
    worker.onmessage = ({ data }: MessageEvent<DeskSurfaces>) => {
      clearTimeout(timer); worker.terminate(); resolve(data);
    };
    worker.onerror = () => { clearTimeout(timer); worker.terminate(); reject(new Error('desk texture worker failed')); };
    worker.postMessage({ width: 1024, height: 768 });
  });
}

async function fallbackSurfaces(): Promise<DeskSurfaces> {
  const paint = (surface: DeskSurface) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 384;
    paintDeskSurface(canvas.getContext('2d')!, surface, 512, 384, .12);
    return canvas;
  };
  const felt = paint('felt');
  await new Promise(resolve => setTimeout(resolve, 0));
  return { felt, paper: paint('paper') };
}