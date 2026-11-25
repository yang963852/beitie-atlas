import { describe, expect, it } from 'vitest';
import { compileKnowledge } from '../scripts/lib/knowledge-compiler';
import {
  buildKnowledgeStatus,
  renderStatusMarkdown,
  statusMarker,
} from '../scripts/lib/knowledge-status';

const compiled = compileKnowledge(process.cwd());
const warnings = compiled.validation.warnings;
const report = buildKnowledgeStatus(compiled.knowledge, warnings);

describe('knowledge status report', () => {
  it('covers every work and accounts for every object', () => {
    expect(report.works).toHaveLength(compiled.knowledge.counts.works);
    expect(report.works.reduce((sum, work) => sum + work.objects, 0)).toBe(
      compiled.knowledge.counts.objects,
    );
  });

  it('attributes every date warning to a work', () => {
    const dateWarnings = warnings.filter(
      (warning) => warning.code === 'DATE_WITHOUT_ORIGINAL',
    ).length;
    expect(report.dateGaps).toBe(dateWarnings);
    expect(report.works.reduce((sum, work) => sum + work.dateGaps, 0)).toBe(dateWarnings);
  });

  it('takes uncited sources from validator warnings', () => {
    const uncited = warnings.filter((warning) => warning.code === 'UNUSED_SOURCE').length;
    expect(report.uncitedSources).toHaveLength(uncited);
    expect([...report.uncitedSources].sort()).toEqual(report.uncitedSources);
  });

  it('counts guides and attribution links against the compiled corpus', () => {
    expect(report.works.filter((work) => work.guide !== null)).toHaveLength(
      compiled.knowledge.counts.workArticles,
    );
    const linked = compiled.knowledge.works.reduce(
      (sum, work) => sum + work.attribution.filter((entry) => entry.personId).length,
      0,
    );
    expect(report.attribution.linked).toBe(linked);
  });

  it('renders a deterministic generated page', () => {
    const first = renderStatusMarkdown(report);
    const second = renderStatusMarkdown(buildKnowledgeStatus(compiled.knowledge, warnings));
    expect(first).toBe(second);
    expect(first.startsWith(statusMarker)).toBe(true);
    expect(first).toContain(
      '| Work | Period | Review | Guide | People | Sources | Objects | Places | Date gaps |',
    );
  });
});
