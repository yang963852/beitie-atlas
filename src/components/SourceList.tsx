import { getSource } from '../domain/data';
import type { Source } from '../domain/types';
import { strings } from '../i18n/en';

function resolveSources(ids: string[]): Source[] {
  return ids.flatMap((id) => {
    const source = getSource(id);
    return source ? [source] : [];
  });
}

interface SourceListProps {
  ids: string[];
  label?: string;
  compact?: boolean;
}

/** Renders each source with its publisher, access date, and locator. */
export function SourceList({ ids, label, compact = false }: SourceListProps) {
  const sources = resolveSources(ids);
  if (sources.length === 0) return null;

  return (
    <div className={compact ? 'sources sources--compact' : 'sources'}>
      {label ? <p className="sources__label">{label}</p> : null}
      <ul className="sources__list">
        {sources.map((source) => (
          <li key={source.id}>
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
    </div>
  );
}
