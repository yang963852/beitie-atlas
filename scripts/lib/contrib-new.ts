/**
 * Create one author record from its Chinese template.
 *
 * The scaffold is a plain copy on purpose: the template's comments explain
 * each field, and they only help if they travel into the new file. The ID rule
 * is the compiler's own, so a scaffolded file cannot fail on its name, and an
 * existing record is never overwritten.
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stableId } from './knowledge-schema';

export interface RecordType {
  dir: string;
  template: string;
}

export const RECORD_TYPES: Readonly<Record<string, RecordType>> = {
  work: { dir: 'works', template: 'work.md' },
  object: { dir: 'objects', template: 'object.md' },
  person: { dir: 'people', template: 'person.md' },
  people: { dir: 'people', template: 'person.md' },
  note: { dir: 'notes', template: 'note.md' },
  place: { dir: 'places', template: 'place.md' },
  source: { dir: 'sources', template: 'source.md' },
};

/** Accept the singular type, the directory name, or either with a trailing `s`. */
export function recordType(name: string): RecordType | null {
  const key = name.trim().toLowerCase();
  return RECORD_TYPES[key] ?? RECORD_TYPES[key.replace(/s$/, '')] ?? null;
}

export function scaffold(root: string, typeName: string, id: string): { path: string } {
  const type = recordType(typeName);
  if (!type) {
    throw new Error('Unknown record type "' + typeName + '". Use one of: ' + Object.keys(RECORD_TYPES).join(', ') + '.');
  }
  if (!stableId(id)) {
    throw new Error('"' + id + '" is not a stable ID: use lowercase letters, digits and single hyphens, e.g. yan-qinli-bei.');
  }
  const template = join(root, 'knowledge', '_templates', type.template);
  if (!existsSync(template)) throw new Error('Missing template knowledge/_templates/' + type.template);
  const target = join(root, 'knowledge', type.dir, id + '.md');
  if (existsSync(target)) {
    throw new Error('knowledge/' + type.dir + '/' + id + '.md already exists; edit that record or choose another ID.');
  }
  mkdirSync(join(root, 'knowledge', type.dir), { recursive: true });
  copyFileSync(template, target);
  return { path: 'knowledge/' + type.dir + '/' + id + '.md' };
}
