import { describe, expect, it } from 'vitest';
import { getDataset, getValidationReport } from '../src/domain/data';
import { validateDataset } from '../src/domain/validate';

type Mutable = {
  works: any[];
  objects: any[];
  places: any[];
  sources: any[];
  media: any[];
};

function baseDataset(): Mutable {
  return {
    works: [
      {
        id: 'work-1',
        titles: { zh: '作品', en: 'Work' },
        aliases: [],
        attribution: [
          {
            role: 'calligrapher',
            name: '颜真卿',
            nameEn: 'Yan Zhenqing',
            certainty: 'documented',
            sourceRefs: ['src-1'],
          },
        ],
        dynastyId: 'tang',
        dynastyQualifier: null,
        compositionDate: {
          kind: 'single',
          startYear: 779,
          startMonth: null,
          endYear: 779,
          endMonth: null,
          eraLabel: null,
          original: '唐大历十四年（779年）',
          certainty: 'documented',
          note: null,
        },
        script: null,
        background: 'Synthetic test prose.',
        sourceRefs: ['src-1'],
        review: { state: 'draft', note: 'Synthetic fixture.' },
        notes: [],
      },
    ],
    objects: [
      {
        id: 'object-1',
        workId: 'work-1',
        objectType: 'rubbing',
        titles: { zh: '拓本', en: 'Rubbing' },
        productionDate: {
          kind: 'unknown',
          startYear: null,
          startMonth: null,
          endYear: null,
          endMonth: null,
          eraLabel: null,
          original: null,
          certainty: 'unknown',
          note: null,
        },
        catalogNumber: null,
        dimensions: null,
        survivalStatus: 'surviving',
        relationships: [],
        currentCollection: {
          locationKind: 'collection-institution',
          placeId: 'place-1',
          sourceRefs: ['src-1'],
          sourceAccessedAt: '2026-11-17',
          assertionAsOf: null,
          note: null,
        },
        provenanceEvents: [],
        review: { state: 'draft', note: 'Synthetic fixture.' },
        notes: [],
      },
    ],
    places: [
      {
        id: 'place-1',
        names: { zh: '机构', en: 'Institution' },
        historicalName: null,
        kind: 'institution',
        coordinates: null,
        sourceRefs: ['src-1'],
        notes: [],
      },
    ],
    sources: [
      {
        id: 'src-1',
        title: 'Synthetic source',
        publisher: 'Test',
        url: 'https://example.org/record',
        publicationDate: null,
        accessedAt: '2026-11-17',
        locator: null,
        note: null,
      },
    ],
    media: [],
  };
}

function codes(dataset: unknown, releaseMode = false): string[] {
  return validateDataset(dataset, { releaseMode }).errors.map((issue) => issue.code);
}

describe('data validation', () => {
  it('accepts the shipped corpus', () => {
    const report = validateDataset(getDataset());
    expect(report.errors).toEqual([]);
    expect(report.counts.objects).toBeGreaterThanOrEqual(2);
  });

  it('accepts a minimal valid fixture', () => {
    expect(codes(baseDataset())).toEqual([]);
  });

  it('resolves a relationship to an object listed later', () => {
    const dataset = baseDataset();
    const target = { ...dataset.objects[0], id: 'object-target', relationships: [] };
    const first = {
      ...dataset.objects[0],
      id: 'object-first',
      relationships: [
        { type: 'recarving-of', targetObjectId: 'object-target', sourceRefs: ['src-1'], note: null },
      ],
    };
    // The referring object is read before its target, as happens with file globs.
    dataset.objects = [first, target, dataset.objects[0]];

    expect(codes(dataset)).toEqual([]);
  });

  it('rejects duplicate ids', () => {
    const dataset = baseDataset();
    dataset.objects.push({ ...dataset.objects[0] });
    expect(codes(dataset)).toContain('DUPLICATE_ID');
  });

  it('rejects a work with no period or an invented period', () => {
    const missing = baseDataset();
    delete missing.works[0].dynastyId;
    expect(codes(missing)).toContain('DYNASTY');

    const invented = baseDataset();
    invented.works[0].dynastyId = 'ming-dynasty';
    expect(codes(invented)).toContain('DYNASTY');
  });

  it('rejects an empty attribution list instead of reading it as "unknown"', () => {
    const dataset = baseDataset();
    dataset.works[0].attribution = [];
    expect(codes(dataset)).toContain('ATTRIBUTION_GAP');
  });

  it('rejects an attribution role that the interface cannot label', () => {
    const dataset = baseDataset();
    dataset.works[0].attribution[0].role = 'scribe';
    expect(codes(dataset)).toContain('ATTRIBUTION_ROLE');
  });

  it('rejects a reference to a missing source', () => {
    const dataset = baseDataset();
    dataset.objects[0].currentCollection.sourceRefs = ['src-missing'];
    expect(codes(dataset)).toContain('MISSING_SOURCE');
  });

  it('rejects a collection assertion with no evidence', () => {
    const dataset = baseDataset();
    dataset.objects[0].currentCollection.sourceRefs = [];
    expect(codes(dataset)).toContain('MISSING_EVIDENCE');
  });

  it('rejects a provenance event stored on the wrong object', () => {
    const dataset = baseDataset();
    dataset.objects[0].provenanceEvents.push({
      id: 'ev-1',
      objectId: 'object-other',
      type: 'relocation',
      date: {
        kind: 'single',
        startYear: 1922,
        startMonth: null,
        endYear: 1922,
        endMonth: null,
        eraLabel: null,
        original: '1922年',
        certainty: 'documented',
        note: null,
      },
      placeId: null,
      placeWording: null,
      summary: 'Synthetic move.',
      sourceRefs: ['src-1'],
      certainty: 'documented',
    });
    expect(codes(dataset)).toContain('EVENT_OBJECT_MISMATCH');
  });

  it('rejects latitude/longitude inversion', () => {
    const dataset = baseDataset();
    dataset.places[0].coordinates = {
      longitude: 34.255,
      latitude: 108.9483,
      crs: 'WGS84',
      precision: 'institution',
      sourceRefs: ['src-1'],
      method: 'secondary-database',
      verification: 'unverified',
      note: null,
    };
    expect(codes(dataset)).toContain('COORDINATE_SWAPPED');
  });

  it('refuses to relabel a non-WGS84 frame', () => {
    const dataset = baseDataset();
    dataset.places[0].coordinates = {
      longitude: 116.39,
      latitude: 39.91,
      crs: 'GCJ-02',
      precision: 'institution',
      sourceRefs: ['src-1'],
      method: 'geocoder',
      verification: 'unverified',
      note: null,
    };
    expect(codes(dataset)).toContain('COORDINATE_CRS');
  });

  it('rejects the non-existent year zero', () => {
    const dataset = baseDataset();
    dataset.works[0].compositionDate = {
      ...dataset.works[0].compositionDate,
      startYear: 0,
      endYear: 0,
    };
    expect(codes(dataset)).toContain('YEAR_ZERO');
  });

  it('rejects an unknown date that carries a year', () => {
    const dataset = baseDataset();
    dataset.objects[0].productionDate = {
      ...dataset.objects[0].productionDate,
      startYear: 1930,
      endYear: 1930,
    };
    expect(codes(dataset)).toContain('INVALID_DATE');
  });

  it('blocks draft records in a release build', () => {
    const dataset = baseDataset();
    expect(codes(dataset, true)).toContain('DRAFT_IN_RELEASE');
  });

  it('flags a bundled image without rights evidence', () => {
    const dataset = baseDataset();
    dataset.media.push({
      id: 'media-1',
      objectId: 'object-1',
      assetPathOrUrl: '/media/example.jpg',
      creator: 'Unknown',
      sourceRefs: ['src-1'],
      license: '',
      credit: '',
      rightsEvidence: '',
      acquiredAt: '2026-11-17',
    });
    expect(codes(dataset)).toContain('MEDIA_WITHOUT_RIGHTS');
  });

  it('rejects a translation array that does not line up with its notes', () => {
    const dataset = baseDataset();
    dataset.works[0].notes = ['First note.', 'Second note.', 'Third note.'];
    dataset.works[0].notesZh = ['第一条。', '第二条。'];

    const report = validateDataset(dataset);
    expect(report.errors.map((issue) => issue.code)).toContain('NOTES_LOCALE_LENGTH');
  });

  it('accepts aligned translations and reports no translation backlog', () => {
    const dataset = baseDataset();
    dataset.works[0].notes = ['First note.'];
    dataset.works[0].notesZh = ['第一条。'];

    const report = validateDataset(dataset);
    expect(report.errors).toEqual([]);
    expect(report.warnings.map((issue) => issue.code)).not.toContain('NOTES_NOT_TRANSLATED');
  });

  it('reports the untranslated note backlog once, not once per record', () => {
    const dataset = baseDataset();
    dataset.works[0].notes = ['First note.'];
    dataset.objects[0].notes = ['Object note.'];

    const backlog = validateDataset(dataset).warnings.filter(
      (issue) => issue.code === 'NOTES_NOT_TRANSLATED',
    );
    expect(backlog).toHaveLength(1);
    expect(backlog[0].message).toContain('2 record(s)');
  });

  it('walks the bundled corpus once and reuses that report', () => {
    expect(getValidationReport()).toBe(getValidationReport());
  });

  it('accepts a printed catalogue cited by page instead of by URL', () => {
    const dataset = baseDataset();
    dataset.sources[0] = {
      ...dataset.sources[0],
      kind: 'book',
      url: null,
      publicationDate: '1989',
      locator: 'vol. 3, p. 118',
    };

    const report = validateDataset(dataset);
    expect(report.errors).toEqual([]);
  });

  it('rejects a printed source with no page locator', () => {
    const dataset = baseDataset();
    dataset.sources[0] = { ...dataset.sources[0], url: null, publicationDate: '1989', locator: null };

    expect(codes(dataset)).toContain('MISSING_FIELD');
  });

  it('rejects a source that claims to be both printed and a web page', () => {
    const dataset = baseDataset();
    dataset.sources[0] = { ...dataset.sources[0], kind: 'book' };

    expect(codes(dataset)).toContain('SOURCE_KIND');
  });
});
