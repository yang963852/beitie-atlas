import { getPlace } from '../domain/data';
import type { ObjectRecord } from '../domain/types';
import { strings } from '../i18n/en';

interface ResultsListProps {
  objects: ObjectRecord[];
  total: number;
  selectedId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
}

export function ResultsList({
  objects,
  total,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: ResultsListProps) {
  return (
    <div className="results">
      <div className="results__head">
        <h2 id="results-heading" className="panel__heading">
          {strings.resultsHeading}
        </h2>
        <span className="results__count">{strings.resultsCount(objects.length, total)}</span>
      </div>

      <div className="search">
        <label className="search__label" htmlFor="record-search">
          {strings.searchLabel}
        </label>
        <div className="search__row">
          <input
            id="record-search"
            className="search__input"
            type="search"
            value={query}
            placeholder={strings.searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
            autoComplete="off"
          />
          {query ? (
            <button type="button" className="button button--quiet" onClick={() => onQueryChange('')}>
              {strings.clearSearch}
            </button>
          ) : null}
        </div>
      </div>

      {objects.length === 0 ? (
        <p className="empty">{total === 0 ? strings.emptyCorpus : strings.noResults}</p>
      ) : (
        <ul className="results__list" aria-labelledby="results-heading">
          {objects.map((object) => {
            const selected = object.id === selectedId;
            const place = getPlace(object.currentCollection.placeId);
            return (
              <li key={object.id}>
                <a
                  className={selected ? 'result result--selected' : 'result'}
                  href={`#/object/${object.id}`}
                  aria-current={selected ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelect(object.id);
                  }}
                >
                  <span className="result__type">{strings.objectTypeLabels[object.objectType]}</span>
                  <span className="result__zh" lang="zh-Hans">
                    {object.titles.zh}
                  </span>
                  <span className="result__en">{object.titles.en}</span>
                  <span className="result__place">
                    {place ? place.names.en : strings.noCoordinates}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
