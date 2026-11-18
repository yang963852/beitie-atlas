import type { ReactNode } from 'react';
import { attributionName, attributionNote } from '../domain/attribution';
import { formatCoordinate } from '../domain/coordinates';
import { getPlace, getWork } from '../domain/data';
import { compareDates, formatDate } from '../domain/dates';
import { dynastyLabel } from '../domain/dynasties';
import type { HistoricalDate, ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';
import { SourceList } from './SourceList';

/**
 * Picks the reader's language when the record carries it, otherwise the
 * language it was written in. Editorial prose is never machine-generated at
 * render time: a missing translation shows the recorded wording instead.
 */
export function pickText(
  locale: 'zh' | 'en',
  zh: string | null | undefined,
  en: string | null | undefined,
): string | null {
  if (locale === 'zh' && zh) return zh;
  return en ?? zh ?? null;
}

function DateLine({ date, locale }: { date: HistoricalDate; locale: 'zh' | 'en' }) {
  const { strings } = useLocale();
  return (
    <span className="date-value">
      <span className="date-value__main">{formatDate(date, locale)}</span>
      {date.original ? (
        <span className="date-value__original">
          {strings.sourceWording} <span lang="zh-Hans">{date.original}</span>
        </span>
      ) : null}
      {date.certainty === 'disputed' ? (
        <span className="tag tag--warn">{strings.certaintyLabels.disputed}</span>
      ) : null}
    </span>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="fact">
      <dt className="fact__term">{term}</dt>
      <dd className="fact__value">{children}</dd>
    </div>
  );
}

interface ObjectDetailProps {
  onShowMap?: () => void;
  object: ObjectRecord;
  /** Mobile only: returns to the list. Hidden at wider widths by CSS. */
  onBack?: () => void;
}

export function ObjectDetail({ object, onBack, onShowMap }: ObjectDetailProps) {
  const { locale, strings } = useLocale();
  const work = getWork(object.workId);
  const place = getPlace(object.currentCollection.placeId);
  const collection = object.currentCollection;

  const events = [...object.provenanceEvents].sort((a, b) => compareDates(a.date, b.date));
  const notes = locale === 'zh' && object.notesZh?.length ? object.notesZh : object.notes;

  const sourceIds = Array.from(
    new Set([
      ...collection.sourceRefs,
      ...(place?.coordinates?.sourceRefs ?? []),
      ...object.provenanceEvents.flatMap((event) => event.sourceRefs),
      ...(work?.sourceRefs ?? []),
    ]),
  );

  return (
    <article className="detail" aria-labelledby="detail-title">
      {onBack ? (
        <button type="button" className="backlink" onClick={onBack}>
          <span aria-hidden="true">←</span> {strings.backToRecords}
        </button>
      ) : null}

      <header className="detail__head">
        <p className="detail__eyebrow">
          <span className="badge">{strings.objectTypeLabels[object.objectType]}</span>
          <span
            className={
              object.review.state === 'draft' ? 'badge badge--draft' : 'badge badge--ok'
            }
          >
            {object.review.state === 'draft' ? strings.reviewDraft : strings.reviewReviewed}
          </span>
        </p>

        <h2 id="detail-title" className="detail__title" lang="zh-Hans">
          {object.titles.zh}
        </h2>
        <p className="detail__subtitle" lang="en">
          {object.titles.en}
        </p>

        {work ? (
          <p className="detail__work">
            <span className="detail__work-label">{strings.workLabel}</span>
            <span lang="zh-Hans">{work.titles.zh}</span>
            <span className="detail__attribution">
              {dynastyLabel(work.dynastyId, locale, work.dynastyQualifier)}
            </span>
          </p>
        ) : null}
      </header>

      <dl className="facts">
        <Fact term={strings.objectDateLabel}>
          <DateLine date={object.productionDate} locale={locale} />
        </Fact>
        {work ? (
          <Fact term={strings.workDateLabel}>
            <DateLine date={work.compositionDate} locale={locale} />
          </Fact>
        ) : null}
        {work ? (
          <Fact term={strings.dynastyFactLabel}>
            {dynastyLabel(work.dynastyId, locale, work.dynastyQualifier)}
          </Fact>
        ) : null}
        {object.catalogNumber ? (
          <Fact term={strings.catalogueLabel}>
            <span className="mono">{object.catalogNumber}</span>
          </Fact>
        ) : null}
        {object.dimensions ? (
          <Fact term={strings.dimensionsLabel}>
            <span lang="zh-Hans">{object.dimensions.raw}</span>
          </Fact>
        ) : null}
        <Fact term={strings.survivalLabel}>{strings.survivalLabels[object.survivalStatus]}</Fact>
      </dl>

      {work && work.attribution.length > 0 ? (
        <section className="section" aria-labelledby="attribution-heading">
          <h3 id="attribution-heading" className="section__heading">
            {strings.attributionHeading}
          </h3>
          <ul className="attribution">
            {work.attribution.map((entry, index) => {
              const note = attributionNote(entry, locale);
              return (
                <li className="attribution__item" key={`${entry.role}-${entry.name}-${index}`}>
                  {entry.role === 'unknown' ? null : (
                    <span className="attribution__role">
                      {strings.attributionRoleLabels[entry.role]}
                    </span>
                  )}
                  <span
                    className="attribution__name"
                    lang={locale === 'zh' ? 'zh-Hans' : undefined}
                  >
                    {attributionName(entry, locale)}
                  </span>
                  {entry.certainty === 'disputed' ? (
                    <span className="tag tag--warn">{strings.certaintyLabels.disputed}</span>
                  ) : null}
                  {note ? <span className="attribution__note">{note}</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="section" aria-labelledby="collection-heading">
        <h3 id="collection-heading" className="section__heading">
          {strings.collectionHeading}
        </h3>
        <p className="section__meta">{strings.locationKindLabels[collection.locationKind]}</p>

        {place ? (
          <p className="place">
            <span className="place__zh" lang="zh-Hans">
              {place.names.zh}
            </span>
            <span className="place__en" lang={locale === 'zh' ? 'en' : 'zh-Hans'}>
              {locale === 'zh' ? place.names.en : place.names.zh}
            </span>
          </p>
        ) : (
          <p className="section__empty">{strings.collectionNotStated}</p>
        )}

        {pickText(locale, collection.noteZh, collection.note) ? (
          <p className="section__note">
            {pickText(locale, collection.noteZh, collection.note)}
          </p>
        ) : null}

        <p className="section__meta">
          {strings.collectionChecked(collection.sourceAccessedAt)}
          {collection.assertionAsOf
            ? ` · ${strings.collectionAssertionAsOf(collection.assertionAsOf)}`
            : ''}
        </p>

        {place?.coordinates ? (
          <details className="disclosure">
            <summary className="disclosure__summary">{strings.coordinateDetails}</summary>
            <div className="disclosure__body">
              <p className="coord">
                <span className="mono">
                  {formatCoordinate(place.coordinates.longitude, place.coordinates.latitude)}
                </span>
                <span className="tag">
                  {strings.precisionLabel} {strings.precisionLabels[place.coordinates.precision]}
                </span>
                <span
                  className={
                    place.coordinates.verification === 'verified' ? 'tag tag--ok' : 'tag tag--warn'
                  }
                >
                  {place.coordinates.verification === 'verified'
                    ? strings.coordinateVerified
                    : strings.coordinateUnverified}
                </span>
              </p>
              {pickText(locale, place.coordinates.noteZh, place.coordinates.note) ? (
                <p className="section__note">
                  {pickText(locale, place.coordinates.noteZh, place.coordinates.note)}
                </p>
              ) : null}
              <SourceList
                ids={place.coordinates.sourceRefs}
                label={strings.coordinateSourceLabel}
                compact
              />
            </div>
          </details>
        ) : null}

        {onShowMap ? (
          <button type="button" className="link-button" onClick={onShowMap}>
            {strings.openInMap}
          </button>
        ) : null}
        <SourceList ids={collection.sourceRefs} compact />
      </section>

      <section className="section" aria-labelledby="provenance-heading">
        <h3 id="provenance-heading" className="section__heading">
          {strings.provenanceHeading}
        </h3>
        <p className="section__meta">{strings.provenanceIntro}</p>

        {events.length === 0 ? (
          <p className="section__empty">{strings.provenanceEmpty}</p>
        ) : (
          <ol className="timeline">
            {events.map((event) => {
              const eventPlace = getPlace(event.placeId);
              const summary = pickText(locale, event.summaryZh, event.summary);
              return (
                <li key={event.id} className="timeline__item">
                  <div className="timeline__marker" aria-hidden="true" />
                  <div className="timeline__body">
                    <div className="timeline__date">
                      <span className="timeline__date-main">{formatDate(event.date, locale)}</span>
                      {event.date.original ? (
                        <span className="timeline__date-original" lang="zh-Hans">
                          {event.date.original}
                        </span>
                      ) : null}
                    </div>
                    <p className="timeline__type">
                      {strings.eventTypeLabels[event.type]}
                      <span className="tag">{strings.certaintyLabels[event.certainty]}</span>
                    </p>
                    <p className="timeline__summary">{summary}</p>
                    <p className="timeline__place">
                      {event.placeWording ? (
                        <span lang="zh-Hans">{event.placeWording}</span>
                      ) : null}
                      {eventPlace ? (
                        <span className="timeline__place-en">
                          {event.placeWording ? ' · ' : ''}
                          {locale === 'zh' ? eventPlace.names.zh : eventPlace.names.en}
                        </span>
                      ) : null}
                      {!event.placeWording && !eventPlace ? strings.eventPlaceUnknown : null}
                    </p>
                    <SourceList ids={event.sourceRefs} compact />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {notes.length > 0 ? (
        <section className="section" aria-labelledby="notes-heading">
          <h3 id="notes-heading" className="section__heading">
            {strings.notesHeading}
          </h3>
          <ul className="notes">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section" aria-labelledby="sources-heading">
        <h3 id="sources-heading" className="section__heading">
          {strings.sourcesHeading}
        </h3>
        <SourceList ids={sourceIds} plain />
      </section>

      {pickText(locale, object.review.noteZh, object.review.note) ? (
        <p className="review-note">
          <strong>{strings.reviewNoteLabel}</strong>{' '}
          {pickText(locale, object.review.noteZh, object.review.note)}
        </p>
      ) : null}
    </article>
  );
}
