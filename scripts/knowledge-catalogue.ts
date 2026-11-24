import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Dataset } from '../src/domain/types';
import { cataloguePages, generatedMarker } from './lib/catalogue';
import { compileKnowledge } from './lib/knowledge-compiler';

const root = process.cwd();
const check = process.argv.includes('--check');
const result = compileKnowledge(root, { releaseMode: false });
if (result.issues.length) {
  throw new Error(result.issues.map((issue) => issue.path + ': ' + issue.message).join('\n'));
}
const pages = cataloguePages(result.knowledge as unknown as Dataset, result.knowledge.articles);
const folder = join(root, 'knowledge');
const catalogue = join(folder, 'catalogue');
const outdated: string[] = [];
for (const [path, contents] of pages) {
  const target = join(folder, path);
  const existing = existsSync(target) ? readFileSync(target, 'utf8').replace(/\r\n/g, '\n') : null;
  if (existing === contents) continue;
  if (existing !== null && !existing.startsWith(generatedMarker)) {
    throw new Error('Refusing to replace a hand-authored file: knowledge/' + path);
  }
  outdated.push(path);
  if (!check) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents, 'utf8');
  }
}
if (existsSync(catalogue)) {
  for (const name of readdirSync(catalogue).filter(name => name.endsWith('.md'))) {
    const path = 'catalogue/' + name;
    if (pages.has(path)) continue;
    const target = join(catalogue, name);
    if (!readFileSync(target, 'utf8').startsWith(generatedMarker)) {
      throw new Error('Move hand-authored Markdown out of the generated catalogue: knowledge/' + path);
    }
    outdated.push(path);
    if (!check) unlinkSync(target);
  }
}
if (check && outdated.length) {
  console.error('The GitHub knowledge catalogue is out of date. Run npm run knowledge:generate.\n' + outdated.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Knowledge catalogue: ' + pages.size + ' pages checked, ' + outdated.length + ' refreshed.');
}
