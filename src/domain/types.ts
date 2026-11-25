/**
 * Domain types for the v0.1 corpus.
 *
 * Invariants that the runtime validator in `validate.ts` enforces:
 * - A work is a named composition; an object is a physical thing (stone, rubbing, ...).
 * - Claims inside an object never borrow evidence from a different object.
 * - Unknown data stays `null`; it is never replaced by zero, today, or a guess.
 * - Canonical coordinates are WGS84 longitude/latitude in decimal degrees.
 */

export type ReviewState = 'draft' | 'reviewed';

/**
 * Period ids for reading order. The table that defines them, including the
 * Chinese and English labels, lives in `dynasties.ts`.
 */
export type DynastyId =
  | 'pre-qin'
  | 'qin'
  | 'western-han'
  | 'xin'
  | 'eastern-han'
  | 'three-kingdoms'
  | 'western-jin'
  | 'eastern-jin'
  | 'northern-and-southern'
  | 'sui'
  | 'tang'
  | 'five-dynasties'
  | 'northern-song'
  | 'liao'
  | 'southern-song'
  | 'jin'
  | 'yuan'
  | 'ming'
  | 'qing'
  | 'republic'
  | 'prc';

export interface Review {
  state: ReviewState;
  /** Editorial note about what still needs checking before publication. */
  note: string | null;
  /** Chinese wording of the same note. Optional: the recorded language wins. */
  noteZh?: string | null;
}

export interface BilingualTitle {
  zh: string;
  en: string;
}

/** Signed year, no year zero: -44 is 44 BCE, 779 is 779 CE. */
export type DateKind = 'single' | 'range' | 'approximate' | 'era' | 'unknown';
export type DateCertainty = 'documented' | 'approximate' | 'disputed' | 'unknown';

/**
 * What the date dates. A work's year may be a composition, a publication or a
 * later colophon; an object's year may be a production or a discovery. Keeping
 * the meaning next to the value prevents 1962 and 1976 from being read as the
 * same kind of event.
 */
export type DateMeaning =
  | 'composition'
  | 'publication'
  | 'colophon'
  | 'production'
  | 'discovery'
  | 'accession'
  | 'other';

export interface HistoricalDate {
  kind: DateKind;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  /** Era label such as 民国, used when only an era is recorded. */
  eraLabel: string | null;
  /** Original wording from the source, preserved verbatim. */
  original: string | null;
  certainty: DateCertainty;
  meaning?: DateMeaning | null;
  note: string | null;
}

export type AttributionRole =
  | 'author-and-calligrapher'
  | 'author'
  | 'calligrapher'
  | 'copyist'
  | 'colophon-author'
  | 'engraver'
  | 'title-writer'
  | 'compiler'
  | 'sponsor'
  | 'unknown';

/**
 * One named person or group credited on a work. `sponsor` records who paid for
 * or erected the stone, which is not authorship: Han steles often name dozens of
 * donors while leaving the writer and the calligrapher unrecorded.
 */
export interface Attribution {
  role: AttributionRole;
  name: string;
  nameEn: string | null;
  /** Local person record when the identity is established. Never inferred from a shared name. */
  personId?: string | null;
  certainty: DateCertainty;
  sourceRefs: string[];
  /** Editorial caveat, such as a name that sources spell differently. */
  note?: string | null;
  noteZh?: string | null;
}

export type ClaimKind = 'source-report' | 'scholarly-opinion' | 'editor-interpretation';
export type ClaimStance = 'supports' | 'questions' | 'neutral';

/**
 * A dated, attributed statement: who said what, where. A claim is not a fact.
 * The same object can carry two claims with different values; no preference is
 * derived by averaging or by model score.
 */
export interface Claim {
  id: string;
  kind: ClaimKind;
  predicate: string;
  value: string;
  /** Person or source voice that made the claim, preserved as written. */
  voice: string | null;
  personId?: string | null;
  stance: ClaimStance;
  certainty: DateCertainty;
  sourceRefs: string[];
  /** Narrower than the source locator, e.g. a colophon or entry line. */
  locator: string | null;
  note: string | null;
  noteZh?: string | null;
}

/** A named transmission group, used only when a source names or groups copies. */
export interface VersionAssertion {
  label: string;
  basis: string | null;
  sourceRefs: string[];
  note: string | null;
  noteZh?: string | null;
}

export type StudyCategory = 'bei' | 'tie';
export type StudyFilter = 'all' | StudyCategory;

export interface Work {
  studyCategory: StudyCategory;
  id: string;
  titles: BilingualTitle;
  aliases: string[];
  attribution: Attribution[];
  /**
   * Period used for reading order. A stele is filed under the dynasty that
   * carved it, not under the date of a later rubbing of it.
   */
  dynastyId: DynastyId;
  /** Narrower label inside the period, e.g. 南朝梁. Null when the period suffices. */
  dynastyQualifier: string | null;
  compositionDate: HistoricalDate;
  script: string | null;
  background: string;
  backgroundZh?: string;
  sourceRefs: string[];
  review: Review;
  claims?: Claim[];
  notes: string[];
  /**
   * Chinese wording of the work notes, same count and order as `notes`.
   * Optional because the translation backlog is real: a record without it shows
   * the recorded English wording rather than a generated translation. The
   * validator reports the backlog as one aggregated warning.
   */
  notesZh?: string[];
}

export type ObjectType =
  | 'ink-manuscript'
  | 'manuscript-copy'
  | 'original-stele'
  | 'cliff-inscription'
  | 'bronze-vessel'
  | 'recarving'
  | 'rubbing'
  | 'fragment';

export type SurvivalStatus = 'surviving' | 'lost' | 'unknown';

export type RelationshipType = 'rubbing-of' | 'recarving-of' | 'fragment-of';

export interface ObjectRelationship {
  type: RelationshipType;
  targetObjectId: string;
  sourceRefs: string[];
  note: string | null;
}

export type LocationKind =
  | 'collection-institution'
  | 'in-situ'
  | 'last-known'
  | 'unknown';

/**
 * A documented collection assertion. It records what a source says, not where the
 * object is today, and not whether it is on display.
 */
export interface CollectionAssertion {
  locationKind: LocationKind;
  /** Place id of the institution or site; null when the source names none. */
  placeId: string | null;
  sourceRefs: string[];
  /** Date the cited source was read, ISO 8601. Not the date of the assertion itself. */
  sourceAccessedAt: string;
  /** Temporal anchor stated by the source, if any. */
  assertionAsOf: string | null;
  note: string | null;
  /** Chinese wording of the same editorial note. Never a new claim. */
  noteZh?: string | null;
}

export type EventType =
  | 'composition'
  | 'carving'
  | 'discovery'
  | 'relocation'
  | 'custody'
  | 'rubbing-taken'
  | 'accession'
  | 'documented'
  | 'other';

export interface ProvenanceEvent {
  id: string;
  objectId: string;
  type: EventType;
  date: HistoricalDate;
  placeId: string | null;
  /** Place wording used by the source, preserved as written. */
  placeWording: string | null;
  /**
   * A modern reference landmark used only for orientation. It is not the
   * historical find-place or the object's current storage.
   */
  referencePlaceId?: string | null;
  referenceNote?: string | null;
  referenceNoteZh?: string | null;
  /** Short wording for a map rail, not a new historical claim. */
  shortLabel?: string | null;
  shortLabelZh?: string | null;
  summary: string;
  /** Chinese wording of the same editorial summary. Must not add a claim. */
  summaryZh?: string | null;
  sourceRefs: string[];
  certainty: DateCertainty;
}

export interface ObjectRecord {
  id: string;
  workId: string;
  objectType: ObjectType;
  titles: BilingualTitle;
  productionDate: HistoricalDate;
  catalogNumber: string | null;
  dimensions: { raw: string; note: string | null } | null;
  survivalStatus: SurvivalStatus;
  relationships: ObjectRelationship[];
  currentCollection: CollectionAssertion;
  provenanceEvents: ProvenanceEvent[];
  /** Credits specific to this physical thing: a copyist, a colophon author, a carver. */
  attribution?: Attribution[];
  /** Optional named transmission group; absent when one unique object needs no grouping. */
  version?: VersionAssertion | null;
  review: Review;
  claims?: Claim[];
  notes: string[];
  /** Chinese wording of the editorial notes, same count and order as `notes`. */
  notesZh?: string[];
}

export type PlaceKind =
  | 'institution'
  | 'historical-site'
  | 'district'
  | 'city'
  | 'region';

export type CoordinatePrecision = 'site' | 'institution' | 'city' | 'region';
export type CoordinateMethod =
  | 'official-publication'
  | 'secondary-database'
  | 'geocoder'
  | 'field-survey';
export type CoordinateVerification = 'verified' | 'unverified';

export interface Coordinates {
  longitude: number;
  latitude: number;
  crs: 'WGS84';
  precision: CoordinatePrecision;
  sourceRefs: string[];
  method: CoordinateMethod;
  verification: CoordinateVerification;
  note: string | null;
  /** Chinese wording of the same coordinate caveat. */
  noteZh?: string | null;
}

export interface Place {
  id: string;
  names: BilingualTitle;
  historicalName: string | null;
  kind: PlaceKind;
  coordinates: Coordinates | null;
  sourceRefs: string[];
  notes: string[];
  /** Chinese wording of the place notes, same count and order as `notes`. */
  notesZh?: string[];
}

export interface Source {
  id: string;
  /**
   * Where the evidence was published. `web` needs an URL; `book` needs a
   * publisher, a year and a page or entry locator instead, because a printed
   * catalogue is citable without pretending it has a link.
   */
  kind?: 'web' | 'book';
  title: string;
  publisher: string;
  /** Null only for a printed source. */
  url: string | null;
  publicationDate: string | null;
  accessedAt: string;
  locator: string | null;
  note: string | null;
}

export interface MediaItem {
  id: string;
  objectId: string;
  assetPathOrUrl: string;
  creator: string;
  sourceRefs: string[];
  license: string;
  credit: string;
  rightsEvidence: string;
  acquiredAt: string;
}

export interface Dataset {
  works: Work[];
  objects: ObjectRecord[];
  places: Place[];
  sources: Source[];
  media: MediaItem[];
}
