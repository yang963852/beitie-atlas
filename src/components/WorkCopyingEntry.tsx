import { useId, type MouseEvent } from 'react';
import { getPlace } from '../domain/data';
import { formatDate } from '../domain/dates';
import { findEntry, libraryHref, noteDisplayTitle, type LibraryEntry } from '../domain/library';
import type { KnowledgeArticle } from '../domain/knowledge';
import type { DateCertainty, ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';

export interface CopyingPerson {
  entry: LibraryEntry;
  certainty: DateCertainty;
}

/** Only authored close readings explicitly linked to this work enter the card. */
export function copyingNotesFor(workId: string, articles: KnowledgeArticle[]): KnowledgeArticle[] {
  return articles.filter((article) =>
    article.kind === 'notes' && article.category === 'close-reading' && article.works.includes(workId));
}

/** A name becomes a person link only when the attribution has a resolvable page. */
export function copyingPeopleFor(entry: LibraryEntry): CopyingPerson[] {
  const people: CopyingPerson[] = [];
  const seen = new Set<string>();
  for (const credit of entry.work?.attribution ?? []) {
    if (credit.role !== 'calligrapher' && credit.role !== 'author-and-calligrapher') continue;
    if (!credit.personId || seen.has(credit.personId)) continue;
    const person = findEntry('people', credit.personId);
    if (!person) continue;
    seen.add(credit.personId);
    people.push({ entry: person, certainty: credit.certainty });
  }
  return people;
}

function holding(object: ObjectRecord, locale: 'zh' | 'en') {
  const place = getPlace(object.currentCollection.placeId);
  if (!place || object.currentCollection.locationKind === 'unknown') {
    return locale === 'zh' ? '地点待考' : 'Location unknown';
  }
  const name = place.names[locale];
  return object.currentCollection.locationKind === 'last-known'
    ? (locale === 'zh' ? '最后见于 ' : 'Last known at ') + name
    : name;
}

interface WorkCopyingEntryProps {
  objects: ObjectRecord[];
  notes: KnowledgeArticle[];
  people: CopyingPerson[];
  onOpenObject?: (objectId: string) => void;
}

/**
 * A compact, collapsed starting point for copying. Empty categories never
 * render, and a work with nothing to aggregate has no empty disclosure.
 */
export function WorkCopyingEntry({ objects, notes, people, onOpenObject }: WorkCopyingEntryProps) {
  const { locale, strings } = useLocale();
  const id = useId();
  if (objects.length === 0 && notes.length === 0 && people.length === 0) return null;

  const openObject = (event: MouseEvent<HTMLAnchorElement>, objectId: string) => {
    if (!onOpenObject || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenObject(objectId);
  };

  return <details className="copying-entry">
    <summary className="copying-entry__summary">{strings.copyingEntryTitle}</summary>
    <div className="copying-entry__body">
      {objects.length > 0 ? <section className="copying-entry__group" aria-labelledby={id + '-objects'}>
        <h3 id={id + '-objects'}>{strings.copyingEntryObjects}</h3>
        <ul>
          {objects.map((object) => <li key={object.id}>
            <a href={'#/transmission/' + object.id} onClick={(event) => openObject(event, object.id)}>
              {object.titles[locale]}
            </a>
            <small>{strings.objectTypeLabels[object.objectType]} · {formatDate(object.productionDate, locale)} · {holding(object, locale)}</small>
          </li>)}
        </ul>
      </section> : null}
      {notes.length > 0 ? <section className="copying-entry__group" aria-labelledby={id + '-notes'}>
        <h3 id={id + '-notes'}>{strings.copyingEntryNotes}</h3>
        <ul>
          {notes.map((note) => <li key={note.id}>
            <a href={libraryHref(note)}>{noteDisplayTitle(locale === 'zh' ? note.titleZh : note.titleEn || note.titleZh)}</a>
            {note.state === 'draft' ? <span className="tag">{strings.reviewDraft}</span> : null}
          </li>)}
        </ul>
      </section> : null}
      {people.length > 0 ? <section className="copying-entry__group" aria-labelledby={id + '-people'}>
        <h3 id={id + '-people'}>{strings.copyingEntryPeople}</h3>
        <ul>
          {people.map(({ entry: person, certainty }) => <li key={person.id}>
            <a href={libraryHref(person)}>{locale === 'zh' ? person.titleZh : person.titleEn || person.titleZh}</a>
            {certainty !== 'documented' ? <span className="tag tag--warn">{strings.certaintyLabels[certainty]}</span> : null}
          </li>)}
        </ul>
      </section> : null}
    </div>
  </details>;
}
