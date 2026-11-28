import { describe, expect, it } from 'vitest';
import { paintDeskSurface, SURFACE_STROKES } from '../src/components/classroom-textures';

// jsdom has no 2D canvas backend, so the painter is exercised against a stub
// context that counts draw calls. The regression: strand counts must scale
// with `detail` so the low-power fallback stays off the frame budget.
function stubContext() {
  const calls = { stroke: 0, fillRect: 0 };
  const gradient = { addColorStop() {} };
  const ctx = {
    fillStyle: '' as string | CanvasGradient,
    strokeStyle: '',
    lineWidth: 0,
    fillRect() { calls.fillRect++; },
    createRadialGradient: () => gradient,
    beginPath() {},
    moveTo() {},
    quadraticCurveTo() {},
    stroke() { calls.stroke++; },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe('paintDeskSurface', () => {
  it('paints the full strand counts at detail 1', () => {
    const felt = stubContext(), paper = stubContext();
    paintDeskSurface(felt.ctx, 'felt');
    paintDeskSurface(paper.ctx, 'paper');
    expect(felt.calls.stroke).toBe(SURFACE_STROKES.felt);
    expect(paper.calls.stroke).toBe(SURFACE_STROKES.paper);
    // One base coat plus 560 soft clumps.
    expect(felt.calls.fillRect).toBe(561);
  });

  it('scales strand counts with detail for the fallback path', () => {
    const { ctx, calls } = stubContext();
    paintDeskSurface(ctx, 'felt', 512, 384, .12);
    expect(calls.stroke).toBe(Math.round(SURFACE_STROKES.felt * .12));
    expect(calls.stroke).toBeLessThan(SURFACE_STROKES.felt / 5);
  });
});