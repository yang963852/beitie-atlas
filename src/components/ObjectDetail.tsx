import type { ReactNode } from 'react';
import { formatCoordinate } from '../domain/coordinates';
import { getPlace, getWork } from '../domain/data';
import { compareDates, formatDate } from '../domain/dates';
import type { HistoricalDate, ObjectRecord } from '../domain/types';
import { strings } from '../i18n/en';
import { SourceList } from './SourceList';

function DateLine({ date }: { date: HistoricalDate }) {
  return (
    <span className="date-value">
      <span className="date-value__main">{formatDate(date)}</span>
      {date.original ? (
        <span className="date-value__original">
          {strings.sourceWording}: <span lang="zh-Hans">{date.original}</span>
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
  object: ObjectRecord;
  /** Mobile only: returns to the list. Hidden at wider widths by CSS. */
  onBack?: () => void;
}

export function ObjectDetail({ object, onBack }: ObjectDetailProps) {
  const work = getWork(object.workId);
  const place = getPlace(object.currentCollection.placeId);
  const collection = object.currentCollection;

  const events = [...object.provenanceEvents].sort((a, b) => compareDates(a.date, b.date));

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

      <p className="detail__eyebrow">
        <span>{strings.objectTypeLabels[object.objectType]}</span>
        <span aria-hidden="true">·</span>
        <span className={object.review.state === 'draft' ? 'state state--draft' : 'state state--ok'}>
          {object.review.state === 'draft' ? strings.reviewDraft : strings.reviewReviewed}
        </span>
      </p>

      <h2 id="detail-title" className="detail__title" lang="zh-Hans">
        {object.titles.zh}
      </h2>
      <p className="detail__subtitle">{object.titles.en}</p>

      {work ? (
        <p className="detail__work">
          <span className="detail__work-label">{strings.workLabel}</span>
          <span lang="zh-Hans">{work.titles.zh}</span>
          <span className="detail__work-en">· {work.titles.en}</span>
          {work.attribution.length > 0 ? (
            <span className="detail__attribution">
              · {work.attribution.map((entry) => entry.name).join('、')}
            </span>
          ) : null}
        </p>
      ) : null}

      <dl className="facts">
        <Fact term={strings.objectDateLabel}>
          <DateLine date={object.productionDate} />
        </Fact>
        {work ? (
          <Fact term={strings.workDateLabel}>
            <DateLine date={work.compositionDate} />
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
            {object.dimensions.note ? <span className="fact__note">{object.dimensions.note}</span> : null}
          </Fact>
        ) : null}
        <Fact term={strings.survivalLabel}>{strings.survivalLabels[object.survivalStatus]}</Fact>
      </dl>

      <section className="block" aria-labelledby="collection-heading">
        <h3 id="collection-heading" className="block__title">
          {strings.collectionHeading}
        </h3>
        <p className="block__meta">{strings.locationKindLabels[collection.locationKind]}</p>
        {place ? (
          <p className="place">
            <span className="place__zh" lang="zh-Hans">
              {place.names.zh}
            </span>
            <span className="place__en">{place.names.en}</span>
          </p>
        ) : (
          <p className="muted">{strings.collectionNotStated}</p>
        )}
        {collection.note ? <p className="block__note">{collection.note}</p> : null}
        <p className="block__foot">
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
                <span className="tag">{place.coordinates.precision}</span>
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
              {place.coordinates.note ? <p className="block__note">{place.coordinates.note}</p> : null}
              <SourceList
                ids={place.coordinates.sourceRefs}
                label={strings.coordinateSourceLabel}
                compact
              />
            </div>
          </details>
        ) : null}

        <SourceList ids={collection.sourceRefs} compact />
      </section>

      <section className="block" aria-labelledby="provenance-heading">
        <h3 id="provenance-heading" className="block__title">
          {strings.provenanceHeading}
        </h3>
        <p className="block__meta">{strings.provenanceIntro}</p>

        {events.length === 0 ? (
          <p className="muted">{strings.provenanceEmpty}</p>
        ) : (
          <ol className="timeline">
            {events.map((event) => {
              const eventPlace = getPlace(event.placeId);
              return (
                <li key={event.id} className="timeline__item">
                  <div className="timeline__marker" aria-hidden="true" />
                  <div className="timeline__body">
                    <div className="timeline__date">
                      <span className="timeline__date-main">{formatDate(event.date)}</span>
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
                    <p className="timeline__summary">{event.summary}</p>
                    <p className="timeline__place">
                      {event.placeWording ? (
                        <span lang="zh-Hans">{event.placeWording}</span>
                      ) : null}
                      {eventPlace ? (
                        <span className="timeline__place-en">
                          {event.placeWording ? ' · ' : ''}
                          {eventPlace.names.en}
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

      {object.notes.length > 0 ? (
        <section className="block" aria-labelledby="notes-heading">
          <h3 id="notes-heading" className="block__title">
            {strings.notesHeading}
          </h3>
          <ul className="notes">
            {object.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="block" aria-labelledby="sources-heading">
        <h3 id="sources-heading" className="block__title">
          {strings.sourcesHeading}
        </h3>
        <SourceList ids={sourceIds} plain />
      </section>

      {object.review.note ? (
        <p className="review-note">
          <strong>{strings.reviewNoteLabel}:</strong> {object.review.note}
        </p>
      ) : null}
    </article>
  );
}
