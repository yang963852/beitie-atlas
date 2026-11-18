import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadDatasetFromDisk } from '../scripts/lib/dataset';
import {
  clearOutput,
  runReleaseGate,
  verifyReleaseArtifact,
  writeReleaseManifest,
} from '../scripts/lib/release-gate';

const created: string[] = [];

function tempRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'beitie-release-'));
  created.push(root);
  return root;
}

afterEach(() => {
  while (created.length > 0) {
    const root = created.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

const date = {
  kind: 'single',
  startYear: 700,
  startMonth: null,
  endYear: 700,
  endMonth: null,
  eraLabel: null,
  original: '700年',
  certainty: 'documented',
  note: null,
};

/** A controlled corpus with no relationship to the editorial records. */
function fixture() {
  return {
    work: {
      id: 'work-fixture',
      titles: { zh: '测试碑', en: 'Fixture stele' },
      aliases: [],
      attribution: [
        {
          role: 'calligrapher',
          name: 'Fixture',
          nameEn: null,
          certainty: 'documented',
          sourceRefs: ['src-fixture'],
        },
      ],
      compositionDate: date,
      studyCategory: 'bei',
      dynastyId: 'tang',
      dynastyQualifier: null,
      script: null,
      background: 'Synthetic record used only to test the release gate.',
      sourceRefs: ['src-fixture'],
      review: { state: 'reviewed', note: 'Reviewed for the fixture only.' },
      notes: [],
    },
    object: {
      id: 'object-fixture',
      workId: 'work-fixture',
      objectType: 'original-stele',
      titles: { zh: '测试碑（原石）', en: 'Fixture stele, original stone' },
      productionDate: date,
      catalogNumber: null,
      dimensions: null,
      survivalStatus: 'surviving',
      relationships: [],
      currentCollection: {
        locationKind: 'in-situ',
        placeId: 'place-fixture',
        sourceRefs: ['src-fixture'],
        sourceAccessedAt: '2026-11-17',
        assertionAsOf: null,
        note: null,
      },
      provenanceEvents: [],
      review: { state: 'reviewed', note: 'Reviewed for the fixture only.' },
      notes: [],
    },
    place: {
      id: 'place-fixture',
      names: { zh: '测试地点', en: 'Fixture site' },
      historicalName: null,
      kind: 'historical-site',
      coordinates: null,
      sourceRefs: ['src-fixture'],
      notes: [],
    },
    source: {
      id: 'src-fixture',
      title: 'Fixture source',
      publisher: 'Fixture publisher',
      url: 'https://example.invalid/fixture',
      publicationDate: null,
      accessedAt: '2026-11-17',
      locator: null,
      note: 'Synthetic fixture; not a real source.',
    },
  };
}

function writeFixture(root: string, data = fixture()): void {
  mkdirSync(join(root, 'data/works'), { recursive: true });
  mkdirSync(join(root, 'data/objects'), { recursive: true });
  writeFileSync(join(root, 'data/works/work-fixture.json'), JSON.stringify(data.work));
  writeFileSync(join(root, 'data/objects/object-fixture.json'), JSON.stringify(data.object));
  writeFileSync(join(root, 'data/places.json'), JSON.stringify({ items: [data.place] }));
  writeFileSync(join(root, 'data/sources.json'), JSON.stringify({ items: [data.source] }));
  writeFileSync(join(root, 'data/media.json'), JSON.stringify({ items: [] }));
}

describe('strict release gate', () => {
  it('accepts a fully reviewed controlled fixture', () => {
    const root = tempRoot();
    writeFixture(root);

    const report = runReleaseGate(root);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.counts).toMatchObject({ works: 1, objects: 1, places: 1, sources: 1 });
  });

  it('rejects the same fixture when a record is a draft', () => {
    const root = tempRoot();
    const data = fixture();
    data.object.review = { state: 'draft', note: 'Not reviewed yet.' };
    writeFixture(root, data);

    const report = runReleaseGate(root);

    expect(report.ok).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toContain('DRAFT_IN_RELEASE');
  });

  it('rejects invalid references even when every record is reviewed', () => {
    const root = tempRoot();
    const data = fixture();
    data.object.workId = 'work-missing';
    writeFixture(root, data);

    const report = runReleaseGate(root);

    expect(report.ok).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toContain('MISSING_WORK');
  });

  it('binds the real corpus to the gate: exactly the draft records are reported', () => {
    const root = process.cwd();
    const dataset = loadDatasetFromDisk(root);
    const records = [...dataset.works, ...dataset.objects] as Array<{
      id?: string;
      review?: { state?: string };
    }>;
    const drafts = records
      .filter((record) => record.review?.state === 'draft')
      .map((record) => record.id)
      .sort();

    const report = runReleaseGate(root);
    const flagged = report.errors
      .filter((issue) => issue.code === 'DRAFT_IN_RELEASE')
      .map((issue) => /"([^"]+)"/.exec(issue.message)?.[1])
      .filter((id): id is string => Boolean(id))
      .sort();

    expect(flagged).toEqual(drafts);
    expect(report.ok).toBe(drafts.length === 0);
  });
});

describe('artifact verification', () => {
  function writeArtifact(root: string, html: string): void {
    mkdirSync(join(root, 'dist/assets'), { recursive: true });
    writeFileSync(join(root, 'dist/index.html'), html);
    writeFileSync(join(root, 'dist/assets/index.js'), 'console.log("fixture");');
  }

  const releaseHtml =
    '<!doctype html><html><head><meta name="beitie-build-mode" content="release" /></head><body></body></html>';

  it('accepts only a release-marked artifact with a matching manifest', () => {
    const root = tempRoot();
    writeFixture(root);
    const report = runReleaseGate(root);
    writeArtifact(root, releaseHtml);
    writeReleaseManifest(root, report, 'fixture-revision');

    const check = verifyReleaseArtifact(root, report.counts);
    expect(check.problems).toEqual([]);
    expect(check.ok).toBe(true);
  });

  it('rejects a preview-marked artifact even if a manifest is present', () => {
    const root = tempRoot();
    writeFixture(root);
    const report = runReleaseGate(root);
    writeArtifact(root, releaseHtml.replace('content="release"', 'content="preview"'));
    writeReleaseManifest(root, report, null);

    const check = verifyReleaseArtifact(root, report.counts);

    expect(check.ok).toBe(false);
    expect(check.problems.join(' ')).toContain('release build marker');
    expect(check.problems.join(' ')).toContain('preview build');
  });

  it('rejects a manifest whose counts do not match the validated corpus', () => {
    const root = tempRoot();
    writeFixture(root);
    const report = runReleaseGate(root);
    writeArtifact(root, releaseHtml);
    writeReleaseManifest(root, report, null);

    const check = verifyReleaseArtifact(root, { ...report.counts, objects: 99 });

    expect(check.ok).toBe(false);
    expect(check.problems.join(' ')).toContain('counts do not match');
  });

  it('removes a previous output so a failed release cannot reuse it', () => {
    const root = tempRoot();
    writeArtifact(root, releaseHtml);
    expect(existsSync(join(root, 'dist/index.html'))).toBe(true);

    expect(clearOutput(root)).toBe(true);
    expect(existsSync(join(root, 'dist'))).toBe(false);
    expect(clearOutput(root)).toBe(false);
  });
});
