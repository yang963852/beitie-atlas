/**
 * Read one knowledge record, or search the corpus, straight from the Markdown
 * author source. Every returned record carries the sources that support it.
 *
 *   npm run knowledge:query -- lanting
 *   npm run knowledge:query -- works/lanting
 *   npm run knowledge:query -- 王羲之 --kind people --json
 */
import { compileKnowledge } from './lib/knowledge-compiler';
import {
  QUERY_KINDS,
  describeKnowledge,
  isQueryKind,
  searchKnowledge,
  type QueryDetail,
  type QueryKind,
} from './lib/knowledge-query';

const USAGE = [
  'Usage: npm run knowledge:query -- <term> [--kind ' + QUERY_KINDS.join('|') + '] [--json]',
  '',
  '  <term>            an ID, a title or an alias; searched across every record type',
  '  <kind>/<id>       print one full record, for example works/lanting',
  '  --kind <kind>     restrict a search to one record type',
  '  --json            print the result as JSON',
].join('\n');

function parse(argv: string[]): { term: string; kind?: QueryKind; json: boolean; invalid?: string } {
  const rest: string[] = [];
  let kind: string | undefined;
  let json = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') json = true;
    else if (arg === '--kind') kind = argv[++i];
    else if (arg.startsWith('--kind=')) kind = arg.slice('--kind='.length);
    else rest.push(arg);
  }
  if (kind !== undefined && !isQueryKind(kind)) {
    return { term: rest.join(' '), json, invalid: kind };
  }
  return { term: rest.join(' ').trim(), kind: kind as QueryKind | undefined, json };
}

function line(hit: QueryDetail['hit']): string {
  const en = hit.titleEn ? '  ' + hit.titleEn : '';
  return hit.kind + '/' + hit.id + '  ' + hit.titleZh + en;
}

function render(detail: QueryDetail): string {
  const parts: string[] = [line(detail.hit), '', 'record:', JSON.stringify(detail.record, null, 2)];
  if (detail.guide) parts.push('', 'guide:', JSON.stringify(detail.guide, null, 2));
  if (detail.relations && detail.relations.length > 0) {
    parts.push('', 'relations:', JSON.stringify(detail.relations, null, 2));
  }
  if (detail.sources.length > 0) {
    parts.push('', 'sources:', JSON.stringify(detail.sources, null, 2));
  }
  if (detail.missingSources.length > 0) {
    parts.push('', 'missing sources: ' + detail.missingSources.join(', '));
  }
  return parts.join('\n');
}

const args = parse(process.argv.slice(2));
if (args.invalid !== undefined) {
  console.error('Unknown record type "' + args.invalid + '". Known types: ' + QUERY_KINDS.join(', ') + '.');
  process.exit(1);
}
if (!args.term) {
  console.log(USAGE);
  process.exit(args.term === '' ? 0 : 1);
}

const result = compileKnowledge(process.cwd(), { releaseMode: false });
if (result.issues.length) {
  console.error('The knowledge corpus has errors, so it cannot be queried:');
  for (const issue of result.issues) console.error('  [' + issue.code + '] ' + issue.path + ': ' + issue.message);
  process.exit(1);
}

const target = /^([a-z]+)\/([a-z0-9-]+)$/.exec(args.term);
const detail = target && isQueryKind(target[1])
  ? describeKnowledge(result.knowledge, target[1], target[2])
  : undefined;

if (detail) {
  console.log(args.json ? JSON.stringify(detail, null, 2) : render(detail));
  process.exit(0);
}
if (target && isQueryKind(target[1])) {
  console.error('No ' + target[1] + ' record with ID "' + target[2] + '".');
  process.exit(1);
}

const hits = searchKnowledge(result.knowledge, args.term, args.kind);
if (hits.length === 1) {
  const single = describeKnowledge(result.knowledge, hits[0].kind, hits[0].id)!;
  console.log(args.json ? JSON.stringify(single, null, 2) : render(single));
  process.exit(0);
}
if (hits.length === 0) {
  console.error('No record matches "' + args.term + '".');
  process.exit(1);
}
if (args.json) {
  console.log(JSON.stringify(hits, null, 2));
  process.exit(0);
}
console.log(hits.length + ' records match "' + args.term + '":');
for (const hit of hits) console.log('  ' + line(hit));
console.log('\nPrint one with: npm run knowledge:query -- ' + hits[0].kind + '/' + hits[0].id);
