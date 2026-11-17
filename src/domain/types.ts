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

export interface Review {
  state: ReviewState;
  /** Editorial note about what still needs checking before publication. */
  note: string | null;
}

export interface BilingualTitle {
  zh: string;
  en: string;
}

/** Signed year, no year zero: -44 is 44 BCE, 779 is 779 CE. */
export type DateKind = 'single' | 'range' | 'approximate' | 'era' | 'unknown';
export type DateCertainty = 'documented' | 'approximate' | 'disputed' | 'unknown';

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
  note: string | null;
}

export type AttributionRole =
  | 'author-and-calligrapher'
  | 'author'
  | 'calligrapher'
  | 'compiler'
  | 'unknown';

export interface Attribution {
  role: AttributionRole;
  name: string;
  nameEn: string | null;
  certainty: DateCertainty;
  sourceRefs: string[];
}

export interface Work {
  id: string;
  titles: BilingualTitle;
  aliases: string[];
  attribution: Attribution[];
  compositionDate: HistoricalDate;
  script: string | null;
  background: string;
  sourceRefs: string[];
  review: Review;
  notes: string[];
}

export type ObjectType =
  | 'original-stele'
  | 'cliff-inscription'
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
  summary: string;
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
  review: Review;
  notes: string[];
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
}

export interface Place {
  id: string;
  names: BilingualTitle;
  historicalName: string | null;
  kind: PlaceKind;
  coordinates: Coordinates | null;
  sourceRefs: string[];
  notes: string[];
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
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
