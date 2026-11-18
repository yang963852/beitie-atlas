import { getPlace, groupObjectsByDynasty } from '../domain/data';
import type { ObjectRecord, StudyFilter } from '../domain/types';
import { useLocale, type Strings } from '../i18n';

interface ResultsListProps {
  objects: ObjectRecord[];
  total: number;
  selectedId: string | null;
  category: StudyFilter;
  onCategoryChange: (value: StudyFilter) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
}

/**
 * One row, one object, two facts: what it is called and where the record says
 * it is. Everything else — type, period, attribution, dates, provenance —
 * belongs to the record pane, which is one click away.
 */
function placeLine(object: ObjectRecord, locale: 'zh' | 'en', strings: Strings) {
  const place = getPlace(object.currentCollection.placeId);
  if (!place) return strings.placeNotRecorded;
  const name = locale === 'zh' ? place.names.zh : place.names.en;
  return object.currentCollection.locationKind === 'last-known'
    ? strings.lastKnownPlace(name)
    : name;
}

export function ResultsList({
  objects,
  total,
  selectedId,
  query,
  onQueryChange,
  category,
  onCategoryChange,
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

      <div className="study-filter" role="group" aria-label={strings.studyFilter}>
        {(['all', 'bei', 'tie'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={category === value}
            onClick={() => onCategoryChange(value)}>
            {strings.studyLabels[value]}
          </button>
        ))}
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
                          <span
                            className="result__zh"
                            lang={locale === 'zh' ? 'zh-Hans' : 'en'}
                          >
                            {locale === 'zh' ? object.titles.zh : object.titles.en}
                          </span>
                          <span className="result__place">{placeLine(object, locale, strings)}</span>
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
