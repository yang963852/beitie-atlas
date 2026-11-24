import type { ReactNode } from 'react';
import { attributionName, attributionNote } from '../domain/attribution';
import { formatCoordinate } from '../domain/coordinates';
import { getPlace, getWork } from '../domain/data';
import { formatDate } from '../domain/dates';
import { dynastyLabel } from '../domain/dynasties';
import type { Claim, HistoricalDate, ObjectRecord, Place, Work } from '../domain/types';
import { detectLang, pickText } from '../domain/text';
import { useLocale } from '../i18n';
import { isReleaseBuild } from '../domain/build';
import { YanQinliStory } from './YanQinliStory';
import { ProvenanceEvents } from './ProvenanceEvents';
import { SourceList } from './SourceList';

const github = 'https://github.com/yang963852/beitie-atlas';

type NoteScope = 'object' | 'work' | 'place';

interface EditorialNote {
  text: string;
  /** The language the sentence is written in, for `lang` and screen readers. */
  lang: 'zh-Hans' | 'en';
  /** Which record the sentence belongs to, so a repeated gap is explicable. */
  scope: NoteScope;
}

interface NoteGroup {
  scope: NoteScope;
  rows: EditorialNote[];
}

/**
 * Object, work and place notes belong in the same editorial section: all three
 * state what a record does not establish, and hiding any of them lets the corpus
 * look more complete than it is. They stay grouped by the record they describe —
 * otherwise a reader cannot tell why two layers both say "no coordinate".
 *
 * A note is paired with its translation only when the two arrays line up. A
 * half-finished translation therefore falls back to the recorded wording
 * instead of attaching the wrong sentence to a note.
 */
function editorialNotes(
  locale: 'zh' | 'en',
  object: ObjectRecord,
  work: Work | undefined,
  place: Place | undefined,
): NoteGroup[] {
  const groups: NoteGroup[] = [];

  const append = (
    scope: NoteScope,
    notes: string[] | undefined,
    notesZh: string[] | undefined,
  ) => {
    if (!notes || notes.length === 0) return;
    const aligned = notesZh && notesZh.length === notes.length ? notesZh : null;
    groups.push({
      scope,
      rows: notes.map((note, index) => {
        const translated = aligned?.[index];
        return locale === 'zh' && translated
          ? { text: translated, lang: 'zh-Hans' as const, scope }
          : { text: note, lang: 'en' as const, scope };
      }),
    });
  };

  append('object', object.notes, object.notesZh);
  append('work', work?.notes, work?.notesZh);
  // The place record carries its own caveats, usually about a missing point or
  // an unresolved identity; they were invisible before this was added.
  append('place', place?.notes, place?.notesZh);
  return groups;
}

function DateLine({ date, locale }: { date: HistoricalDate; locale: 'zh' | 'en' }) {
  const { strings } = useLocale();
  return (
    <span className="date-value">
      <span className="date-value__main">{formatDate(date, locale)}</span>
      {date.meaning ? <span className="tag">{strings.dateMeaningLabels[date.meaning]}</span> : null}
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

function ClaimSection({ claims }: { claims?: Claim[] }) {
  const { locale, strings } = useLocale();
  if (!claims?.length) return null;
  return <section className="section" aria-labelledby="claims-heading">
    <h3 id="claims-heading" className="section__heading">{strings.claimsHeading}</h3>
    <ul className="claims">
      {claims.map((claim) => {
        const note = locale === 'zh' ? claim.noteZh ?? claim.note : claim.note;
        return <li key={claim.id}>
          <p><strong>{claim.value}</strong> <span className="tag">{strings.claimKindLabels[claim.kind]}</span> <span className="tag">{strings.claimStanceLabels[claim.stance]}</span></p>
          {claim.voice ? <p className="section__meta">{locale === 'zh' ? '说法' : 'Voice'}：{claim.voice}{claim.locator ? ' · ' + claim.locator : ''}</p> : null}
          {note ? <p className="section__note">{note}</p> : null}
          <SourceList ids={claim.sourceRefs} compact />
        </li>;
      })}
    </ul>
  </section>;
}

interface ObjectDetailProps {
  onJourney?: () => void;
  onShowMap?: () => void;
  /** Opens the contribution form, prefilled with this record. */
  onContribute?: () => void;
  object: ObjectRecord;
  /** Mobile only: returns to the list. Hidden at wider widths by CSS. */
  onBack?: () => void;
}

export function ObjectDetail({ object, onBack, onShowMap, onContribute, onJourney }: ObjectDetailProps) {
  const { locale, strings } = useLocale();
  const work = getWork(object.workId);
  const background = locale === 'zh' ? work?.backgroundZh ?? work?.background : work?.background;
  const place = getPlace(object.currentCollection.placeId);
  const collection = object.currentCollection;


  const notes = editorialNotes(locale, object, work, place);

  const sourceIds = Array.from(
    new Set([
      ...collection.sourceRefs,
      ...(place?.coordinates?.sourceRefs ?? []),
      ...object.provenanceEvents.flatMap((event) => event.sourceRefs),
      ...(work?.sourceRefs ?? []),
      ...(object.attribution ?? []).flatMap((entry) => entry.sourceRefs),
      ...(object.version?.sourceRefs ?? []),
      ...(object.claims ?? []).flatMap((claim) => claim.sourceRefs),
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
            <a href={'#/work/' + work.id} lang="zh-Hans">{work.titles.zh}</a>
            <span className="detail__attribution">{work.attribution
              .filter((entry) => entry.role === 'calligrapher' || entry.role === 'author-and-calligrapher')
              .map((entry) => attributionName(entry, locale)).join(' · ')}</span>
          </p>
        ) : null}
        <a className="link-button" href={github + '/edit/main/knowledge/objects/' + object.id + '.md'}>
          {locale === 'zh' ? '编辑这件实物的源稿' : 'Edit this object record'}
        </a>
      </header>

      {onJourney && <button className="button" onClick={onJourney}>{locale === 'zh' ? '在地图上看原石流传 →' : 'Explore the stone’s journey →'}</button>}
      {!isReleaseBuild && <YanQinliStory key={object.id} objectId={object.id} />}

      <dl className="facts">
        <Fact term={locale === 'zh' ? '书体' : 'Script'}>{work?.script ?? (locale === 'zh' ? '未知' : 'Unknown')}</Fact>
        <Fact term={strings.locationKindLabels[collection.locationKind]}>{place ? pickText(locale, place.names.zh, place.names.en) : strings.collectionNotStated}</Fact>
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
          <Fact term={strings.catalogueLabel}>
            <span className="mono">{object.catalogNumber ?? (locale === 'zh' ? '未知' : 'Unknown')}</span>
          </Fact>
          <Fact term={strings.dimensionsLabel}>
            {object.dimensions?.raw ?? (locale === 'zh' ? '未知' : 'Unknown')}
          </Fact>
        <Fact term={strings.survivalLabel}>{strings.survivalLabels[object.survivalStatus]}</Fact>
      </dl>

      {/* The work record has always carried a background sentence; no view
          rendered it, which made recorded prose dead data. It is shown as
          written, with its own language, rather than translated at render. */}
      {background ? (
        <section className="section" aria-labelledby="background-heading">
          <h3 id="background-heading" className="section__heading">
            {strings.backgroundHeading}
          </h3>
          <p className="section__prose" lang={detectLang(background)}>
            {background}
          </p>
          {detectLang(background) !== (locale === 'zh' ? 'zh-Hans' : 'en') ? (
            <p className="section__meta">{strings.backgroundLanguageNote}</p>
          ) : null}
        </section>
      ) : null}

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

      {object.attribution && object.attribution.length > 0 ? (
        <section className="section" aria-labelledby="object-attribution-heading">
          <h3 id="object-attribution-heading" className="section__heading">{strings.objectAttributionHeading}</h3>
          <ul className="attribution">
            {object.attribution.map((entry, index) => {
              const note = attributionNote(entry, locale);
              return <li className="attribution__item" key={`${entry.role}-${entry.name}-${index}`}>
                <span className="attribution__role">{strings.attributionRoleLabels[entry.role]}</span>
                <span className="attribution__name" lang={locale === 'zh' ? 'zh-Hans' : undefined}>{attributionName(entry, locale)}</span>
                {entry.certainty === 'disputed' ? <span className="tag tag--warn">{strings.certaintyLabels.disputed}</span> : null}
                {note ? <span className="attribution__note">{note}</span> : null}
                <SourceList ids={entry.sourceRefs} compact />
              </li>;
            })}
          </ul>
        </section>
      ) : null}

      {object.version ? (
        <section className="section" aria-labelledby="version-heading">
          <h3 id="version-heading" className="section__heading">{strings.versionHeading}</h3>
          <p><strong>{object.version.label}</strong></p>
          {object.version.basis ? <p className="section__meta">{strings.versionBasisLabel}：{object.version.basis}</p> : null}
          {pickText(locale, object.version.noteZh, object.version.note) ? <p className="section__note">{pickText(locale, object.version.noteZh, object.version.note)}</p> : null}
          <SourceList ids={object.version.sourceRefs} compact />
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

      <ProvenanceEvents object={object} />

      <ClaimSection claims={object.claims} />

      {notes.length > 0 ? (
        <details className="section detail-fold">
          <summary className="section__heading">
            {strings.notesHeading}
          </summary>
          <div className="notes">
            {notes.map((group) => (
              <div key={group.scope} className="notes__group">
                <p className="notes__scope">{strings.notesScopes[group.scope]}</p>
                <ul className="notes__list">
                  {group.rows.map((note, index) => (
                    <li key={`${index}-${note.lang}`} lang={note.lang}>
                      {note.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <details className="section detail-fold">
        <summary className="section__heading">
          {strings.sourcesHeading}
        </summary>
        <SourceList ids={sourceIds} plain />
      </details>

      {onContribute ? (
        <div className="detail__actions">
          <button type="button" className="button" onClick={onContribute}>
            {strings.contributeAction}
          </button>
        </div>
      ) : null}

      {pickText(locale, object.review.noteZh, object.review.note) ? (
        <p className="review-note">
          <strong>{strings.reviewNoteLabel}</strong>{' '}
          {pickText(locale, object.review.noteZh, object.review.note)}
        </p>
      ) : null}
    </article>
  );
}
