/**
 * All interface copy lives here. The initial interface is English; Chinese
 * original titles, aliases, place wording, and source titles come from data and
 * are never translated away.
 */

export const strings = {
  siteTitleZh: '碑帖之间',
  siteTitleEn: 'Between Steles',
  tagline: 'An atlas of Chinese calligraphic steles and selected rubbings',
  statusBadge: 'Foundation preview',
  draftNotice:
    'Draft records only. Nothing here is publication-approved, and every claim links to the source it came from.',
  dataStatusOk: (objects: number, events: number) =>
    `Local data checks passed: ${objects} object records, ${events} sourced events.`,

  resultsHeading: 'Records',
  resultsCount: (shown: number, total: number) => `${shown} of ${total}`,
  searchLabel: 'Search records',
  searchPlaceholder: 'Title, alias, or catalogue number',
  clearSearch: 'Clear',
  noResults: 'No record matches this search.',
  emptyCorpus: 'No records are available.',

  detailEmptyTitle: 'Select a record',
  detailEmptyBody:
    'Choose an object from the list to read its collection assertion, dated movements, and source links.',
  detailHeading: 'Object record',
  backToList: 'Back to the list',
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
  eventSourcesLabel: 'Sources for this event',

  notesHeading: 'Editorial notes and gaps',
  sourcesHeading: 'Sources cited by this record',
  sourceAccessed: (date: string) => `accessed ${date}`,
  sourceLocator: 'Locator',
  noSources: 'No sources are attached.',

  reviewDraft: 'Draft',
  reviewReviewed: 'Reviewed',
  reviewNoteLabel: 'Review note',

  mapHeading: 'Map pilot',
  mapSubheading: 'Institution markers only. A marker is not the object’s storage location.',
  mapLoading: 'Loading the map…',
  mapLoadingHint: 'The map script is requested from the provider’s official endpoint.',
  mapUnconfiguredTitle: 'Map not configured in this build',
  mapUnconfiguredBody:
    'No Tianditu key was supplied at build time, so no map is requested and nothing is sent to the provider. The list and object records work without it.',
  mapUnconfiguredAction:
    'To enable the map, the project owner needs a Tianditu developer key; see docs/map-pilot.md for the exact steps.',
  mapErrorTitle: 'The map could not load',
  mapErrorBody:
    'The provider script did not load. Reading, searching, and source links are unaffected.',
  mapRetry: 'Try again',
  mapAttributionLabel: 'Map provider',
  mapAttributionText:
    'Map service: 天地图 (National Platform for Common Geospatial Information Services). Displayed under the provider’s terms; approval label shown by the provider.',
  mapFrameNote:
    'Markers use WGS84 coordinates from the records. The provider renders in CGCS2000; the two frames differ by centimetres, well below the institution-level precision recorded here.',

  locationsHeading: 'Locations without the map',
  locationsIntro:
    'Every documented place in the corpus, with the coordinate source and its review state. This list is the keyboard-accessible equivalent of the map.',
  locationsUnmappedHeading: 'Records with no map point',
  locationsEmpty: 'No object has a verified point yet.',
  coordinateLabel: 'Coordinate',
  precisionLabel: 'Precision',
  coordinateSourceLabel: 'Coordinate source',
  coordinateVerified: 'Verified',
  coordinateUnverified: 'Unverified — secondary source',
  noCoordinates: 'No coordinates recorded',
  openInMap: 'Show on map',
  objectsAtPlace: (count: number) => `${count} record${count === 1 ? '' : 's'} here`,

  footerNote:
    'Local foundation build. Mainland public-network access has not been tested. Dates, coordinates, and collections are source claims, not live facts.',
  mapToggleShow: 'Show map',
  mapToggleHide: 'Hide map',
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
