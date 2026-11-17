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
    <>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </>
  );
}

export function ObjectDetail({ object }: { object: ObjectRecord }) {
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
      <div className="detail__badges">
        <span className="badge">{strings.objectTypeLabels[object.objectType]}</span>
        <span className={object.review.state === 'draft' ? 'badge badge--draft' : 'badge badge--ok'}>
          {object.review.state === 'draft' ? strings.reviewDraft : strings.reviewReviewed}
        </span>
      </div>

      <h2 id="detail-title" className="detail__title-zh" lang="zh-Hans">
        {object.titles.zh}
      </h2>
      <p className="detail__title-en">{object.titles.en}</p>

      {work ? (
        <p className="detail__work">
          {strings.workLabel}: <span lang="zh-Hans">{work.titles.zh}</span> · {work.titles.en}
          {work.attribution.length > 0 ? (
            <span className="detail__attribution">
              {' '}
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
        <Fact term={strings.survivalLabel}>
          {strings.survivalLabels[object.survivalStatus]}
        </Fact>
      </dl>

      <section className="section" aria-labelledby="collection-heading">
        <h3 id="collection-heading" className="section__heading">
          {strings.collectionHeading}
        </h3>
        <p className="collection__kind">{strings.locationKindLabels[collection.locationKind]}</p>
        {place ? (
          <p className="collection__place">
            <span lang="zh-Hans">{place.names.zh}</span>
            <span className="collection__place-en">{place.names.en}</span>
          </p>
        ) : (
          <p className="empty">{strings.collectionNotStated}</p>
        )}
        {collection.note ? <p className="note">{collection.note}</p> : null}
        <p className="meta-line">{strings.collectionChecked(collection.sourceAccessedAt)}</p>
        {collection.assertionAsOf ? (
          <p className="meta-line">{strings.collectionAssertionAsOf(collection.assertionAsOf)}</p>
        ) : null}

        {place?.coordinates ? (
          <div className="coord">
            <p className="coord__value">
              <span className="coord__label">{strings.coordinateLabel}</span>{' '}
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
            {place.coordinates.note ? <p className="note">{place.coordinates.note}</p> : null}
            <SourceList
              ids={place.coordinates.sourceRefs}
              label={strings.coordinateSourceLabel}
              compact
            />
          </div>
        ) : null}

        <SourceList ids={collection.sourceRefs} />
      </section>

      <section className="section" aria-labelledby="provenance-heading">
        <h3 id="provenance-heading" className="section__heading">
          {strings.provenanceHeading}
        </h3>
        <p className="meta-line">{strings.provenanceIntro}</p>

        {events.length === 0 ? (
          <p className="empty">{strings.provenanceEmpty}</p>
        ) : (
          <ol className="timeline">
            {events.map((event) => {
              const eventPlace = getPlace(event.placeId);
              return (
                <li key={event.id} className="timeline__item">
                  <div className="timeline__marker" aria-hidden="true" />
                  <div className="timeline__date">
                    <span className="timeline__date-main">{formatDate(event.date)}</span>
                    {event.date.original ? (
                      <span className="timeline__date-original" lang="zh-Hans">
                        {event.date.original}
                      </span>
                    ) : null}
                  </div>
                  <div className="timeline__body">
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
                    <SourceList
                      ids={event.sourceRefs}
                      label={strings.eventSourcesLabel}
                      compact
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {object.notes.length > 0 ? (
        <section className="section" aria-labelledby="notes-heading">
          <h3 id="notes-heading" className="section__heading">
            {strings.notesHeading}
          </h3>
          <ul className="notes">
            {object.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section" aria-labelledby="sources-heading">
        <h3 id="sources-heading" className="section__heading">
          {strings.sourcesHeading}
        </h3>
        <SourceList ids={sourceIds} />
      </section>

      {object.review.note ? (
        <p className="review-note">
          <strong>{strings.reviewNoteLabel}:</strong> {object.review.note}
        </p>
      ) : null}
    </article>
  );
}
