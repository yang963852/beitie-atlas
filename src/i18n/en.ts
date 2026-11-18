/**
 * English interface copy.
 *
 * The Chinese dictionary in `zh.ts` must expose the same keys and the same
 * function signatures; `Strings` below is derived from this file, so a missing
 * key is a type error rather than a blank label.
 *
 * Chinese original titles, aliases, place wording, and source titles come from
 * data and are never translated away.
 */

export const enStrings = {
  siteTitleZh: '碑帖之间',
  siteTitleEn: 'Between Steles',
  tagline: 'An atlas of Chinese calligraphic steles and selected rubbings.',
  taglineDetail:
    'One work may survive as several physical objects in different places. Each object keeps its own collection evidence and its own dated movements.',
  statusBadge: 'Preview',
  statusBadgeRelease: 'Release',
  draftNotice:
    'Draft records only. Every claim links to the source it came from; nothing here is publication-approved.',

  languageLabel: 'Language',
  languageZh: '中文',
  languageEn: 'EN',

  sectionsLabel: 'Sections',
  resultsHeading: 'Records',
  resultsCount: (shown: number, total: number) => `${shown} of ${total}`,
  searchLabel: 'Search records',
  searchPlaceholder: 'Title, alias, or catalogue number',
  clearSearch: 'Clear',
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
  objectDateLabel: 'Object date',
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
  },

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
  mapSubheading:
    'Explore the documented institutions and sites that hold these objects.',
  coordinateOverview: 'Location overview · basemap unavailable',
  noMapPoints: 'No documented coordinates for these results.',
  mapLoading: 'Loading the map…',
  mapLoadingHint: 'Requesting the base map from the provider.',
  mapUnavailableTitle: 'Map not enabled',
  mapUnavailableBody:
    'Records, collection evidence, and sources all still work. A Tianditu browser key turns the base map on; until then this panel lists every documented place.',
  mapErrorTitle: 'The map could not load',
  mapErrorBody:
    'Reading, searching, and source links still work. Retry, or use the location list below.',
  mapRetry: 'Try again',
  mapFitAll: 'Show all points',
  mapDeveloperDetails: 'Developer details',
  mapUnconfiguredDevNote:
    'No Tianditu key was supplied at build time, so no map is requested and nothing is sent to the provider. Setup steps are in docs/map-setup.md.',
  mapFailureDevNote: (code: string, message: string) => `${code}: ${message}`,
  mapSetupTitle: 'Turn on the base map',
  mapSetupBody:
    'Add your Tianditu browser key to .env.local in the project root, then restart the preview. The build reads the key at start-up.',
  mapSetupCode: 'VITE_TIANDITU_KEY=your-key',
  mapSetupNote:
    'Run npm run check:map-key to verify the key first. A browser key ships inside the page bundle, so restrict it by domain and quota in the provider console. It is not a private credential.',
  mapAttributionLabel: 'Map provider',
  mapAttributionText:
    'Map service: 天地图 (National Platform for Common Geospatial Information Services). Displayed under the provider’s terms; the approval label is shown by the provider.',
  mapFrameNote:
    'Marker positions are the stored WGS84 values passed to the provider without a datum transformation. The provider’s basemap uses CGCS2000; the record’s coordinates are unverified institution-level points, so treat the marker as indicative, not as a surveyed position.',
  placeCardLabel: 'Selected place',
  closePlaceCard: 'Close',

  locationsHeading: 'Locations',
  locationsIntro:
    'Every documented current place in the current results, with the coordinate source and its review state. This list is the keyboard-accessible equivalent of the map.',
  locationsWithoutPointHeading: 'Records without a map point',
  locationsWithoutPointIntro:
    'These records stay readable here. A last-known location is a historical claim, not a present-day collection point, so it is never plotted as a marker.',
  placeNotRecorded: 'Place not recorded',
  unmappedReasons: {
    historical: 'Not a current collection point',
    unknown: 'Location unknown',
    'no-point': 'No coordinates recorded',
  },
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

  precisionLabels: {
    site: 'site',
    institution: 'institution',
    city: 'city',
    region: 'region',
  },

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
  attributionRoleLabels: {
    'author-and-calligrapher': 'Text and calligraphy',
    author: 'Text',
    calligrapher: 'Calligraphy',
    engraver: 'Carved by',
    'title-writer': 'Seal script',
    compiler: 'Compiled by',
    sponsor: 'Erected by',
    unknown: 'Unrecorded',
  },
  attributionRoleShort: {
    'author-and-calligrapher': 'text and script',
    author: 'text',
    calligrapher: 'script',
    engraver: 'carved',
    'title-writer': 'seal',
    compiler: 'compiled',
    sponsor: 'erected',
    unknown: 'unrecorded',
  },
  attributionHeading: 'Credited hands',
  dynastyHeading: 'Period',
  dynastyUnknown: 'Period not recorded',
  dynastyFactLabel: 'Period',
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
};

export type Strings = typeof enStrings;
