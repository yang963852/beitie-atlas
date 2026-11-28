#!/usr/bin/env node
/**
 * Documentation drift check: `npm run check:docs`.
 *
 * Current product editions belong in package.json, not in hand-written docs.
 * README's knowledge-counts block is a checked snapshot of the compiled
 * interface. This script never rewrites either source.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const interfacePath = join(root, 'data', 'index', 'knowledge-v1.json');
const countBegin = '<!-- knowledge-counts:begin -->';
const countEnd = '<!-- knowledge-counts:end -->';

const DOCUMENTS = [
  'README.md',
  'README.en.md',
  'docs/START-HERE.md',
  'docs/release.md',
  'docs/CONTRIBUTE.zh-CN.md',
  'docs/map-setup.md',
];

const COUNT_FIELDS = [
  { label: '作品', key: 'works', actual: (knowledge) => knowledge.works.length },
  { label: '实物', key: 'objects', actual: (knowledge) => knowledge.objects.length },
  {
    label: '人物',
    key: 'peopleArticles',
    actual: (knowledge) => knowledge.articles.filter((article) => article.kind === 'people').length,
  },
  { label: '地点', key: 'places', actual: (knowledge) => knowledge.places.length },
  { label: '来源', key: 'sources', actual: (knowledge) => knowledge.sources.length },
  {
    label: '事件',
    key: 'events',
    actual: (knowledge) => knowledge.objects.reduce(
      (total, object) => total + object.provenanceEvents.length,
      0,
    ),
  },
  {
    label: '笔记',
    key: 'noteArticles',
    actual: (knowledge) => knowledge.articles.filter((article) => article.kind === 'notes').length,
  },
];

const problems = [];
let showCountReplacement = false;
let expectedCounts = null;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  } catch (error) {
    problems.push(`${path.slice(root.length + 1)} cannot be read: ${error.message}`);
    return '';
  }
}

function renderCountsBlock(counts) {
  return [
    countBegin,
    '| 类别 | 数量 |',
    '| --- | ---: |',
    ...COUNT_FIELDS.map((field) => `| ${field.label} | ${counts[field.key]} |`),
    countEnd,
  ].join('\n');
}

function loadKnowledge() {
  if (!existsSync(interfacePath)) {
    problems.push('data/index/knowledge-v1.json is missing. Run npm run knowledge:build.');
    return null;
  }

  let knowledge;
  try {
    knowledge = JSON.parse(readFileSync(interfacePath, 'utf8'));
  } catch (error) {
    problems.push(`data/index/knowledge-v1.json is not valid JSON: ${error.message}`);
    return null;
  }

  for (const key of ['works', 'objects', 'places', 'sources', 'articles']) {
    if (!Array.isArray(knowledge[key])) {
      problems.push(`data/index/knowledge-v1.json field "${key}" must be an array.`);
      return null;
    }
  }
  if (!knowledge.counts || typeof knowledge.counts !== 'object') {
    problems.push('data/index/knowledge-v1.json field "counts" must be an object.');
    return null;
  }
  if (knowledge.objects.some((object) => !Array.isArray(object.provenanceEvents))) {
    problems.push('Every compiled object must have a provenanceEvents array.');
    return null;
  }
  if (knowledge.articles.some((article) => typeof article.kind !== 'string')) {
    problems.push('Every compiled article must have a kind.');
    return null;
  }

  expectedCounts = Object.fromEntries(
    COUNT_FIELDS.map((field) => [field.key, field.actual(knowledge)]),
  );
  for (const field of COUNT_FIELDS) {
    if (knowledge.counts[field.key] !== expectedCounts[field.key]) {
      problems.push(
        `data/index/knowledge-v1.json counts.${field.key} is ${knowledge.counts[field.key]}, `
        + `but the compiled records contain ${expectedCounts[field.key]}.`,
      );
    }
  }
  return knowledge;
}

function loadDependencyNames() {
  try {
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    return [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ];
  } catch {
    return [];
  }
}

const dependencyNames = loadDependencyNames();

/**
 * Only these documented technical or historical contexts may contain 1.x.
 * Each exception is scoped to the matched token, not the whole line, so a
 * product edition added to the same line still fails.
 */
const VERSION_ALLOWLIST = [
  {
    reason: 'Node engine constraints describe the runtime, not the product edition.',
    matches: (line, token) => new RegExp(
      `\\b(?:node(?:\\.js)?\\s+engines?|engines?\\.node)\\s*`
      + `(?:range\\s*)?[:=]?\\s*(?:>=|<=|>|<|=|\\^|~)?\\s*${escapeRegExp(token)}(?![\\w.])`,
      'i',
    ).test(line),
  },
  {
    reason: 'Pinned dependency versions are technical requirements, not product editions.',
    matches: (line, token) => dependencyNames.some((name) => new RegExp(
      `(?:^|[^\\w.-])${escapeRegExp(name)}`
      + `(?:\\s*@|[\\s\`"']*[:=][\\s\`"']*|[\\s\`"']+(?:is\\s+)?(?:pinned\\s+to\\s+)?)`
      + `${escapeRegExp(token)}(?![\\w.])`,
      'i',
    ).test(line)),
  },
  {
    reason: 'GitHub Action refs pin automation dependencies, not the product edition.',
    matches: (line, token) => new RegExp(
      `\\buses:\\s*[^\\s@]+@${escapeRegExp(token)}(?![\\w.])`,
    ).test(line),
  },
  {
    reason: 'Tianditu console table rows are numbered setup steps.',
    file: 'docs/map-setup.md',
    matches: (line, token) => new RegExp(`^\\|\\s*${escapeRegExp(token)}\\s*\\|`).test(line.trim()),
  },
  {
    reason: 'This sentence is dated evidence for an earlier release, not the current edition label.',
    file: 'docs/START-HERE.md',
    matches: (line, token) => new RegExp(
      `\\bearlier\\s+${escapeRegExp(token)}\\s+release\\b`,
      'i',
    ).test(line),
  },
  {
    reason: 'This sentence is dated evidence for an earlier release, not the current edition label.',
    file: 'docs/release.md',
    matches: (line, token) => new RegExp(
      `\\bThe\\s+${escapeRegExp(token)}\\s+edition\\s+passed\\s+the\\s+strict\\s+gate\\b`,
      'i',
    ).test(line),
  },
];

function checkVersions(file, contents) {
  const lines = contents.split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\bv?1\.\d+(?:\.\d+)?\b/gi)) {
      const token = match[0];
      const allowed = VERSION_ALLOWLIST.some(
        (entry) => (!entry.file || entry.file === file) && entry.matches(line, token),
      );
      if (!allowed) {
        problems.push(
          `${file}:${index + 1}: hand-written product version "${token}". `
          + 'Use the version in package.json instead.',
        );
      }
    }
  });
}

function checkCountBlock(readme) {
  const beginMarkers = [...readme.matchAll(/<!-- knowledge-counts:begin -->/g)];
  const endMarkers = [...readme.matchAll(/<!-- knowledge-counts:end -->/g)];
  if (beginMarkers.length !== 1 || endMarkers.length !== 1) {
    problems.push('README.md must contain exactly one knowledge-counts:begin and one knowledge-counts:end marker.');
    showCountReplacement = true;
    return;
  }

  const begin = beginMarkers[0];
  const end = endMarkers[0];
  if ((begin.index ?? 0) > (end.index ?? 0)) {
    problems.push('README.md knowledge-counts:begin must appear before knowledge-counts:end.');
    showCountReplacement = true;
    return;
  }
  if (!expectedCounts) return;

  const expectedBlock = renderCountsBlock(expectedCounts);
  const actualBlock = readme
    .slice(begin.index ?? 0, (end.index ?? 0) + countEnd.length)
    .trim();
  if (actualBlock !== expectedBlock) {
    problems.push('README.md knowledge-counts block is out of date.');
    showCountReplacement = true;
  }
}

const documents = new Map();
for (const file of DOCUMENTS) {
  const contents = readText(join(root, file));
  documents.set(file, contents);
  checkVersions(file, contents);
}

loadKnowledge();
checkCountBlock(documents.get('README.md') ?? '');

if (problems.length > 0) {
  console.error(`Documentation drift check FAILED (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  if (showCountReplacement && expectedCounts) {
    console.error('\nREADME.md 的计数块应替换为：');
    console.error(renderCountsBlock(expectedCounts));
  }
  process.exitCode = 1;
} else {
  const summary = COUNT_FIELDS.map((field) => `${field.label} ${expectedCounts[field.key]}`).join(', ');
  console.log(`Documentation drift check passed: ${DOCUMENTS.length} documents; ${summary}.`);
}
