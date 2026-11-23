import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * AGENTS.md: the declared language in `index.html` must equal the product's
 * default interface language. The runtime switch is covered in `app.test.tsx`;
 * this guards the file a reader without JavaScript and a crawler actually see,
 * which no other test reads.
 */
describe('declared document language', () => {
  it('states the interface default in index.html', () => {
    const html = readFileSync('index.html', 'utf8');
    const declared = /<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1];
    expect(declared).toBe('zh-Hans');
  });
});
