/**
 * Runtime data validation.
 *
 * The same function is used by `scripts/check-data.ts` (build check) and by the
 * application at start-up, so the browser and the command line agree on what a
 * valid record is. It deliberately checks editorial risks, not cosmetics:
 * broken references, unverified collection assertions, coordinate frames,
 * impossible dates, and draft records leaking into a release build.
 */

import { DYNASTIES, isDynastyId, yearInDynasty } from './dynasties';
import type { Dataset } from './types';

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  counts: {
    works: number;
    objects: number;
    places: number;
    sources: number;
    media: number;
    events: number;
  };
}

type Json = Record<string, unknown>;

const OBJECT_TYPES = new Set([
  'original-stele',
  'cliff-inscription',
  'recarving',
  'rubbing',
  'fragment',
]);

const DATE_KINDS = new Set(['single', 'range', 'approximate', 'era', 'unknown']);
const CERTAINTIES = new Set(['documented', 'approximate', 'disputed', 'unknown']);
const LOCATION_KINDS = new Set([
  'collection-institution',
  'in-situ',
  'last-known',
  'unknown',
]);
const PLACE_KINDS = new Set(['institution', 'historical-site', 'district', 'city', 'region']);
const PRECISIONS = new Set(['site', 'institution', 'city', 'region']);
const METHODS = new Set(['official-publication', 'secondary-database', 'geocoder', 'field-survey']);
const VERIFICATIONS = new Set(['verified', 'unverified']);
const RELATIONSHIP_TYPES = new Set(['rubbing-of', 'recarving-of', 'fragment-of']);
const REVIEW_STATES = new Set(['draft', 'reviewed']);
const SURVIVAL = new Set(['surviving', 'lost', 'unknown']);
const ATTRIBUTION_ROLES = new Set([
  'author-and-calligrapher',
  'author',
  'calligrapher',
  'engraver',
  'title-writer',
  'compiler',
  'sponsor',
  'unknown',
]);
/** Ranges that overlap are expected; this only guards against typos in the table. */
const DYNASTY_IDS = DYNASTIES.map((dynasty) => dynasty.id);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

function isMonth(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;
}

export function validateDataset(raw: unknown, options: { releaseMode?: boolean } = {}): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const error = (code: string, path: string, message: string) => {
    errors.push({ code, path, message });
  };
  const warn = (code: string, path: string, message: string) => {
    warnings.push({ code, path, message });
  };

  const emptyReport = (): ValidationReport => ({
    ok: errors.length === 0,
    errors,
    warnings,
    counts: { works: 0, objects: 0, places: 0, sources: 0, media: 0, events: 0 },
  });

  if (!isRecord(raw)) {
    error('DATASET_SHAPE', '$', 'Dataset is not an object.');
    return emptyReport();
  }

  const collections = ['works', 'objects', 'places', 'sources', 'media'] as const;
  for (const key of collections) {
    if (!Array.isArray(raw[key])) {
      error('DATASET_SHAPE', `$.${key}`, `"${key}" must be an array.`);
    }
  }
  if (errors.length > 0) return emptyReport();

  const works = raw.works as unknown[];
  const objects = raw.objects as unknown[];
  const places = raw.places as unknown[];
  const sources = raw.sources as unknown[];
  const media = raw.media as unknown[];

  const seenIds = new Map<string, string>();
  const sourceIds = new Set<string>();
  const placeIds = new Set<string>();
  const objectIds = new Set<string>();
  const workIds = new Set<string>();
  const usedSources = new Set<string>();
  const usedPlaces = new Set<string>();

  const registerId = (id: unknown, path: string, kind: string) => {
    if (!isNonEmptyString(id)) {
      error('MISSING_ID', path, `${kind} is missing a non-empty string id.`);
      return false;
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
      error('INVALID_ID', path, `Id "${id}" must be lowercase ASCII with digits and hyphens.`);
    }
    const previous = seenIds.get(id);
    if (previous) {
      error('DUPLICATE_ID', path, `Id "${id}" is already used by ${previous}.`);
      return false;
    }
    seenIds.set(id, path);
    return true;
  };

  // ---------------------------------------------------------------- sources
  sources.forEach((entry, index) => {
    const path = `$.sources[${index}]`;
    if (!isRecord(entry)) {
      error('DATASET_SHAPE', path, 'Source must be an object.');
      return;
    }
    if (registerId(entry.id, `${path}.id`, 'Source') && isNonEmptyString(entry.id)) {
      sourceIds.add(entry.id);
    }
    for (const field of ['title', 'publisher', 'url'] as const) {
      if (!isNonEmptyString(entry[field])) {
        error('MISSING_FIELD', `${path}.${field}`, `Source "${String(entry.id)}" needs ${field}.`);
      }
    }
    if (isNonEmptyString(entry.url) && !/^https?:\/\//i.test(entry.url)) {
      error('INVALID_URL', `${path}.url`, `Source URL must be http(s): ${entry.url}`);
    }
    if (!isIsoDate(entry.accessedAt)) {
      error('INVALID_ACCESS_DATE', `${path}.accessedAt`, 'Source needs an ISO access date (YYYY-MM-DD).');
    }
    if (entry.publicationDate !== null && entry.publicationDate !== undefined) {
      if (typeof entry.publicationDate !== 'string' || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(entry.publicationDate)) {
        error('INVALID_DATE', `${path}.publicationDate`, 'Publication date must be YYYY, YYYY-MM or YYYY-MM-DD.');
      }
    }
  });

  const checkSourceRefs = (value: unknown, path: string, required: boolean): string[] => {
    if (!isStringArray(value)) {
      error('MISSING_EVIDENCE', path, 'sourceRefs must be an array of source ids.');
      return [];
    }
    if (required && value.length === 0) {
      error('MISSING_EVIDENCE', path, 'At least one source reference is required for this claim.');
    }
    value.forEach((ref) => {
      if (!sourceIds.has(ref)) {
        error('MISSING_SOURCE', path, `Unknown source reference "${ref}".`);
      } else {
        usedSources.add(ref);
      }
    });
    return value;
  };

  const checkDate = (value: unknown, path: string, required: boolean) => {
    if (!isRecord(value)) {
      if (required) error('INVALID_DATE', path, 'A date object is required.');
      return;
    }
    const kind = value.kind;
    if (typeof kind !== 'string' || !DATE_KINDS.has(kind)) {
      error('INVALID_DATE', path, `Unknown date kind "${String(kind)}".`);
      return;
    }
    if (typeof value.certainty !== 'string' || !CERTAINTIES.has(value.certainty)) {
      error('INVALID_DATE', `${path}.certainty`, 'Date certainty must be documented/approximate/disputed/unknown.');
    }

    const startYear = value.startYear;
    const endYear = value.endYear;
    const startMonth = value.startMonth;
    const endMonth = value.endMonth;

    const yearOk = (year: unknown): year is number =>
      typeof year === 'number' && Number.isInteger(year) && year !== 0;

    for (const [name, year] of [
      ['startYear', startYear],
      ['endYear', endYear],
    ] as const) {
      if (year === 0) {
        error('YEAR_ZERO', `${path}.${name}`, 'There is no year zero; use -1 for 1 BCE.');
      }
      if (year !== null && year !== undefined && !yearOk(year)) {
        error('INVALID_DATE', `${path}.${name}`, `${name} must be an integer year or null.`);
      }
    }

    for (const [name, month, year] of [
      ['startMonth', startMonth, startYear],
      ['endMonth', endMonth, endYear],
    ] as const) {
      if (month !== null && month !== undefined) {
        if (!isMonth(month)) error('INVALID_DATE', `${path}.${name}`, 'Month must be 1-12.');
        if (year === null || year === undefined) {
          error('INVALID_DATE', `${path}.${name}`, 'A month cannot be recorded without its year.');
        }
      }
    }

    const hasStart = yearOk(startYear);
    const hasEnd = yearOk(endYear);

    switch (kind) {
      case 'single':
        if (!hasStart || !hasEnd || startYear !== endYear) {
          error('INVALID_DATE', path, 'A single date needs startYear === endYear.');
        }
        break;
      case 'approximate':
        if (!hasStart) error('INVALID_DATE', path, 'An approximate date needs a startYear.');
        break;
      case 'range':
        if (!hasStart) {
          error('INVALID_DATE', path, 'A range needs a startYear; use null for an open start.');
          break;
        }
        if (hasEnd) {
          if ((endYear as number) < (startYear as number)) {
            error('INVALID_DATE', path, 'Range end precedes range start.');
          } else if (endYear === startYear && isMonth(startMonth) && isMonth(endMonth)) {
            if (endMonth < startMonth) error('INVALID_DATE', path, 'Range end month precedes start month.');
          }
        }
        break;
      case 'era':
        if (!isNonEmptyString(value.eraLabel)) {
          error('INVALID_DATE', `${path}.eraLabel`, 'An era date needs an era label.');
        }
        break;
      case 'unknown':
        if (startYear !== null || endYear !== null) {
          error('INVALID_DATE', path, 'An unknown date must not carry years.');
        }
        break;
      default:
        break;
    }

    if (kind !== 'unknown' && !isNonEmptyString(value.original)) {
      warn('DATE_WITHOUT_ORIGINAL', `${path}.original`, 'Consider preserving the source wording for this date.');
    }
  };

  // ----------------------------------------------------------------- places
  places.forEach((entry, index) => {
    const path = `$.places[${index}]`;
    if (!isRecord(entry)) {
      error('DATASET_SHAPE', path, 'Place must be an object.');
      return;
    }
    if (registerId(entry.id, `${path}.id`, 'Place') && isNonEmptyString(entry.id)) {
      placeIds.add(entry.id);
    }
    if (typeof entry.kind !== 'string' || !PLACE_KINDS.has(entry.kind)) {
      error('INVALID_PLACE_KIND', `${path}.kind`, `Unknown place kind "${String(entry.kind)}".`);
    }
    const names = entry.names;
    if (!isRecord(names) || !isNonEmptyString(names.zh) || !isNonEmptyString(names.en)) {
      error('MISSING_FIELD', `${path}.names`, 'Place needs zh and en names.');
    }
    checkSourceRefs(entry.sourceRefs, `${path}.sourceRefs`, false);

    const coordinates = entry.coordinates;
    if (coordinates === null || coordinates === undefined) {
      return;
    }
    if (!isRecord(coordinates)) {
      error('INVALID_COORDINATE', `${path}.coordinates`, 'Coordinates must be an object or null.');
      return;
    }
    const cPath = `${path}.coordinates`;
    const lon = coordinates.longitude;
    const lat = coordinates.latitude;
    if (typeof lon !== 'number' || !Number.isFinite(lon)) {
      error('INVALID_COORDINATE', `${cPath}.longitude`, 'Longitude must be a finite number.');
    } else if (lon < -180 || lon > 180) {
      error('INVALID_COORDINATE', `${cPath}.longitude`, `Longitude ${lon} is outside -180..180.`);
    }
    if (typeof lat !== 'number' || !Number.isFinite(lat)) {
      error('INVALID_COORDINATE', `${cPath}.latitude`, 'Latitude must be a finite number.');
    } else if (lat < -90 || lat > 90) {
      error(
        'COORDINATE_SWAPPED',
        `${cPath}.latitude`,
        `Latitude ${lat} is outside -90..90; check for a latitude/longitude inversion.`,
      );
    }
    if (coordinates.crs !== 'WGS84') {
      error('COORDINATE_CRS', `${cPath}.crs`, `Canonical coordinates must be WGS84, got "${String(coordinates.crs)}". Do not relabel another frame.`);
    }
    if (typeof coordinates.precision !== 'string' || !PRECISIONS.has(coordinates.precision)) {
      error('COORDINATE_PRECISION', `${cPath}.precision`, 'Coordinate precision is required.');
    }
    if (typeof coordinates.method !== 'string' || !METHODS.has(coordinates.method)) {
      error('COORDINATE_METHOD', `${cPath}.method`, 'Coordinate evidence method is required.');
    }
    if (typeof coordinates.verification !== 'string' || !VERIFICATIONS.has(coordinates.verification)) {
      error('COORDINATE_VERIFICATION', `${cPath}.verification`, 'Coordinate verification state is required.');
    }
    checkSourceRefs(coordinates.sourceRefs, `${cPath}.sourceRefs`, true);
    if (entry.kind === 'institution' && coordinates.precision === 'site') {
      warn('INSTITUTION_SITE_PRECISION', cPath, 'An institution marker normally uses institution precision, not site precision.');
    }
    if (lat === 0 && lon === 0) {
      warn('NULL_ISLAND', cPath, 'Coordinates 0,0 usually indicate a placeholder rather than a real location.');
    }
  });

  // ------------------------------------------------------------------ works
  works.forEach((entry, index) => {
    const path = `$.works[${index}]`;
    if (!isRecord(entry)) {
      error('DATASET_SHAPE', path, 'Work must be an object.');
      return;
    }
    if (registerId(entry.id, `${path}.id`, 'Work') && isNonEmptyString(entry.id)) {
      workIds.add(entry.id);
    }
    const titles = entry.titles;
    if (!isRecord(titles) || !isNonEmptyString(titles.zh) || !isNonEmptyString(titles.en)) {
      error('MISSING_FIELD', `${path}.titles`, 'Work needs zh and en titles.');
    }
    if (!Array.isArray(entry.aliases) || !entry.aliases.every((alias) => typeof alias === 'string')) {
      error('MISSING_FIELD', `${path}.aliases`, 'aliases must be an array of strings (may be empty).');
    }
    checkDate(entry.compositionDate, `${path}.compositionDate`, true);

    if (!isDynastyId(entry.dynastyId)) {
      error(
        'DYNASTY',
        `${path}.dynastyId`,
        `dynastyId must be one of: ${DYNASTY_IDS.join(', ')}.`,
      );
    } else {
      const composition = entry.compositionDate;
      const year =
        isRecord(composition) && typeof composition.startYear === 'number'
          ? composition.startYear
          : null;
      if (year !== null && !yearInDynasty(year, entry.dynastyId)) {
        warn(
          'DYNASTY_DATE_MISMATCH',
          `${path}.dynastyId`,
          `Composition year ${year} falls outside the ${entry.dynastyId} range; check the filing.`,
        );
      }
    }
    if (
      entry.dynastyQualifier !== null &&
      entry.dynastyQualifier !== undefined &&
      typeof entry.dynastyQualifier !== 'string'
    ) {
      error(
        'DYNASTY_QUALIFIER',
        `${path}.dynastyQualifier`,
        'dynastyQualifier must be a string or null.',
      );
    }

    if (Array.isArray(entry.attribution)) {
      // An empty list would silently read as "nobody knows". A work whose maker
      // is unrecorded must say so with an explicit unknown entry instead.
      if (entry.attribution.length === 0) {
        error(
          'ATTRIBUTION_GAP',
          `${path}.attribution`,
          'Work must list credited persons or one explicit unknown entry.',
        );
      }
      entry.attribution.forEach((item, aIndex) => {
        const aPath = `${path}.attribution[${aIndex}]`;
        if (!isRecord(item)) {
          error('MISSING_FIELD', aPath, 'Attribution must be an object.');
          return;
        }
        if (!isNonEmptyString(item.name)) error('MISSING_FIELD', `${aPath}.name`, 'Attribution needs a name.');
        if (!isNonEmptyString(item.role)) {
          error('MISSING_FIELD', `${aPath}.role`, 'Attribution needs a role.');
        } else if (!ATTRIBUTION_ROLES.has(item.role)) {
          error('ATTRIBUTION_ROLE', `${aPath}.role`, `Unknown attribution role "${item.role}".`);
        }
        if (typeof item.certainty !== 'string' || !CERTAINTIES.has(item.certainty)) {
          error('ATTRIBUTION_CERTAINTY', `${aPath}.certainty`, 'Attribution needs a certainty value.');
        }
        if (item.note !== undefined && item.note !== null && typeof item.note !== 'string') {
          error('ATTRIBUTION_NOTE', `${aPath}.note`, 'Attribution note must be a string or null.');
        }
        if (item.noteZh !== undefined && item.noteZh !== null && typeof item.noteZh !== 'string') {
          error('ATTRIBUTION_NOTE', `${aPath}.noteZh`, 'Attribution noteZh must be a string or null.');
        }
        checkSourceRefs(item.sourceRefs, `${aPath}.sourceRefs`, item.certainty !== 'unknown');
      });
    } else {
      error('MISSING_FIELD', `${path}.attribution`, 'attribution must be an array.');
    }
    if (!isNonEmptyString(entry.background)) {
      error('MISSING_FIELD', `${path}.background`, 'Work needs a short background text.');
    }
    checkSourceRefs(entry.sourceRefs, `${path}.sourceRefs`, true);
    checkReview(entry.review, `${path}.review`, 'Work');
  });

  // ---------------------------------------------------------------- objects
  // Relationships may point at an object that is read later in the glob order,
  // so every object id is registered before any relationship is checked.
  for (const entry of objects) {
    if (isRecord(entry) && isNonEmptyString(entry.id)) objectIds.add(entry.id);
  }

  objects.forEach((entry, index) => {
    const path = `$.objects[${index}]`;
    if (!isRecord(entry)) {
      error('DATASET_SHAPE', path, 'Object must be an object.');
      return;
    }
    if (registerId(entry.id, `${path}.id`, 'Object') && isNonEmptyString(entry.id)) {
      objectIds.add(entry.id);
    }
    if (!isNonEmptyString(entry.workId) || !workIds.has(entry.workId)) {
      error('MISSING_WORK', `${path}.workId`, `Object points to unknown work "${String(entry.workId)}".`);
    }
    if (typeof entry.objectType !== 'string' || !OBJECT_TYPES.has(entry.objectType)) {
      error('INVALID_OBJECT_TYPE', `${path}.objectType`, `Unknown object type "${String(entry.objectType)}".`);
    }
    const titles = entry.titles;
    if (!isRecord(titles) || !isNonEmptyString(titles.zh) || !isNonEmptyString(titles.en)) {
      error('MISSING_FIELD', `${path}.titles`, 'Object needs zh and en titles.');
    }
    checkDate(entry.productionDate, `${path}.productionDate`, true);
    if (typeof entry.survivalStatus !== 'string' || !SURVIVAL.has(entry.survivalStatus)) {
      error('MISSING_FIELD', `${path}.survivalStatus`, 'survivalStatus must be surviving/lost/unknown.');
    }
    checkReview(entry.review, `${path}.review`, 'Object');

    // Collection assertion: a claim always carries evidence.
    const collection = entry.currentCollection;
    if (!isRecord(collection)) {
      error('MISSING_FIELD', `${path}.currentCollection`, 'currentCollection is required.');
    } else {
      const cPath = `${path}.currentCollection`;
      if (typeof collection.locationKind !== 'string' || !LOCATION_KINDS.has(collection.locationKind)) {
        error('INVALID_LOCATION_KIND', `${cPath}.locationKind`, 'Unknown location kind.');
      }
      checkSourceRefs(collection.sourceRefs, `${cPath}.sourceRefs`, true);
      if (!isIsoDate(collection.sourceAccessedAt)) {
        error('INVALID_ACCESS_DATE', `${cPath}.sourceAccessedAt`, 'Needs an ISO access date (YYYY-MM-DD).');
      }
      if (collection.placeId === null) {
        if (collection.locationKind !== 'unknown' && collection.locationKind !== 'last-known') {
          error('MISSING_PLACE', `${cPath}.placeId`, 'A named collection needs a place id.');
        }
      } else if (!isNonEmptyString(collection.placeId) || !placeIds.has(collection.placeId)) {
        error('MISSING_PLACE', `${cPath}.placeId`, `Unknown place "${String(collection.placeId)}".`);
      } else {
        usedPlaces.add(collection.placeId);
      }
    }

    // Relationships never point at the object itself.
    if (Array.isArray(entry.relationships)) {
      entry.relationships.forEach((item, rIndex) => {
        const rPath = `${path}.relationships[${rIndex}]`;
        if (!isRecord(item)) {
          error('MISSING_FIELD', rPath, 'Relationship must be an object.');
          return;
        }
        if (typeof item.type !== 'string' || !RELATIONSHIP_TYPES.has(item.type)) {
          error('INVALID_RELATION_TYPE', `${rPath}.type`, 'Unknown relationship type.');
        }
        if (item.targetObjectId === entry.id) {
          error('SELF_RELATION', `${rPath}.targetObjectId`, 'An object cannot relate to itself.');
        } else if (!isNonEmptyString(item.targetObjectId) || !objectIds.has(item.targetObjectId)) {
          error('MISSING_RELATION_TARGET', `${rPath}.targetObjectId`, `Unknown target object "${String(item.targetObjectId)}".`);
        }
        checkSourceRefs(item.sourceRefs, `${rPath}.sourceRefs`, true);
      });
    } else {
      error('MISSING_FIELD', `${path}.relationships`, 'relationships must be an array.');
    }

    // Events live inside the object that owns them.
    if (!Array.isArray(entry.provenanceEvents)) {
      error('MISSING_FIELD', `${path}.provenanceEvents`, 'provenanceEvents must be an array.');
    } else {
      entry.provenanceEvents.forEach((event, eIndex) => {
        const ePath = `${path}.provenanceEvents[${eIndex}]`;
        if (!isRecord(event)) {
          error('DATASET_SHAPE', ePath, 'Event must be an object.');
          return;
        }
        registerId(event.id, `${ePath}.id`, 'Event');
        if (event.objectId !== entry.id) {
          error('EVENT_OBJECT_MISMATCH', `${ePath}.objectId`, `Event belongs to "${String(event.objectId)}" but is stored on "${String(entry.id)}".`);
        }
        checkDate(event.date, `${ePath}.date`, true);
        checkSourceRefs(event.sourceRefs, `${ePath}.sourceRefs`, true);
        if (!isNonEmptyString(event.summary)) {
          error('MISSING_FIELD', `${ePath}.summary`, 'Event needs a summary.');
        }
        if (event.placeId !== null) {
          if (!isNonEmptyString(event.placeId) || !placeIds.has(event.placeId)) {
            error('MISSING_PLACE', `${ePath}.placeId`, `Unknown place "${String(event.placeId)}".`);
          } else {
            usedPlaces.add(event.placeId);
          }
        }
      });
    }
  });

  // ------------------------------------------------------------------ media
  media.forEach((entry, index) => {
    const path = `$.media[${index}]`;
    if (!isRecord(entry)) {
      error('DATASET_SHAPE', path, 'Media must be an object.');
      return;
    }
    registerId(entry.id, `${path}.id`, 'Media');
    if (!isNonEmptyString(entry.objectId) || !objectIds.has(entry.objectId)) {
      error('MISSING_OBJECT', `${path}.objectId`, `Media points to unknown object "${String(entry.objectId)}".`);
    }
    checkSourceRefs(entry.sourceRefs, `${path}.sourceRefs`, true);
    if (!isNonEmptyString(entry.rightsEvidence)) {
      error('MEDIA_WITHOUT_RIGHTS', `${path}.rightsEvidence`, 'Bundled media needs a rights record before publication.');
    }
    if (!isNonEmptyString(entry.license)) {
      error('MEDIA_WITHOUT_RIGHTS', `${path}.license`, 'Media needs an explicit license.');
    }
    if (isNonEmptyString(entry.assetPathOrUrl) && /^http:\/\//i.test(entry.assetPathOrUrl)) {
      warn('INSECURE_MEDIA_URL', `${path}.assetPathOrUrl`, 'Prefer https for remote media.');
    }
  });

  // --------------------------------------------------------------- orphans
  for (const id of sourceIds) {
    if (!usedSources.has(id)) warn('UNUSED_SOURCE', '$.sources', `Source "${id}" is defined but never cited.`);
  }
  for (const id of placeIds) {
    if (!usedPlaces.has(id)) warn('UNUSED_PLACE', '$.places', `Place "${id}" is not referenced by any record.`);
  }

  // ------------------------------------------------------------ release gate
  if (options.releaseMode) {
    for (const entry of [...works, ...objects]) {
      if (isRecord(entry) && isRecord(entry.review) && entry.review.state === 'draft') {
        error('DRAFT_IN_RELEASE', '$.review', `Draft record "${String(entry.id)}" cannot ship in a release build.`);
      }
    }
  }

  let eventCount = 0;
  for (const entry of objects) {
    if (isRecord(entry) && Array.isArray(entry.provenanceEvents)) {
      eventCount += entry.provenanceEvents.length;
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      works: works.length,
      objects: objects.length,
      places: places.length,
      sources: sources.length,
      media: media.length,
      events: eventCount,
    },
  };

  function checkReview(value: unknown, path: string, kind: string) {
    if (!isRecord(value)) {
      error('MISSING_REVIEW', path, `${kind} needs a review state.`);
      return;
    }
    if (typeof value.state !== 'string' || !REVIEW_STATES.has(value.state)) {
      error('MISSING_REVIEW', `${path}.state`, 'review.state must be draft or reviewed.');
    }
    if (value.state === 'draft' && !isNonEmptyString(value.note)) {
      warn('DRAFT_WITHOUT_NOTE', `${path}.note`, 'A draft record should say what still needs checking.');
    }
  }
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(
    `Records: ${report.counts.works} works, ${report.counts.objects} objects, ${report.counts.places} places, ` +
      `${report.counts.sources} sources, ${report.counts.events} events, ${report.counts.media} media items.`,
  );
  if (report.errors.length === 0) {
    lines.push('Errors: 0');
  } else {
    lines.push(`Errors: ${report.errors.length}`);
    for (const issue of report.errors) lines.push(`  [${issue.code}] ${issue.path}: ${issue.message}`);
  }
  if (report.warnings.length > 0) {
    lines.push(`Warnings: ${report.warnings.length}`);
    for (const issue of report.warnings) lines.push(`  [${issue.code}] ${issue.path}: ${issue.message}`);
  }
  return lines.join('\n');
}

/** Convenience for the app: validate a parsed dataset object. */
export function validateTypedDataset(dataset: Dataset, releaseMode = false): ValidationReport {
  return validateDataset(dataset, { releaseMode });
}
