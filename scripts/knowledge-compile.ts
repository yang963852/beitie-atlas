/**
 * Compile the Markdown knowledge library into the versioned web interface.
 *
 *   npm run knowledge:compile          write data/index/knowledge-v1.json
 *   npm run check:interface            verify the local copy is current
 *   npm run check:release              strict draft gate
 */

import { formatReport } from '../src/domain/validate';
import {
  checkCompiledKnowledge,
  compileKnowledge,
  compiledText,
  writeCompiledKnowledge,
} from './lib/knowledge-compiler';

const check = process.argv.includes('--check');
const release = process.argv.includes('--release');
const root = process.cwd();

if (check) {
  const result = checkCompiledKnowledge(root);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  console.log(result.message);
  process.exit(0);
}

const result = compileKnowledge(root, { releaseMode: release });
if (result.issues.length) {
  console.error('Knowledge compilation FAILED (' + result.issues.length + ' issue(s)):');
  for (const issue of result.issues) console.error('  [' + issue.code + '] ' + issue.path + ': ' + issue.message);
  process.exit(1);
}
console.log(formatReport(result.validation));
console.log('Knowledge:', result.knowledge.counts.workArticles, 'work guides,',
  result.knowledge.counts.peopleArticles, 'people,', result.knowledge.counts.noteArticles, 'notes,',
  result.knowledge.counts.peopleRelations, 'relationships.');
if (!check && !release) {
  writeCompiledKnowledge(root);
  console.log('Wrote data/index/knowledge-v1.json');
} else {
  // In check mode the bytes are already compared; keep the call explicit.
  void compiledText(result);
}
