import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocale } from '../i18n';
import { isReleaseBuild } from '../domain/build';
import { EDITION_LABEL } from '../domain/version';
import type { createClassroom } from './classroom-scene';
import { LocaleSwitch } from './LocaleSwitch';
import './opening-desk.css';

export function OpeningDesk({ enter, openPlate }: { enter: () => void; openPlate: () => void }) {
  const { strings, locale } = useLocale();
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createClassroom> | null>(null);
  const [phase, setPhase] = useState<'poster' | 'approach' | 'desk'>('poster');
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const entering = useRef(false);
  const finish = () => {
    if (!entering.current) return;
    entering.current = false;
    if (origin && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // Carry the opaque frame across the React route change, then reveal the timeline.
      const curtain = document.createElement('div');
      curtain.className = 'desk__reveal';
      curtain.setAttribute('aria-hidden', 'true');
      document.body.appendChild(curtain);
      const remove = () => curtain.remove();
      curtain.addEventListener('animationend', remove, { once: true });
      window.setTimeout(remove, 800);
    }
    enter();
    scene.current?.reset();
    setOrigin(null);
  };

  useEffect(() => {
    const element = canvas.current;
    if (!element || !window.WebGL2RenderingContext || !window.IntersectionObserver) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, visible = false, loading = false, failed = false;
    // Warm the three chunk, decoded plates and painted surfaces while the
    // poster is still on screen, so the approach starts without a load stall.
    const warm = () => {
      if (disposed || motion.matches) return;
      void import('./classroom-scene').then(module => module.loadDeskAssets()).catch(() => {});
    };
    const idle = typeof window.requestIdleCallback === 'function';
    const warmHandle = idle ? window.requestIdleCallback(warm, { timeout: 1500 }) : window.setTimeout(warm, 350);
    function release() {
      scene.current?.dispose(); scene.current = null;
      setPhase('poster');
    }
    async function update() {
      if (motion.matches) { release(); return; }
      if (scene.current) { scene.current.visibility(visible); return; }
      if (!visible || loading || failed || entering.current) return;
      loading = true;
      setPhase('approach');
      try {
        const { createClassroom, loadDeskAssets } = await import('./classroom-scene');
        if (disposed || motion.matches || !visible || entering.current) return;
        const assets = await loadDeskAssets();
        if (disposed || motion.matches || !visible || entering.current) return;
        scene.current = createClassroom(element!, () => setPhase('desk'), assets);
      } catch { failed = true; release(); }
      finally { loading = false; }
    }
    function lost(event: Event) { event.preventDefault(); failed = true; release(); }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; void update(); });
    observer.observe(element);
    element.addEventListener('webglcontextlost', lost);
    motion.addEventListener('change', update);
    return () => {
      disposed = true; observer.disconnect(); motion.removeEventListener('change', update);
      if (idle) window.cancelIdleCallback(warmHandle); else window.clearTimeout(warmHandle);
      element.removeEventListener('webglcontextlost', lost);
      scene.current?.dispose(); scene.current = null;
    };
  }, []);

  useEffect(() => {
    if (!origin) return;
    const timer = window.setTimeout(finish, 3300);
    return () => window.clearTimeout(timer);
  }, [origin]);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (entering.current) return;
    entering.current = true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    setOrigin(scene.current?.strike() ?? { x: 50, y: 50 });
  }
  return (
    <section className="desk" data-scene={phase} data-entering={Boolean(origin)} aria-labelledby="opening-title">
      <canvas ref={canvas} className="desk__scene" aria-hidden="true" />
      <div className="desk__library">
        {!isReleaseBuild && <span>{EDITION_LABEL[locale]}</span>}
        <LocaleSwitch className="langswitch langswitch--desk" />
        <a href="#/library"><span className="desk__seal" aria-hidden="true">碑</span>{locale === 'zh' ? '读帖' : 'Reading room'}</a>
      </div>
      <a className="desk__credit" href="#/object/witness-lanting" onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openPlate();
      }}>
        {locale === 'zh' ? '帖影 · 兰亭序神龙本（局部）' : 'Plate · Shenlong copy (detail)'}
      </a>
      <h1 id="opening-title">
        <a className="desk__paper" href="#catalogue" onClick={open}>
          <span className="desk__words"><span>{strings.taglineLead}</span><span>{strings.tagline}</span></span>
          <span className="visually-hidden">{strings.enterCatalogue}</span>
        </a>
      </h1>
      {origin && <>
        {phase === 'poster' && <i className="desk__ink" aria-hidden="true" style={{ left: origin.x + '%', top: origin.y + '%' }} />}
        <div className="desk__veil" aria-hidden="true" onAnimationEnd={finish} />
      </>}
    </section>
  );
}
