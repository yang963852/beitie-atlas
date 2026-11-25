import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { compileKnowledge } from './lib/knowledge-compiler';
import {
  STATUS_PATH,
  buildKnowledgeStatus,
  renderStatusMarkdown,
  statusMarker,
} from './lib/knowledge-status';

const root = process.cwd();
const wantsJson = process.argv.includes('--json');
const check = process.argv.includes('--check');

const result = compileKnowledge(root, { releaseMode: false });
if (result.issues.length) {
  console.error('Knowledge status cannot be generated because the corpus has errors:');
  for (const issue of result.issues) {
    console.error('  [' + issue.code + '] ' + issue.path + ': ' + issue.message);
  }
  process.exit(1);
}

const report = buildKnowledgeStatus(result.knowledge, result.validation.warnings);
if (wantsJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const contents = renderStatusMarkdown(report);
const target = join(root, STATUS_PATH);
const existing = existsSync(target)
  ? readFileSync(target, 'utf8').replace(/\r\n/g, '\n')
  : null;

if (check) {
  if (existing === contents) {
    console.log(
      'Knowledge status is current: ' + report.works.length + ' works, '
      + report.dateGaps + ' date warnings, ' + report.uncitedSources.length + ' uncited sources.',
    );
  } else {
    console.error('The knowledge status report is out of date. Run npm run knowledge:status.');
    process.exitCode = 1;
  }
} else {
  if (existing !== null && !existing.startsWith(statusMarker)) {
    throw new Error('Refusing to replace a hand-authored file: ' + STATUS_PATH);
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, 'utf8');
  console.log('Knowledge status written: ' + STATUS_PATH + ' (' + report.works.length + ' works).');
}
