/**
 * Scaffold one author record from its Chinese template.
 *
 *   npm run contrib:new -- work yan-qinli-bei
 *   npm run contrib:new -- object shenlong-ben
 *   npm run contrib:new -- people cai-yong
 *
 * The new file is a draft with placeholder text. It compiles, but the release
 * gate rejects it until the placeholders are replaced with sourced content.
 */

import { RECORD_TYPES, scaffold } from './lib/contrib-new';

const [typeName, id, ...rest] = process.argv.slice(2);

if (!typeName || !id || rest.length > 0) {
  console.error('Usage: npm run contrib:new -- <type> <stable-id>');
  console.error('Types: ' + Object.keys(RECORD_TYPES).join(', '));
  process.exit(1);
}

try {
  const result = scaffold(process.cwd(), typeName, id);
  console.log('created ' + result.path);
  console.log('');
  console.log('Next: replace every placeholder, leave values you cannot source empty,');
  console.log('then run  npm run knowledge:compile && npm run knowledge:generate');
  console.log('It stays a draft until an editor reviews it; the release gate rejects placeholders.');
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
