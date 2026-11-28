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
  taglineLead: 'The work you practise from:',
  tagline: 'where is it kept today?',
  enterCatalogue: 'Open the atlas',
  studyFilter: 'Filter by work category',
  studyLabels: { all: 'All', bei: 'Inscriptions', tie: 'Modelbooks' },
  draftNotice:
    'This preview includes records still awaiting editorial review. Check each record’s sources.',

  languageLabel: 'Language',
  languageZh: '中文',
  languageEn: 'EN',

  /** Project-level navigation and the opening desk's short statement. The full
   *  philosophy lives in docs/PROJECT.en.md; these are only entry labels. */
  navAbout: 'About',
  navJoin: 'Join in',
  homeLead: 'From one model on the desk to a wider world of calligraphy.',
  homeLede: 'Discover history, learn to see beauty, and share what we learn and wonder.',
  motto: 'Everyone contributes for the benefit of others, and everyone benefits from what others share.',

  sectionsLabel: 'Sections',
  resultsHeading: 'Records',
  resultsCount: (shown: number, total: number) => `${shown} of ${total}`,
  searchLabel: 'Search records',
  searchPlaceholder: 'Title, alias, or catalogue number',
  clearSearch: 'Clear',
  noResults: 'No record matches this search.',
  emptyCorpus: 'No records are available.',
  lastKnownPlace: (name: string) => `Last known: ${name}`,

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

  notesHeading: 'Editorial notes and gaps',
  /** Which record the following notes belong to; a physical object, its work, or its place. */
  notesScopes: {
    object: 'This object',
    work: 'Its work',
    place: 'Its holding place',
  },
  sourcesHeading: 'Sources cited by this record',
  sourcesControl: (count: number) => `Sources (${count})`,
  sourceAccessed: (date: string) => `accessed ${date}`,
  sourceLocator: 'Locator',

  backgroundHeading: 'About this work',
  backgroundLanguageNote: 'Recorded in the language shown; no translation is generated.',

  copyingEntryTitle: 'Before you copy this work',
  copyingEntryObjects: 'Witness details',
  copyingEntryNotes: 'Close readings',
  copyingEntryPeople: 'Calligraphers',

  contributeAction: 'Add or correct information',
  contributeTitle: 'Submit information',
  contributeIntro:
    'Tell us what you know about this object, its location, or its history. A submission is a lead: it is checked against an openable source before anything is added.',
  contributeFor: (title: string) => `About: ${title}`,
  contributeDetailsLabel: 'What do you know?',
  contributeDetailsPlaceholder:
    'For example: a dated inventory, a move, an inscription detail, or a correction to this record.',
  contributeSourceLabel: 'Where can it be checked?',
  contributeSourcePlaceholder:
    'A museum, library, heritage or government page; or a printed catalogue with page number.',
  contributeContactLabel: 'How may we reach you? (optional)',
  contributeContactPlaceholder: 'Only include a public contact, such as your GitHub username.',
  contributeNotice:
    'Submissions are not published automatically. Unsourced recollections and app screenshots are treated as leads, not evidence.',
  contributePreviewLabel: 'Text that will be submitted',
  contributeSubmit: 'Open the submission page',
  contributeCopy: 'Copy the text',
  contributeCopied: 'Copied.',
  contributeCopyFailed: 'Copying failed. Select the text above and copy it manually.',
  contributeRequired: 'Describe what you know before submitting.',
  contributeChannelNote:
    'Opening the issue page sends this text to GitHub to prefill the form. The issue will be public if you post it. Do not include private information.',
  contributeClose: 'Close',
  contributeFooterLink: 'Submit information',

  reviewDraft: 'Draft',

  mapHeading: 'Map',
  collectionAtlasTitle: 'Atlas of surviving works',
  collectionAtlasLede:
    'Locate surviving objects by their present collection or in-situ site. Choose a province to read the steles, rubbings and other witnesses held there.',
  collectionAtlasGapNote: 'Places without a citable coordinate stay textual; no position is guessed.',
  collectionAtlasWitnesses: 'Surviving witnesses',
  provincesHeading: 'Browse by province',
  provincesHint:
    'Choose a province to see its surviving objects. “Not mapped” marks a place without a citable coordinate.',
  provincesFilterLabel: 'Filter by province',
  provincesAll: 'All',
  provinceCount: (count: number) => `${count} item${count === 1 ? '' : 's'}`,
  provincePlaceCount: (count: number) => `${count} place${count === 1 ? '' : 's'}`,
  provinceNotMapped: 'Not mapped',
  provinceUnknown: 'Province unknown',
  provinceUnplaced: 'Location unknown',
  provinceUnplacedHint:
    'These surviving objects have no current collection place, so they cannot be plotted by province.',
  mapOriginalsOnly: 'Surviving originals only',
  mapSubheading:
    'Explore the documented institutions and sites that hold these objects.',
  mapPointHint:
    'Select any point to see what is held there — surviving stones and rubbings alike.',
  mapPointIndexLabel: 'Points on this map',
  mapPointIndexCount: (count: number) => `${count} record${count === 1 ? '' : 's'}`,
  mapCoverage: (mapped: number, total: number) => `${mapped} of ${total} places have a documented point`,
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
  mapTilesBlocked:
    'The basemap did not load, usually a key or domain-whitelist restriction. Markers, the place list and every record still work.',
  mapFitAll: 'Show all points',
  mapDeveloperDetails: 'Developer details',
  mapFailureDevNote: (code: string, message: string) => `${code}: ${message}`,
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
    'ink-manuscript': 'Ink manuscript',
    'manuscript-copy': 'Manuscript copy',
    'original-stele': 'Original stele',
    'cliff-inscription': 'Cliff inscription',
    'bronze-vessel': 'Bronze vessel',
    recarving: 'Recarving',
    rubbing: 'Rubbing',
    fragment: 'Fragment',
  },
  attributionRoleLabels: {
    'author-and-calligrapher': 'Text and calligraphy',
    author: 'Text',
    calligrapher: 'Calligraphy',
    copyist: 'Copyist',
    'colophon-author': 'Colophon',
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
    copyist: 'copy',
    'colophon-author': 'colophon',
    engraver: 'carved',
    'title-writer': 'seal',
    compiler: 'compiled',
    sponsor: 'erected',
    unknown: 'unrecorded',
  },
  attributionHeading: 'Credited hands',
  objectAttributionHeading: 'Credits on this object',
  claimsHeading: 'Claims and opinions',
  claimKindLabels: {
    'source-report': 'Source report',
    'scholarly-opinion': 'Scholarly opinion',
    'editor-interpretation': 'Editorial interpretation',
  },
  claimStanceLabels: {
    supports: 'Supports',
    questions: 'Questions',
    neutral: 'Reports',
  },
  versionHeading: 'Version',
  versionBasisLabel: 'Grouping basis',
  dateMeaningLabels: {
    composition: 'Composition',
    publication: 'Publication',
    colophon: 'Colophon',
    production: 'Production',
    discovery: 'Discovery',
    accession: 'Accession',
    other: 'Other',
  },
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
  crashTitle: 'This page could not be displayed',
  crashBody:
    'Rendering stopped before this record finished. The data is unchanged; return to the catalogue and open another record. If it happens again, quote the message below in an issue.',
  crashBack: 'Back to the catalogue',
  validationErrorTitle: 'Local data checks failed',
  validationErrorBody:
    'The records below are shown anyway so the problem can be inspected, but this build is not valid.',
};

export type Strings = typeof enStrings;
