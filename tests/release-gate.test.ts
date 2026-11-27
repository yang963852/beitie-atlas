import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { compileKnowledge } from '../scripts/lib/knowledge-compiler';
import {
  checkCorpus,
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
  start: 700,
  month: null,
  end: 700,
  endMonth: null,
  era: null,
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
          person: null,
          certainty: 'documented',
          sources: ['src-fixture'],
        },
      ],
      compositionDate: date,
      studyCategory: 'bei',
      dynastyId: 'tang',
      dynastyQualifier: null,
      script: null,
      background: 'Synthetic record used only to test the release gate.',
      backgroundZh: '仅用于测试发布门槛的虚构记录。',
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
      notesZh: [],
    },
    source: {
      id: 'src-fixture',
      kind: 'web',
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

type Fixture = ReturnType<typeof fixture>;

function doc(fields: Record<string, unknown>, body: string): string {
  return '---\n' + stringify(fields, { lineWidth: 0 }) + '---\n\n' + body.trim() + '\n';
}

function writeAt(root: string, path: string, contents: string): void {
  mkdirSync(join(root, path, '..'), { recursive: true });
  writeFileSync(join(root, path), contents, 'utf8');
}

function writeRelations(root: string, relations: unknown[]): void {
  writeAt(root, 'knowledge/relations.md', doc({ schemaVersion: 2, relations }, '# 人物关系\n\n测试关系。'));
}

function writeWork(root: string, data: Fixture, guide = true): void {
  const work = data.work;
  const fields = {
    schemaVersion: 2,
    titleZh: work.titles.zh,
    titleEn: work.titles.en,
    aliases: work.aliases,
    studyCategory: work.studyCategory,
    dynastyId: work.dynastyId,
    dynastyQualifier: work.dynastyQualifier,
    dateKind: work.compositionDate.kind,
    dateStart: work.compositionDate.start,
    dateEnd: work.compositionDate.end,
    dateOriginal: work.compositionDate.original,
    dateCertainty: work.compositionDate.certainty,
    dateNote: work.compositionDate.note,
    script: work.script,
    attribution: work.attribution,
    sources: work.sourceRefs,
    reviewState: work.review.state,
    reviewNote: work.review.note,
    ...(guide ? {
      guideState: work.review.state, guidePeople: [], guideObjects: [data.object.id], guideSources: ['src-fixture'],
    } : {}),
  };
  const body = [
    '# ' + work.titles.zh,
    '', '## 背景', '', '### 中文', '', work.backgroundZh, '', '### English', '', work.background,
    ...(guide ? ['', '## 导读', '', '### 中文', '', '测试导读。', '', '### English', '', 'Fixture guide.'] : []),
  ].join('\n');
  writeAt(root, 'knowledge/works/' + work.id + '.md', doc(fields, body));
}

function writeObject(root: string, data: Fixture): void {
  const object = data.object;
  const fields = {
    schemaVersion: 2,
    work: object.workId,
    objectType: object.objectType,
    titleZh: object.titles.zh,
    titleEn: object.titles.en,
    dateKind: object.productionDate.kind,
    dateStart: object.productionDate.start,
    dateEnd: object.productionDate.end,
    dateOriginal: object.productionDate.original,
    dateCertainty: object.productionDate.certainty,
    dateNote: object.productionDate.note,
    catalogNumber: object.catalogNumber,
    survival: object.survivalStatus,
    relationships: [],
    collectionKind: object.currentCollection.locationKind,
    collectionPlace: object.currentCollection.placeId,
    collectionSources: object.currentCollection.sourceRefs,
    collectionAccessedAt: object.currentCollection.sourceAccessedAt,
    collectionAsOf: object.currentCollection.assertionAsOf,
    collectionNote: object.currentCollection.note,
    events: [],
    reviewState: object.review.state,
    reviewNote: object.review.note,
  };
  writeAt(root, 'knowledge/objects/' + object.id + '.md', doc(fields, '# ' + object.titles.zh));
}

function writeArticle(root: string, kind: 'people' | 'notes', id: string, state: string, refs = '') {
  const fields = {
    schemaVersion: 2,
    titleZh: '测试' + id,
    titleEn: 'Fixture ' + id,
    state,
    works: [] as string[],
    objects: [] as string[],
    sources: ['src-fixture'],
  };
  writeAt(root, 'knowledge/' + kind + '/' + id + '.md',
    doc(fields, '# 测试\n\n## 中文\n\n测试正文。\n\n## English\n\nFixture text.\n\n' + refs));
}

function writeFixture(root: string, data = fixture()): void {
  for (const kind of ['people', 'works', 'notes', 'objects', 'places', 'sources']) {
    mkdirSync(join(root, 'knowledge', kind), { recursive: true });
  }
  mkdirSync(join(root, 'data'), { recursive: true });
  writeWork(root, data);
  writeObject(root, data);
  writeAt(root, 'knowledge/places/' + data.place.id + '.md', doc({
    schemaVersion: 2,
    nameZh: data.place.names.zh,
    nameEn: data.place.names.en,
    historicalName: null,
    kind: data.place.kind,
    sources: data.place.sourceRefs,
    notes: [],
    notesZh: [],
  }, '# ' + data.place.names.zh));
  writeAt(root, 'knowledge/sources/' + data.source.id + '.md', doc({
    schemaVersion: 2,
    kind: 'web',
    title: data.source.title,
    publisher: data.source.publisher,
    url: data.source.url,
    publicationDate: null,
    accessedAt: data.source.accessedAt,
    locator: null,
    note: data.source.note,
  }, '# ' + data.source.title));
  writeRelations(root, []);
}

describe('strict release gate', () => {
  it('accepts a fully reviewed controlled fixture', () => {
    const root = tempRoot();
    writeFixture(root);

    const report = runReleaseGate(root);

    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.counts).toMatchObject({ works: 1, objects: 1, places: 1, sources: 1, workArticles: 1 });
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

  it('includes reviewed and draft Markdown and person relations in the release gate and manifest', () => {
    const root = tempRoot();
    writeFixture(root);
    writeArticle(root, 'people', 'one', 'reviewed');
    writeArticle(root, 'people', 'two', 'reviewed');
    writeArticle(root, 'notes', 'study', 'draft');
    const relation = { from: 'one', to: 'two', type: 'poetic-exchange', labelZh: '唱和', labelEn: 'Exchanged poems', sourceRefs: ['src-fixture'], state: 'draft' };
    writeRelations(root, [relation]);
    const report = runReleaseGate(root);
    expect(report.errors.map(e => e.code)).toEqual(['DRAFT_KNOWLEDGE_IN_RELEASE', 'DRAFT_KNOWLEDGE_IN_RELEASE']);
    expect(report.counts).toMatchObject({ workArticles: 1, peopleArticles: 2, noteArticles: 1, peopleRelations: 1 });

    writeArticle(root, 'notes', 'study', 'reviewed');
    writeRelations(root, [{ ...relation, state: 'reviewed' }]);
    expect(runReleaseGate(root).errors).toEqual([]);
    writeRelations(root, [relation, { ...relation, to: 'one', from: 'two' }]);
    writeArticle(root, 'notes', 'study', 'reviewed');
    writeArticle(root, 'people', 'work-fixture', 'reviewed');
    writeArticle(root, 'notes', 'study', 'reviewed');
    const invalid = runReleaseGate(root).errors.map(e => e.message).join('\n');
    for (const problem of ['Duplicate relationship', 'Duplicate knowledge ID']) {
      expect(invalid).toContain(problem);
    }
  });

  it('resolves same-directory Markdown links against the referring article in normal and strict validation', () => {
    const root = tempRoot();
    writeFixture(root);
    const prefix = 'schemaVersion: 2\ntitleZh: 书家\nstate: reviewed\nworks: []\nobjects: []\nsources: [src-fixture]\n';
    writeAt(root, 'knowledge/people/one.md', doc({
      schemaVersion: 2, titleZh: '书家一', titleEn: 'One', state: 'reviewed',
      works: [], objects: [], sources: ['src-fixture'],
    }, '# 书家一\n\n## 中文\n\n[已有](two.md) [缺失](missing.md) [已有](./two.md) [缺失](./missing-too.md) [已有](../people/two.md) [缺失](../notes/missing-note.md)'));
    writeAt(root, 'knowledge/people/two.md', doc({
      schemaVersion: 2, titleZh: '书家二', titleEn: 'Two', state: 'reviewed',
      works: [], objects: [], sources: ['src-fixture'],
    }, '# 书家二\n\n## 中文\n\n书家资料。'));
    for (const release of [false, true]) {
      const report = checkCorpus(root, release);
      const broken = report.errors.map(e => e.message);
      expect(broken).toEqual([
        'Broken knowledge page link: missing.md',
        'Broken knowledge page link: ./missing-too.md',
        'Broken knowledge page link: ../notes/missing-note.md',
      ]);
    }
    void prefix;
  });

  it('binds the real corpus to the gate: exactly the draft records are reported', () => {
    const root = process.cwd();
    const compiled = compileKnowledge(root).knowledge;
    const records = [...compiled.works, ...compiled.objects] as Array<{
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
    expect(report.ok).toBe(drafts.length === 0 && !report.errors.some(issue => issue.code === 'DRAFT_KNOWLEDGE_IN_RELEASE'));
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
    expect(verifyReleaseArtifact(root, { ...report.counts, peopleArticles: 1 }).problems.join(' ')).toContain('peopleArticles');
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
