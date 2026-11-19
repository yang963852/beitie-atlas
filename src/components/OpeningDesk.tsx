import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocale } from '../i18n';
import './opening-desk.css';

export function OpeningDesk({ enter }: { enter: () => void }) {
  const { strings } = useLocale();
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const entering = useRef(false);
  const finish = () => {
    if (!entering.current) return;
    entering.current = false;
    enter();
    setOrigin(null);
  };

  useEffect(() => {
    if (!origin) return;
    // Also complete if a browser suppresses the CSS animation while backgrounded.
    const timer = window.setTimeout(finish, 1250);
    return () => window.clearTimeout(timer);
  }, [origin]);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (entering.current) return;
    entering.current = true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin(event.detail === 0 ? { x: 50, y: 50 } : {
      x: 100 * (event.clientX - rect.left) / rect.width,
      y: 100 * (event.clientY - rect.top) / rect.height,
    });
  }

  return (
    <section className="desk" data-entering={Boolean(origin)} aria-labelledby="opening-title">
      <div className="desk__scroll">
        <h1 id="opening-title">
          <a className="desk__paper" href="#catalogue" onClick={open} aria-label={strings.enterCatalogue}>
            <span className="desk__words"><span>{strings.taglineLead}</span><span>{strings.tagline}</span></span>
            {origin && <i className="desk__ink" aria-hidden="true" style={{ left: origin.x + '%', top: origin.y + '%' }} />}
          </a>
        </h1>
        <i className="desk__roller desk__roller--left" aria-hidden="true" />
        <i className="desk__roller desk__roller--right" aria-hidden="true" />
      </div>
      {origin && <div className="desk__veil" aria-hidden="true" onAnimationEnd={finish} />}
    </section>
  );
}
