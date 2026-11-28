import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the initial bundle.
 *
 * `data/index/knowledge-v1.json` is about 1.25 MB. It reaches the browser
 * through `domain/data` (and `domain/knowledge`/`domain/library`), so a static
 * import of any of them from the entry router puts the whole corpus back in the
 * first paint. The opening desk must not pay for it.
 */
describe('entry bundle boundary', () => {
  const entry = readFileSync('src/App.tsx', 'utf8');

  it('does not statically import the corpus boundary from the entry router', () => {
    for (const specifier of ['./domain/data', './domain/knowledge', './domain/library']) {
      expect(entry).not.toMatch(new RegExp(`from\\s+['"]${specifier.replace('.', '\\.')}['"]`));
    }
  });

  it('loads every corpus route lazily', () => {
    expect(entry).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(/);
    expect(entry).toMatch(/import\(['"]\.\/AtlasApp['"]\)/);
    expect(entry).toMatch(/import\(['"]\.\/components\/AtlasTimeline['"]\)/);
    expect(entry).toMatch(/import\(['"]\.\/components\/KnowledgeLibrary['"]\)/);
  });
});
