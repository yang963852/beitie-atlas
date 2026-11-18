#!/usr/bin/env node
/**
 * Iteration board check: `npm run check:docs`.
 *
 * The board is written by hand, and hand-written status drifts: a task gets
 * merged while its row still says "delivered", or a delivery report exists with
 * no row at all. This check does not try to judge the wording. It enforces the
 * four things that can be decided mechanically:
 *
 *   1. Every `tasks/NNN-*.md` and every `docs/delivery-NNN.md` has a row.
 *   2. Every row's state opens with one canonical keyword.
 *   3. Every local link in the evidence column resolves.
 *   4. Task numbers are unique and three digits.
 *
 * It intentionally does not deploy, publish, or rewrite the board.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const boardPath = join(root, 'docs', 'iteration-board.md');

/** A state must open with one of these, so a reader and a script agree. */
const STATUS_KEYWORDS = [
  'Queued',
  'In progress',
  'Changes required',
  'Delivered',
  'Accepted',
  'Superseded',
];

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const ROW = /^\|\s*(\d{3})\s*\|([\s\S]*)$/;

const problems = [];

function readRows() {
  if (!existsSync(boardPath)) {
    problems.push('docs/iteration-board.md is missing.');
    return [];
  }

  const rows = [];
  for (const line of readFileSync(boardPath, 'utf8').split(/\r?\n/)) {
    const match = ROW.exec(line.trim());
    if (!match) continue;
    // Split the remaining cells on unescaped pipes.
    const cells = match[2].split('|').map((cell) => cell.trim());
    if (cells.length < 3) {
      problems.push(`Row ${match[1]} does not have outcome, state and evidence cells.`);
      continue;
    }
    rows.push({
      task: match[1],
      outcome: cells[0],
      state: cells[1],
      evidence: cells.slice(2).join('|'),
    });
  }
  return rows;
}

function taskFiles() {
  const dir = join(root, 'tasks');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => /^(\d{3})-.*\.md$/.exec(name))
    .filter(Boolean)
    .map((match) => match[1]);
}

function deliveryFiles() {
  const dir = join(root, 'docs');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => /^delivery-(\d{3})\.md$/.exec(name))
    .filter(Boolean)
    .map((match) => match[1]);
}

const rows = readRows();
const seen = new Set();

for (const row of rows) {
  if (seen.has(row.task)) problems.push(`Task ${row.task} appears more than once.`);
  seen.add(row.task);

  const keyword = STATUS_KEYWORDS.find((candidate) => row.state.startsWith(candidate));
  if (!keyword) {
    problems.push(
      `Task ${row.task}: state "${row.state}" must open with one of: ${STATUS_KEYWORDS.join(', ')}.`,
    );
  }

  const links = [...row.evidence.matchAll(LINK)].map((match) => match[1]);
  const resolver = (target) => resolve(join(root, 'docs'), target.split('#')[0]);

  for (const link of links) {
    if (/^https?:\/\//i.test(link) || link.startsWith('#')) continue;
    if (!existsSync(resolver(link))) {
      problems.push(`Task ${row.task}: evidence link does not resolve: ${link}`);
    }
  }

  // Older rows cite a bare file name ("See review-001.md") instead of a link.
  // Either form is acceptable as long as the file is really there; a row with
  // no resolvable reference at all gives a reader nothing to check.
  const bareNames = [...row.evidence.matchAll(/([\w.-]+\.md)/g)].map((match) => match[1]);
  const resolves = [...links.filter((link) => !/^https?:\/\//i.test(link)), ...bareNames].some(
    (candidate) => existsSync(resolver(candidate)),
  );
  // A queued task has nothing to cite yet; every other state must point at a
  // file a reviewer can open.
  if (!resolves && !row.state.startsWith('Queued')) {
    problems.push(`Task ${row.task}: evidence column does not reference an existing file.`);
  }
}

for (const task of taskFiles()) {
  if (!seen.has(task)) problems.push(`tasks/${task}-*.md exists but the board has no row for ${task}.`);
}

for (const task of deliveryFiles()) {
  if (!seen.has(task)) problems.push(`docs/delivery-${task}.md exists but the board has no row for ${task}.`);
}

if (problems.length > 0) {
  console.error(`Iteration board check FAILED (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Iteration board check passed: ${rows.length} rows, every task file and delivery report is recorded.`,
);
