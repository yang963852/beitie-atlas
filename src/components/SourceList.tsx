import { getSource } from '../domain/data';
import type { Source } from '../domain/types';
import { useStrings } from '../i18n';

function resolveSources(ids: string[]): Source[] {
  // The same source can support a collection assertion and an event; render it
  // once. Duplicate React keys here would drop a citation silently.
  const seen = new Set<string>();
  return ids.flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    const source = getSource(id);
    return source ? [source] : [];
  });
}

interface SourceListProps {
  ids: string[];
  /** Replaces the default "Sources (N)" control text. */
  label?: string;
  compact?: boolean;
  /** Show the citations directly, used by the record bibliography. */
  plain?: boolean;
  /** Start a disclosure expanded. */
  open?: boolean;
}

/**
 * Renders each source with its publisher, access date, and locator.
 *
 * Inline claims use a "Sources (N)" disclosure so the evidence stays one action
 * away without crowding the record; the bibliography renders the list directly.
 */
export function SourceList({ ids, label, compact = false, plain = false, open = false }: SourceListProps) {
  const strings = useStrings();
  const sources = resolveSources(ids);
  if (sources.length === 0) return null;

  const heading = label ? `${label}（${sources.length}）` : strings.sourcesControl(sources.length);
  const className = compact ? 'sources sources--compact' : 'sources';

  const list = (
    <ul className="sources__list">
      {sources.map((source) => (
        <li key={source.id} className="sources__item">
          <a className="sources__link" href={source.url} target="_blank" rel="noreferrer noopener">
            {source.title}
          </a>
          <span className="sources__meta">
            {' '}
            — {source.publisher}
            {source.publicationDate ? `, ${source.publicationDate}` : ''} ·{' '}
            {strings.sourceAccessed(source.accessedAt)}
          </span>
          {source.locator ? (
            <span className="sources__locator">
              {strings.sourceLocator}: {source.locator}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );

  if (plain) {
    return (
      <div className={className}>
        {label ? <p className="sources__label">{label}</p> : null}
        {list}
      </div>
    );
  }

  return (
    <details className={`${className} sources--disclosure`} open={open}>
      <summary className="sources__summary">{heading}</summary>
      {list}
    </details>
  );
}
