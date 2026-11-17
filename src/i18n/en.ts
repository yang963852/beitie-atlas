/**
 * All interface copy lives here. The initial interface is English; Chinese
 * original titles, aliases, place wording, and source titles come from data and
 * are never translated away.
 *
 * Reader-facing copy stays short and factual. Provider keys, file paths, and
 * validator output belong to the developer-details disclosures or the runbooks.
 */

export const strings = {
  siteTitleZh: '碑帖之间',
  siteTitleEn: 'Between Steles',
  tagline: 'An atlas of Chinese calligraphic steles and selected rubbings',
  statusBadge: 'Preview',
  statusBadgeRelease: 'Release',
  draftNotice:
    'Draft records only. Every claim links to the source it came from; nothing here is publication-approved.',

  sectionsLabel: 'Sections',
  resultsHeading: 'Records',
  resultsCount: (shown: number, total: number) => `${shown} of ${total}`,
  searchLabel: 'Search records',
  searchPlaceholder: 'Title, alias, or catalogue number',
  clearSearch: 'Clear search',
  noResults: 'No record matches this search.',
  emptyCorpus: 'No records are available.',

  mobileViewLabel: 'Choose view',
  mobileListView: 'List',
  mobileMapView: 'Map',
  backToRecords: 'Back to records',

  detailEmptyTitle: 'Select a record',
  detailEmptyBody:
    'Choose an object from the list to read its collection assertion, dated movements, and source links.',
  detailHeading: 'Object record',
  workLabel: 'Work',
  catalogueLabel: 'Catalogue number',
  dimensionsLabel: 'Dimensions',
  survivalLabel: 'Survival',
  workDateLabel: 'Work date',
  objectDateLabel: 'Object production date',
  sourceWording: 'Source wording',
  collectionHeading: 'Documented collection',
  collectionChecked: (date: string) => `Source checked ${date}`,
  collectionAssertionAsOf: (date: string) => `Source assertion as of ${date}`,
  collectionNotStated: 'No collection assertion is recorded for this object.',
  locationKindLabels: {
    'collection-institution': 'Collection institution',
    'in-situ': 'In situ',
    'last-known': 'Last known location',
    unknown: 'Unknown location',
  } as const,

  provenanceHeading: 'Documented movements',
  provenanceIntro:
    'Only movements that a source states are shown. Intervening custody and unrecorded periods stay blank.',
  provenanceEmpty:
    'No custody events are recorded for this object. Its history is not inferred from a related object.',
  eventPlaceUnknown: 'Place not recorded',
  eventCertaintyLabel: 'Certainty',
  eventSourcesLabel: 'Sources',

  notesHeading: 'Editorial notes and gaps',
  sourcesHeading: 'Sources cited by this record',
  sourcesControl: (count: number) => `Sources (${count})`,
  sourceAccessed: (date: string) => `accessed ${date}`,
  sourceLocator: 'Locator',
  noSources: 'No sources are attached.',
  editorialDetails: 'Editorial and coordinate details',

  reviewDraft: 'Draft',
  reviewReviewed: 'Reviewed',
  reviewNoteLabel: 'Review note',

  mapHeading: 'Map',
  mapSubheading: 'One marker per documented collection institution. A marker is not the object’s storage location.',
  mapLoading: 'Loading the map…',
  mapLoadingHint: 'Requesting the base map from the provider.',
  mapUnavailableTitle: 'Map unavailable',
  mapUnavailableBody:
    'You can still explore every record, its documented collection, and its sources.',
  mapErrorTitle: 'The map could not load',
  mapErrorBody:
    'Reading, searching, and source links still work. Retry, or use the location list below.',
  mapRetry: 'Try again',
  mapDeveloperDetails: 'Developer details',
  mapUnconfiguredDevNote:
    'No Tianditu key was supplied at build time, so no map is requested and nothing is sent to the provider. Setup steps are in docs/map-setup.md.',
  mapFailureDevNote: (code: string, message: string) => `${code}: ${message}`,
  mapAttributionLabel: 'Map provider',
  mapAttributionText:
    'Map service: 天地图 (National Platform for Common Geospatial Information Services). Displayed under the provider’s terms; approval label shown by the provider.',
  mapFrameNote:
    'Marker positions are the stored WGS84 values passed to the provider without a datum transformation. The provider’s basemap uses CGCS2000; the record’s coordinates are unverified institution-level points, so treat the marker as indicative, not as a surveyed position.',
  placeCardLabel: 'Selected place',
  closePlaceCard: 'Close',

  locationsHeading: 'Locations without the map',
  locationsIntro:
    'Every documented current place in the current results, with the coordinate source and its review state. This list is the keyboard-accessible equivalent of the map.',
  locationsWithoutPointHeading: 'Records without a current map point',
  locationsWithoutPointIntro:
    'These records stay readable here. A last-known location is a historical claim, not a present-day collection point, so it is never plotted as a marker.',
  placeNotRecorded: 'Place not recorded',
  unmappedReasons: {
    historical: 'Not a current collection point',
    unknown: 'Location unknown',
    'no-point': 'No coordinates recorded',
  } as const,
  locationsEmpty: 'No object has a verified point yet.',
  coordinateLabel: 'Coordinate',
  coordinateDetails: 'Coordinate and precision',
  precisionLabel: 'Precision',
  coordinateSourceLabel: 'Coordinate source',
  coordinateVerified: 'Verified',
  coordinateUnverified: 'Unverified — secondary source',
  noCoordinates: 'No coordinates recorded',
  openInMap: 'Show on map',
  objectsAtPlace: (count: number) => `${count} record${count === 1 ? '' : 's'} here`,

  footerNote:
    'Dates, coordinates, and collections are source claims, not live facts. Mainland public-network access has not been tested.',
  buildInfoLabel: 'Build and data checks',
  buildInfoOk: (objects: number, events: number, warnings: number) =>
    `Local checks passed: ${objects} object records, ${events} sourced events${
      warnings > 0 ? `, ${warnings} validator warnings` : ''
    }.`,
  skipToResults: 'Skip to the record list',

  objectTypeLabels: {
    'original-stele': 'Original stele',
    'cliff-inscription': 'Cliff inscription',
    recarving: 'Recarving',
    rubbing: 'Rubbing',
    fragment: 'Fragment',
  },
  eventTypeLabels: {
    composition: 'Composition',
    carving: 'Carving',
    discovery: 'Discovery',
    relocation: 'Move',
    custody: 'Custody',
    'rubbing-taken': 'Rubbing taken',
    accession: 'Accession',
    documented: 'Documented',
    other: 'Other',
  },
  survivalLabels: {
    surviving: 'Surviving',
    lost: 'Lost',
    unknown: 'Unknown',
  },
  certaintyLabels: {
    documented: 'Documented',
    approximate: 'Approximate',
    disputed: 'Disputed',
    unknown: 'Unknown',
  },
  validationErrorTitle: 'Local data checks failed',
  validationErrorBody:
    'The records below are shown anyway so the problem can be inspected, but this build is not valid.',
} as const;

export type Strings = typeof strings;
