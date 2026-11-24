#!/usr/bin/env node
/**
 * Read-only validation of the ontology pilot (research layer).
 *
 * The production loaders, the browser and `src/domain/validate.ts` never read
 * this file. The check exists so the five-case pilot can be rerun against a
 * pinned corpus before anyone extends it to the website. It writes nothing.
 *
 * Usage:
 *   node scripts/research/check-ontology-pilot.mjs
 *   node scripts/research/check-ontology-pilot.mjs --pilot <file> --data <repo-root> --base c6fd7c0
 *   node scripts/research/check-ontology-pilot.mjs --self-test
 *
 * The negative cases in `--self-test` mutate in-memory copies only. No fixture
 * on disk is edited, so a failed mutation cannot leave the repository dirty.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const PINNED_PILOT = join(here, 'inputs', 'ontology-pilot.a5e56b1.json');

const PREDICATES = new Map([
  ['production-era', 'string'],
  ['assigned-version', 'string'],
  ['copyist-attribution', 'string'],
  ['diagnostic-reading', 'string'],
  ['writer-count', 'string'],
  ['album-leaf-count', 'string'],
  ['event-year', 'integer'],
]);
const KINDS = new Set(['source-report', 'scholarly-opinion', 'editor-interpretation']);
const STANCES = new Set(['supports', 'questions']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function readItems(root, relativePath) {
  const parsed = readJson(join(root, relativePath));
  if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
    throw new Error(relativePath + ' must contain an "items" array.');
  }
  return parsed.items;
}

function readRecords(root, relativeDir) {
  return readdirSync(join(root, relativeDir))
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => readJson(join(root, relativeDir, file)));
}

function loadDataset(root) {
  return {
    works: readRecords(root, 'data/works'),
    objects: readRecords(root, 'data/objects'),
    sources: readItems(root, 'data/sources.json'),
    media: readItems(root, 'data/media.json'),
  };
}

function collectDuplicates(rows, label) {
  const seen = new Map();
  const duplicates = [];
  for (const row of rows) {
    if (!isRecord(row) || !isText(row.id)) continue;
    if (seen.has(row.id)) duplicates.push({ label, id: row.id });
    else seen.set(row.id, true);
  }
  return duplicates;
}

function indexDataset(dataset) {
  const eventRows = dataset.objects.flatMap((object) =>
    Array.isArray(object.provenanceEvents)
      ? object.provenanceEvents.map((event) => ({ event, ownerId: object.id }))
      : [],
  );
  return {
    works: new Map(dataset.works.map((work) => [work.id, work])),
    objects: new Map(dataset.objects.map((object) => [object.id, object])),
    sources: new Map(dataset.sources.map((source) => [source.id, source])),
    media: new Map(dataset.media.map((item) => [item.id, item])),
    events: new Map(eventRows.map(({ event, ownerId }) => [event.id, { event, ownerId }])),
    duplicates: [
      ...collectDuplicates(dataset.works, 'work'),
      ...collectDuplicates(dataset.objects, 'object'),
      ...collectDuplicates(dataset.sources, 'source'),
      ...collectDuplicates(dataset.media, 'media'),
      ...collectDuplicates(eventRows.map(({ event }) => event), 'event'),
    ],
  };
}

function validatePilot(pilot, index, options = {}) {
  const errors = [];
  const warnings = [];
  const note = (list, code, path, message, context = {}) =>
    list.push({ code, path, message, ...context });
  const error = (code, path, message, context) => note(errors, code, path, message, context);
  const warn = (code, path, message, context) => note(warnings, code, path, message, context);

  const stats = {
    cases: 0,
    objects: new Set(),
    claims: 0,
    evidence: 0,
    versions: 0,
    media: 0,
    conflicts: 0,
  };
  const caseRecords = [];
  const claimIndex = new Map();
  const versionIndex = new Map();
  const workToCase = new Map();

  for (const duplicate of index.duplicates) {
    error(
      'DATASET_DUPLICATE_ID',
      'data/',
      `The pinned corpus uses ${duplicate.label} id "${duplicate.id}" more than once.`,
    );
  }

  if (!isRecord(pilot)) {
    error('PILOT_SHAPE', '$', 'The pilot must be a JSON object.');
    return { errors, warnings, stats, caseRecords };
  }

  for (const field of ['model', 'baseRevision', 'preparedBy', 'method', 'sourceCheckedOn']) {
    if (!isText(pilot[field])) {
      error('PILOT_FIELD_MISSING', `$.${field}`, `The pilot must declare ${field}.`);
    }
  }
  if (isText(pilot.sourceCheckedOn) && !ISO_DATE.test(pilot.sourceCheckedOn)) {
    error('PILOT_DATE_INVALID', '$.sourceCheckedOn', 'sourceCheckedOn must be YYYY-MM-DD.');
  }
  // Constraint 6: the pilot is a draft until an editor accepts it. Passing this
  // check never promotes that state.
  if (pilot.status !== 'draft') {
    error('PILOT_STATUS_NOT_DRAFT', '$.status', 'The trial must stay in status "draft" until editorial approval.');
  }
  if (options.base && pilot.baseRevision !== options.base) {
    error(
      'PILOT_BASE_REVISION_MISMATCH',
      '$.baseRevision',
      `The pilot declares "${String(pilot.baseRevision)}" but the check was asked to verify "${options.base}".`,
    );
  }
  if (!Array.isArray(pilot.cases) || pilot.cases.length === 0) {
    error('PILOT_CASES_MISSING', '$.cases', 'The pilot needs at least one case.');
    return { errors, warnings, stats, caseRecords };
  }

  // First pass: works, objects, versions and media. Versions must be indexed
  // before claims can resolve an assigned-version value.
  pilot.cases.forEach((entry, caseIndex) => {
    const casePath = `$.cases[${caseIndex}]`;
    if (!isRecord(entry)) {
      error('CASE_SHAPE', casePath, 'A case must be an object.');
      return;
    }
    stats.cases += 1;
    const workId = entry.work;
    if (!isText(workId)) {
      error('CASE_WORK_MISSING', `${casePath}.work`, 'A case needs a work id.');
    } else if (!index.works.has(workId)) {
      error('CASE_WORK_UNKNOWN', `${casePath}.work`, `Work "${workId}" is not in data/works.`, { caseWork: workId });
    } else if (workToCase.has(workId)) {
      error('CASE_DUPLICATE_WORK', `${casePath}.work`, `Work "${workId}" is already used by another case.`, { caseWork: workId });
    } else {
      workToCase.set(workId, caseIndex);
    }

    const objectIds = [];
    if (!Array.isArray(entry.objects) || entry.objects.length === 0) {
      error('CASE_OBJECTS_MISSING', `${casePath}.objects`, 'A case needs at least one object id.', { caseWork: workId });
    } else {
      entry.objects.forEach((objectId, objectIndex) => {
        const objectPath = `${casePath}.objects[${objectIndex}]`;
        if (!isText(objectId)) {
          error('CASE_OBJECT_INVALID', objectPath, 'Object ids must be non-empty strings.', { caseWork: workId });
          return;
        }
        if (objectIds.includes(objectId)) {
          error('CASE_DUPLICATE_OBJECT', objectPath, `Object "${objectId}" is listed twice.`, { caseWork: workId });
          return;
        }
        objectIds.push(objectId);
        const object = index.objects.get(objectId);
        if (!object) {
          error('CASE_OBJECT_UNKNOWN', objectPath, `Object "${objectId}" is not in data/objects.`, { caseWork: workId });
        } else if (object.workId !== workId) {
          error(
            'CASE_OBJECT_WORK_MISMATCH',
            objectPath,
            `Object "${objectId}" belongs to work "${object.workId}", not "${String(workId)}".`,
            { caseWork: workId },
          );
        } else {
          stats.objects.add(objectId);
        }
      });
    }

    if (entry.versions !== undefined) {
      if (!Array.isArray(entry.versions)) {
        error('CASE_VERSIONS_SHAPE', `${casePath}.versions`, 'versions must be an array.', { caseWork: workId });
      } else {
        entry.versions.forEach((version, versionIndexInCase) => {
          const versionPath = `${casePath}.versions[${versionIndexInCase}]`;
          stats.versions += 1;
          if (!isRecord(version)) {
            error('VERSION_SHAPE', versionPath, 'A version must be an object.', { caseWork: workId });
            return;
          }
          for (const field of ['id', 'label', 'basis', 'work']) {
            if (!isText(version[field])) {
              error('VERSION_FIELD_MISSING', `${versionPath}.${field}`, `Version needs ${field}.`, { caseWork: workId });
            }
          }
          if (isText(version.id)) {
            if (versionIndex.has(version.id)) {
              error('VERSION_DUPLICATE_ID', `${versionPath}.id`, `Version id "${version.id}" is already used.`, { caseWork: workId });
            } else {
              versionIndex.set(version.id, { version, caseWork: workId });
            }
          }
          if (isText(version.work) && !index.works.has(version.work)) {
            error('VERSION_WORK_UNKNOWN', `${versionPath}.work`, `Version "${String(version.id)}" points at unknown work "${version.work}".`, { caseWork: workId });
          } else if (isText(version.work) && workId && version.work !== workId) {
            error(
              'VERSION_WORK_MISMATCH',
              `${versionPath}.work`,
              `Version "${String(version.id)}" belongs to work "${version.work}", not "${workId}".`,
              { caseWork: workId },
            );
          }
        });
      }
    }

    if (entry.media !== undefined) {
      if (!Array.isArray(entry.media)) {
        error('CASE_MEDIA_SHAPE', `${casePath}.media`, 'media must be an array.', { caseWork: workId });
      } else {
        entry.media.forEach((mediaId, mediaIndexInCase) => {
          const mediaPath = `${casePath}.media[${mediaIndexInCase}]`;
          const media = index.media.get(mediaId);
          if (!media) {
            error('CASE_MEDIA_UNKNOWN', mediaPath, `Media "${String(mediaId)}" is not in data/media.json.`, { caseWork: workId });
            return;
          }
          stats.media += 1;
          if (!objectIds.includes(media.objectId)) {
            error(
              'CASE_MEDIA_OBJECT_MISMATCH',
              mediaPath,
              `Media "${mediaId}" is bound to object "${String(media.objectId)}", which is not in case "${String(workId)}".`,
              { caseWork: workId },
            );
          }
          if (!isText(media.license) || !isText(media.rightsEvidence)) {
            error(
              'MEDIA_RIGHTS_MISSING',
              mediaPath,
              `Media "${mediaId}" needs a license and a rights-evidence record before reuse can be assessed.`,
              { caseWork: workId },
            );
          }
        });
      }
    }

    if (!isText(entry.guard)) {
      error('CASE_GUARD_MISSING', `${casePath}.guard`, 'A case needs a guard naming the inference a reviewer must reject.', { caseWork: workId });
    }
    if (!Array.isArray(entry.unresolved)) {
      error('CASE_UNRESOLVED_SHAPE', `${casePath}.unresolved`, 'unresolved must be an array.', { caseWork: workId });
    } else {
      entry.unresolved.forEach((item, unresolvedIndex) => {
        if (!isText(item)) {
          error(
            'CASE_UNRESOLVED_INVALID',
            `${casePath}.unresolved[${unresolvedIndex}]`,
            'Unresolved items must be non-empty text.',
            { caseWork: workId },
          );
        }
      });
    }

    caseRecords.push({
      path: casePath,
      workId,
      objectIds,
      entry,
      claimIds: [],
    });
  });

  // Second pass: claims. Claims are indexed before conflicts and probes.
  for (const record of caseRecords) {
    if (!Array.isArray(record.entry.claims) || record.entry.claims.length === 0) {
      error('CASE_CLAIMS_MISSING', `${record.path}.claims`, 'A case needs at least one claim.', { caseWork: record.workId });
      continue;
    }
    record.entry.claims.forEach((claim, claimIndexInCase) => {
      const claimPath = `${record.path}.claims[${claimIndexInCase}]`;
      stats.claims += 1;
      if (!isRecord(claim)) {
        error('CLAIM_SHAPE', claimPath, 'A claim must be an object.', { caseWork: record.workId });
        return;
      }
      const claimId = claim.id;
      if (!isText(claimId)) {
        error('CLAIM_ID_MISSING', `${claimPath}.id`, 'A claim needs a stable id.', { caseWork: record.workId });
      } else {
        record.claimIds.push(claimId);
        if (claimIndex.has(claimId)) {
          error(
            'CLAIM_DUPLICATE_ID',
            `${claimPath}.id`,
            `Claim id "${claimId}" is already used in case "${claimIndex.get(claimId).caseWork}".`,
            { caseWork: record.workId, claimId },
          );
        } else {
          claimIndex.set(claimId, { claim, caseWork: record.workId, path: claimPath });
        }
      }
      const label = isText(claimId) ? claimId : `claim #${claimIndexInCase}`;

      const valueType = PREDICATES.get(claim.predicate);
      if (!valueType) {
        error(
          'CLAIM_PREDICATE_UNKNOWN',
          `${claimPath}.predicate`,
          `Claim "${label}" uses unknown predicate "${String(claim.predicate)}".`,
          { caseWork: record.workId, claimId: label },
        );
      } else if (valueType === 'string' && !isText(claim.value)) {
        error('CLAIM_VALUE_TYPE', `${claimPath}.value`, `Claim "${label}" (${claim.predicate}) needs non-empty text.`, { caseWork: record.workId, claimId: label });
      } else if (valueType === 'integer' && !(Number.isInteger(claim.value) && claim.value !== 0)) {
        error('CLAIM_VALUE_TYPE', `${claimPath}.value`, `Claim "${label}" (${claim.predicate}) needs a non-zero integer.`, { caseWork: record.workId, claimId: label });
      }

      if (!KINDS.has(claim.kind)) {
        error('CLAIM_KIND_UNKNOWN', `${claimPath}.kind`, `Claim "${label}" needs kind source-report, scholarly-opinion or editor-interpretation.`, { caseWork: record.workId, claimId: label });
      }
      if (claim.stance !== undefined && claim.stance !== null && !STANCES.has(claim.stance)) {
        error('CLAIM_STANCE_UNKNOWN', `${claimPath}.stance`, `Claim "${label}" stance must be supports or questions.`, { caseWork: record.workId, claimId: label });
      }
      if (!isText(claim.voice)) {
        error('CLAIM_VOICE_MISSING', `${claimPath}.voice`, `Claim "${label}" needs the voice that made the statement.`, { caseWork: record.workId, claimId: label });
      }

      if (!Array.isArray(claim.evidence) || claim.evidence.length === 0) {
        error('CLAIM_EVIDENCE_MISSING', `${claimPath}.evidence`, `Claim "${label}" needs at least one evidence item.`, { caseWork: record.workId, claimId: label });
      } else {
        claim.evidence.forEach((evidence, evidenceIndex) => {
          const evidencePath = `${claimPath}.evidence[${evidenceIndex}]`;
          if (!isRecord(evidence)) {
            error('CLAIM_EVIDENCE_SHAPE', evidencePath, 'Evidence must be an object.', { caseWork: record.workId, claimId: label });
            return;
          }
          stats.evidence += 1;
          if (!isText(evidence.source)) {
            error('CLAIM_EVIDENCE_SOURCE_MISSING', `${evidencePath}.source`, `Claim "${label}" evidence ${evidenceIndex} needs a source id.`, { caseWork: record.workId, claimId: label });
          } else if (!index.sources.has(evidence.source)) {
            error(
              'CLAIM_EVIDENCE_SOURCE_UNKNOWN',
              `${evidencePath}.source`,
              `Claim "${label}" cites source "${evidence.source}", which is not in data/sources.json.`,
              { caseWork: record.workId, claimId: label },
            );
          }
          if (!isText(evidence.locator)) {
            error(
              'CLAIM_EVIDENCE_LOCATOR_MISSING',
              `${evidencePath}.locator`,
              `Claim "${label}" evidence ${evidenceIndex} has no paragraph, colophon or entry locator.`,
              { caseWork: record.workId, claimId: label },
            );
          }
        });
      }

      if (claim.predicate === 'event-year') {
        const eventEntry = index.events.get(claim.subject);
        if (!eventEntry) {
          error(
            'CLAIM_EVENT_UNKNOWN',
            `${claimPath}.subject`,
            `Claim "${label}" must point at an event; "${String(claim.subject)}" is not in the corpus.`,
            { caseWork: record.workId, claimId: label },
          );
        } else {
          if (!record.objectIds.includes(eventEntry.ownerId)) {
            error(
              'CLAIM_EVENT_OBJECT_MISMATCH',
              `${claimPath}.subject`,
              `Event "${String(claim.subject)}" belongs to object "${eventEntry.ownerId}", which is not in case "${record.workId}".`,
              { caseWork: record.workId, claimId: label },
            );
          }
          const { startYear, endYear } = eventEntry.event.date ?? {};
          if (
            Number.isInteger(claim.value) &&
            Number.isInteger(startYear) &&
            Number.isInteger(endYear) &&
            (claim.value < startYear || claim.value > endYear)
          ) {
            warn(
              'EVENT_YEAR_OUTSIDE_RANGE',
              `${claimPath}.value`,
              `Claim "${label}" value ${claim.value} falls outside the recorded event range ${startYear}-${endYear}.`,
              { caseWork: record.workId, claimId: label },
            );
          }
        }
      } else {
        const subject = index.objects.get(claim.subject);
        if (!subject) {
          error(
            'CLAIM_SUBJECT_UNKNOWN',
            `${claimPath}.subject`,
            `Claim "${label}" points at "${String(claim.subject)}", which is not an object in the corpus.`,
            { caseWork: record.workId, claimId: label },
          );
        } else if (!record.objectIds.includes(claim.subject)) {
          error(
            'CLAIM_SUBJECT_UNKNOWN',
            `${claimPath}.subject`,
            `Claim "${label}" points at object "${claim.subject}", which is outside case "${record.workId}".`,
            { caseWork: record.workId, claimId: label },
          );
        }

        if (claim.predicate === 'assigned-version') {
          const versionEntry = versionIndex.get(claim.value);
          if (!versionEntry) {
            error(
              'CLAIM_VERSION_UNKNOWN',
              `${claimPath}.value`,
              `Claim "${label}" assigns unknown version "${String(claim.value)}".`,
              { caseWork: record.workId, claimId: label },
            );
          } else if (versionEntry.caseWork !== record.workId) {
            error(
              'CLAIM_VERSION_WORK_MISMATCH',
              `${claimPath}.value`,
              `Version "${claim.value}" belongs to case "${versionEntry.caseWork}", not "${record.workId}".`,
              { caseWork: record.workId, claimId: label },
            );
          } else if (subject && versionEntry.version.work !== subject.workId) {
            error(
              'CLAIM_VERSION_WORK_MISMATCH',
              `${claimPath}.value`,
              `Version "${claim.value}" belongs to work "${versionEntry.version.work}", but object "${claim.subject}" belongs to "${subject.workId}".`,
              { caseWork: record.workId, claimId: label },
            );
          }
        }

        if (
          claim.predicate === 'production-era' &&
          subject &&
          isText(subject.productionDate?.eraLabel) &&
          claim.value !== subject.productionDate.eraLabel
        ) {
          warn(
            'PRODUCTION_ERA_MISMATCH',
            `${claimPath}.value`,
            `Claim "${label}" says era "${claim.value}" but object "${claim.subject}" records "${subject.productionDate.eraLabel}".`,
            { caseWork: record.workId, claimId: label },
          );
        }
      }
    });
  }

  // Conflicts: every member must resolve inside the same case, with at least
  // two different values recoverable from the claims themselves.
  for (const record of caseRecords) {
    if (record.entry.conflicts === undefined) continue;
    if (!Array.isArray(record.entry.conflicts)) {
      error('CASE_CONFLICTS_SHAPE', `${record.path}.conflicts`, 'conflicts must be an array.', { caseWork: record.workId });
      continue;
    }
    record.entry.conflicts.forEach((conflict, conflictIndex) => {
      const conflictPath = `${record.path}.conflicts[${conflictIndex}]`;
      stats.conflicts += 1;
      if (!isRecord(conflict)) {
        error('CONFLICT_SHAPE', conflictPath, 'A conflict must be an object.', { caseWork: record.workId });
        return;
      }
      const members = conflict.members;
      const resolved = [];
      if (!Array.isArray(members) || members.length < 2) {
        error('CONFLICT_MEMBERS_INSUFFICIENT', `${conflictPath}.members`, 'A conflict needs at least two member claims.', { caseWork: record.workId });
      } else {
        if (new Set(members).size !== members.length) {
          error('CONFLICT_DUPLICATE_MEMBER', `${conflictPath}.members`, 'A conflict lists the same member twice.', { caseWork: record.workId });
        }
        for (const member of members) {
          const entry = claimIndex.get(member);
          if (!entry) {
            error('CONFLICT_MEMBER_UNKNOWN', `${conflictPath}.members`, `Conflict member "${String(member)}" is not a claim in the pilot.`, { caseWork: record.workId });
          } else if (entry.caseWork !== record.workId) {
            error('CONFLICT_MEMBER_CROSS_CASE', `${conflictPath}.members`, `Conflict member "${member}" belongs to case "${entry.caseWork}".`, { caseWork: record.workId });
          } else {
            resolved.push(entry.claim);
          }
        }
        if (resolved.length >= 2) {
          if (new Set(resolved.map((claim) => claim.value)).size < 2) {
            error('CONFLICT_VALUES_IDENTICAL', `${conflictPath}.members`, 'A conflict needs at least two different values; identical values are not a conflict.', { caseWork: record.workId });
          }
          if (new Set(resolved.map((claim) => claim.predicate)).size > 1) {
            error('CONFLICT_PREDICATE_MISMATCH', `${conflictPath}.members`, 'Conflict members must assert the same predicate.', { caseWork: record.workId });
          }
        }
      }
      if (!isText(conflict.reason)) {
        error('CONFLICT_REASON_MISSING', `${conflictPath}.reason`, 'A conflict needs a reason explaining why the statements disagree.', { caseWork: record.workId });
      }
      if (!('selected' in conflict)) {
        error('CONFLICT_SELECTION_MISSING', `${conflictPath}.selected`, 'A conflict must record selected (null while unresolved).', { caseWork: record.workId });
      } else if (conflict.selected !== null && !(Array.isArray(members) && members.includes(conflict.selected))) {
        error('CONFLICT_SELECTED_UNKNOWN', `${conflictPath}.selected`, 'selected must be null or one of the members.', { caseWork: record.workId });
      }
    });
  }

  // Competency probes named in the research. They fail only when the pilot
  // stops returning the two answers the trial was built to demonstrate.
  const allClaims = [...claimIndex.values()].map((entry) => entry.claim);
  const jizhiYears = allClaims.filter(
    (claim) => claim.subject === 'witness-jizhi-yuan-acquisition' && claim.predicate === 'event-year',
  );
  const yearValues = jizhiYears.map((claim) => claim.value);
  if (![1282, 1283].every((year) => yearValues.includes(year))) {
    error('PROBE_JIZHI_TWO_YEARS', '$.cases', 'The Jizhi case must return both 1282 and 1283 as separate event-year claims.');
  }
  const locatorFor = (year) => jizhiYears.find((claim) => claim.value === year)?.evidence?.[0]?.locator ?? '';
  if (!/楷书/.test(locatorFor(1282)) || !/行书/.test(locatorFor(1283))) {
    error('PROBE_JIZHI_COLOPHON_LOCATORS', '$.cases', 'The 1282 claim must cite the regular-script colophon and the 1283 claim the running-script colophon.');
  }
  const jizhiUnresolved = caseRecords
    .filter((record) => record.workId === 'jizhi')
    .flatMap((record) => record.entry.conflicts ?? [])
    .some(
      (conflict) =>
        Array.isArray(conflict.members) &&
        conflict.members.includes('ji-1282') &&
        conflict.members.includes('ji-1283') &&
        conflict.selected === null,
    );
  if (!jizhiUnresolved) {
    error('PROBE_JIZHI_UNRESOLVED', '$.cases', 'The two Jizhi years must stay in one conflict group with selected: null.');
  }

  const lantingAttributions = allClaims.filter(
    (claim) => claim.predicate === 'copyist-attribution' && claim.value === '冯承素',
  );
  const stances = new Set(lantingAttributions.map((claim) => claim.stance));
  if (!stances.has('supports') || !stances.has('questions')) {
    error('PROBE_LANTING_STANCES', '$.cases', 'Filtering by "冯承素" must return both a supports and a questions statement.');
  }
  const attributionLocators = new Set(
    lantingAttributions.map((claim) => claim.evidence?.[0]?.locator).filter(Boolean),
  );
  if (attributionLocators.size < 2) {
    error('PROBE_LANTING_DISTINCT_LOCATORS', '$.cases', 'The Lanting support and doubt need different evidence locators.');
  }

  stats.objects = stats.objects.size;
  return { errors, warnings, stats, caseRecords };
}

function formatValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function printReport(result, pilot, pilotPath, dataset, options) {
  const hash = createHash('sha256').update(readFileSync(pilotPath)).digest('hex');
  const displayPath = isAbsolute(pilotPath)
    ? relative(repoRoot, pilotPath) || pilotPath
    : pilotPath;
  console.log('Ontology pilot check (read-only research layer)');
  console.log(`Pilot: ${displayPath.replaceAll('\\', '/')}`);
  console.log(`SHA-256: ${hash}`);
  console.log(
    `Declared: model ${String(pilot.model)} | baseRevision ${String(pilot.baseRevision)} | status ${String(pilot.status)} | preparedBy ${String(pilot.preparedBy)} | method ${String(pilot.method)} | sourceCheckedOn ${String(pilot.sourceCheckedOn)}`,
  );
  console.log(
    `Corpus: ${dataset.works.length} works, ${dataset.objects.length} objects, ${dataset.sources.length} sources, ${dataset.media.length} media ${dataset.media.length === 1 ? 'item' : 'items'}`,
  );
  if (!options.base) {
    console.log('Base revision: not enforced (pass --base <sha> to compare with baseRevision).');
  }
  console.log('');

  const failedCases = new Map();
  for (const issue of result.errors) {
    if (issue.caseWork) failedCases.set(issue.caseWork, true);
  }
  for (const record of result.caseRecords) {
    const status = failedCases.has(record.workId) ? 'failed' : 'ok';
    console.log(
      `[${status}] ${record.workId} -> ${record.objectIds.join(', ') || '(no objects)'} | claims: ${record.claimIds.join(', ') || '(none)'}`,
    );
  }
  console.log('');

  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
    for (const issue of result.errors) {
      console.log(`  [${issue.code}] ${issue.path}: ${issue.message}`);
    }
  } else {
    console.log('Errors: 0');
  }
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length}`);
    for (const issue of result.warnings) {
      console.log(`  [${issue.code}] ${issue.path}: ${issue.message}`);
    }
  } else {
    console.log('Warnings: 0');
  }
  const { stats } = result;
  console.log('');
  console.log(
    `Counts: ${stats.cases} cases, ${stats.objects} objects, ${stats.claims} claims, ${stats.evidence} evidence items, ${stats.versions} ${stats.versions === 1 ? 'version' : 'versions'}, ${stats.media} media ${stats.media === 1 ? 'link' : 'links'}, ${stats.conflicts} ${stats.conflicts === 1 ? 'conflict' : 'conflicts'}.`,
  );
  console.log(
    result.errors.length === 0
      ? 'Research pilot validation passed.'
      : 'Research pilot validation FAILED.',
  );
}

function findCase(pilot, workId) {
  return pilot.cases.find((entry) => entry.work === workId);
}

function findClaim(pilot, workId, claimId) {
  return findCase(pilot, workId)?.claims?.find((claim) => claim.id === claimId);
}

function runSelfTest(pilot, index, options) {
  const negativeCases = [
    {
      name: 'bad-source',
      expected: 'CLAIM_EVIDENCE_SOURCE_UNKNOWN',
      caseWork: 'yan-qinli-bei',
      claimId: 'yan-era',
      mutate(copy) {
        findClaim(copy, 'yan-qinli-bei', 'yan-era').evidence[0].source = 'src-ghost';
      },
    },
    {
      name: 'wrong-object',
      expected: 'CLAIM_SUBJECT_UNKNOWN',
      caseWork: 'liqi-bei',
      claimId: 'li-face',
      mutate(copy) {
        findClaim(copy, 'liqi-bei', 'li-face').subject = 'witness-jizhi';
      },
    },
    {
      name: 'missing-locator',
      expected: 'CLAIM_EVIDENCE_LOCATOR_MISSING',
      caseWork: 'zhang-menglong-bei',
      claimId: 'zhang-extent',
      mutate(copy) {
        findClaim(copy, 'zhang-menglong-bei', 'zhang-extent').evidence[0].locator = '   ';
      },
    },
    {
      name: 'conflict-member-lost',
      expected: 'CONFLICT_MEMBERS_INSUFFICIENT',
      caseWork: 'jizhi',
      mutate(copy) {
        findCase(copy, 'jizhi').conflicts[0].members = ['ji-1282'];
      },
    },
    {
      name: 'unknown-version',
      expected: 'CLAIM_VERSION_UNKNOWN',
      caseWork: 'lanting',
      claimId: 'lan-version',
      mutate(copy) {
        findClaim(copy, 'lanting', 'lan-version').value = 'trial-ghost';
      },
    },
    {
      name: 'media-bound-elsewhere',
      expected: 'CASE_MEDIA_OBJECT_MISMATCH',
      caseWork: 'yan-qinli-bei',
      mutate(copy) {
        findCase(copy, 'lanting').media = [];
        findCase(copy, 'yan-qinli-bei').media = ['media-shenlong-opening'];
      },
    },
  ];

  console.log('');
  console.log('Self-test (in-memory mutations; no fixture is written):');
  let passed = 0;
  for (const test of negativeCases) {
    const copy = structuredClone(pilot);
    test.mutate(copy);
    const result = validatePilot(copy, index, { ...options, base: null });
    const hit = result.errors.find(
      (issue) =>
        issue.code === test.expected &&
        (!test.caseWork || issue.caseWork === test.caseWork) &&
        (!test.claimId || issue.claimId === test.claimId),
    );
    if (hit) {
      passed += 1;
      console.log(`  PASS ${test.name} -> ${hit.code} at ${hit.path}`);
    } else {
      const codes = result.errors.map((issue) => issue.code).join(', ') || 'no errors';
      console.log(`  FAIL ${test.name} -> expected ${test.expected}; got ${codes}`);
    }
  }

  const restored = validatePilot(structuredClone(pilot), index, options);
  const restoredOk = restored.errors.length === 0;
  console.log(
    restoredOk
      ? '  PASS restored-pilot -> 0 errors'
      : `  FAIL restored-pilot -> ${restored.errors.length} error(s)`,
  );
  const allPassed = passed === negativeCases.length && restoredOk;
  console.log(
    `Self-test: ${passed}/${negativeCases.length} negative cases detected; restored pilot ${restoredOk ? 'passed' : 'failed'}.`,
  );
  return allPassed;
}

function parseArgs(argv) {
  const options = {
    selfTest: false,
    pilot: null,
    dataRoot: repoRoot,
    base: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--self-test') {
      options.selfTest = true;
    } else if (arg === '--pilot' || arg === '--data' || arg === '--base') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value.`);
      index += 1;
      if (arg === '--pilot') options.pilot = resolve(value);
      if (arg === '--data') options.dataRoot = resolve(value);
      if (arg === '--base') options.base = value;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/research/check-ontology-pilot.mjs [--pilot <file>] [--data <root>] [--base <sha>] [--self-test]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function defaultPilot() {
  const merged = join(repoRoot, 'docs', 'research', 'ontology-pilot.json');
  return existsSync(merged) ? merged : PINNED_PILOT;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (caught) {
    console.error((caught instanceof Error ? caught.message : String(caught)));
    process.exit(2);
  }

  const pilotPath = options.pilot ?? defaultPilot();
  if (!existsSync(pilotPath)) {
    console.error(`Pilot file not found: ${pilotPath}`);
    console.error('Pass --pilot, or check out the research branch that adds docs/research/ontology-pilot.json.');
    process.exit(2);
  }

  let pilot;
  let dataset;
  try {
    pilot = readJson(pilotPath);
    dataset = loadDataset(options.dataRoot);
  } catch (caught) {
    console.error(`Could not read the inputs: ${caught instanceof Error ? caught.message : String(caught)}`);
    process.exit(2);
  }

  const index = indexDataset(dataset);
  const result = validatePilot(pilot, index, options);
  printReport(result, pilot, pilotPath, dataset, options);

  let selfTestOk = true;
  if (options.selfTest) {
    selfTestOk = runSelfTest(pilot, index, options);
  }

  if (result.errors.length > 0 || !selfTestOk) process.exitCode = 1;
}

main();
