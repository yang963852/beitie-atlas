import { getPlace } from '../domain/data';
import { compareDates, formatDate } from '../domain/dates';
import { pickText } from '../domain/text';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';
import { SourceList } from './SourceList';

export function ProvenanceEvents({ object }: { object: ObjectRecord }) {
  const { locale, strings } = useLocale();
  const events = [...object.provenanceEvents].sort((a, b) => compareDates(a.date, b.date));
  return (
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
              const referencePlace = getPlace(event.referencePlaceId ?? null);
              const summary = pickText(locale, event.summaryZh, event.summary);
              const mainDate = formatDate(event.date, locale);
              return (
                <li key={event.id} className="timeline__item">
                  <div className="timeline__marker" aria-hidden="true" />
                  <div className="timeline__body">
                    <div className="timeline__date">
                      <span className="timeline__date-main">{mainDate}</span>
                      {event.date.original && event.date.original !== mainDate ? (
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
                    {referencePlace ? (
                      <p className="timeline__reference">
                        {locale === 'zh' ? '今日参照' : 'Reference today'}：{locale === 'zh' ? referencePlace.names.zh : referencePlace.names.en}
                        {pickText(locale, event.referenceNoteZh, event.referenceNote) ? ' · ' + pickText(locale, event.referenceNoteZh, event.referenceNote) : ''}
                      </p>
                    ) : null}
                    <SourceList ids={event.sourceRefs} compact />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
  );
}
