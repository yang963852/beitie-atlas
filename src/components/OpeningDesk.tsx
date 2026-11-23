import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocale } from '../i18n';
import { isReleaseBuild } from '../domain/build';
import type { createClassroom } from './classroom-scene';
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
    enter();
    scene.current?.reset();
    setOrigin(null);
  };

  useEffect(() => {
    const element = canvas.current;
    if (!element || !window.WebGL2RenderingContext || !window.IntersectionObserver) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, visible = false, loading = false, failed = false;
    function release() {
      scene.current?.dispose(); scene.current = null;
      setPhase('poster');
    }
    async function update() {
      if (motion.matches) { release(); return; }
      if (scene.current) { scene.current.visibility(visible); return; }
      if (!visible || loading || failed || entering.current) return;
      loading = true;
      try {
        const { createClassroom, loadDeskImages } = await import('./classroom-scene');
        if (disposed || motion.matches || !visible || entering.current) return;
        const images = await loadDeskImages();
        if (disposed || motion.matches || !visible || entering.current) return;
        setPhase('approach');
        scene.current = createClassroom(element!, () => setPhase('desk'), images);
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
      element.removeEventListener('webglcontextlost', lost);
      scene.current?.dispose(); scene.current = null;
    };
  }, []);

  useEffect(() => {
    if (!origin) return;
    const timer = window.setTimeout(finish, 2600);
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
        {!isReleaseBuild && <span>{locale === 'zh' ? '内部测试第一版' : 'Internal beta 1'}</span>}
        <a href="#/library">{locale === 'zh' ? '读作品与书家 →' : 'Read works and calligraphers →'}</a>
      </div>
      <a className="desk__credit" href="#/object/witness-lanting" onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openPlate();
      }}>
        {locale === 'zh' ? '帖影 · 兰亭序神龙本（局部）' : 'Plate · Shenlong copy (detail)'}
      </a>
      <h1 id="opening-title">
        <a className="desk__paper" href="#catalogue" onClick={open} aria-label={strings.enterCatalogue}>
          <span className="desk__words"><span>{strings.taglineLead}</span><span>{strings.tagline}</span></span>
        </a>
      </h1>
      {origin && <>
        {phase === 'poster' && <i className="desk__ink" aria-hidden="true" style={{ left: origin.x + '%', top: origin.y + '%' }} />}
        <div className="desk__veil" aria-hidden="true" onAnimationEnd={finish} />
      </>}
    </section>
  );
}
