import { formatAttribution } from '../domain/attribution';
import { getPlace, getWork, groupObjectsByDynasty } from '../domain/data';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';

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
  const { locale, strings } = useLocale();

  return (
    <div className="results">
      <div className="results__head">
        <h2 id="results-heading" className="pane__title">
          {strings.resultsHeading}
        </h2>
        <span className="results__count">{strings.resultsCount(objects.length, total)}</span>
      </div>

      <div className="search">
        <label className="visually-hidden" htmlFor="record-search">
          {strings.searchLabel}
        </label>
        <div className="search__field">
          <svg className="search__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12.8 12.8 17 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
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
            <button
              type="button"
              className="search__clear"
              onClick={() => onQueryChange('')}
              aria-label={strings.clearSearch}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {objects.length === 0 ? (
        <div className="results__empty">
          <p className="results__empty-text">
            {total === 0 ? strings.emptyCorpus : strings.noResults}
          </p>
          {query ? (
            <button type="button" className="button" onClick={() => onQueryChange('')}>
              {strings.clearSearch}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="results__list" aria-labelledby="results-heading">
          {groupObjectsByDynasty(objects).map((group) => {
            const heading = group.dynasty
              ? locale === 'zh'
                ? group.dynasty.zh
                : group.dynasty.en
              : strings.dynastyUnknown;
            return (
              <li key={group.dynasty?.id ?? 'unknown'} className="results__group">
                <h3 className="results__dynasty">
                  <span>{heading}</span>
                  <span className="results__dynasty-count">{group.objects.length}</span>
                </h3>
                <ul className="results__rows">
                  {group.objects.map((object) => {
                    const selected = object.id === selectedId;
                    const place = getPlace(object.currentCollection.placeId);
                    const work = getWork(object.workId);
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
                          <span className="result__type">
                            {strings.objectTypeLabels[object.objectType]}
                            {object.review.state === 'draft' ? (
                              <span className="result__draft">{strings.reviewDraft}</span>
                            ) : null}
                          </span>
                          <span className="result__zh" lang="zh-Hans">
                            {object.titles.zh}
                          </span>
                          <span className="result__en" lang="en">
                            {object.titles.en}
                          </span>
                          {work && work.attribution.length > 0 ? (
                            <span
                              className="result__author"
                              lang={locale === 'zh' ? 'zh-Hans' : undefined}
                            >
                              {formatAttribution(
                                work.attribution,
                                locale,
                                strings.attributionRoleShort,
                              )}
                            </span>
                          ) : null}
                          <span className="result__place">
                            {place
                              ? locale === 'zh'
                                ? place.names.zh
                                : place.names.en
                              : strings.noCoordinates}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
