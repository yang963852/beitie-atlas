/**
 * Rewrite author Markdown from author-schema v1 to v2.
 *
 * v1 nested related fields into blocks (`date: {kind, start, ...}`); v2 lifts
 * them to flat, prefixed keys (`dateKind`, `dateStart`, ...) so Obsidian's
 * properties panel can edit every field natively. The compiled interface does
 * not move: the compiler reads the same values under their new names, and the
 * migration is accepted only when the compiled bytes are identical to the
 * corpus that preceded it.
 *
 * This is a text rewrite, not a YAML round-trip. Comments, quoting, key order,
 * blank lines and every byte after the closing `---` survive exactly.
 *
 * An already-migrated file comes back unchanged, so the transform is safe to
 * re-run and cheap to gate.
 */

export type ChildMap = Readonly<Record<string, string | null>>;

export const FROM_VERSION = 1;
export const TO_VERSION = 2;

/**
 * Every nested block in author-schema v1 and the flat key each child becomes.
 * `null` drops the child: `coordinates.crs` was a fixed WGS84 constant that the
 * v1 template wrote only to satisfy a required field.
 *
 * The maps are enumerated from the v1 corpus. A child outside them is a
 * migration error rather than a silent pass-through.
 */
export const BLOCKS: Readonly<Record<string, ChildMap>> = {
  date: {
    kind: 'dateKind',
    start: 'dateStart',
    month: 'dateMonth',
    end: 'dateEnd',
    endMonth: 'dateEndMonth',
    era: 'dateEra',
    original: 'dateOriginal',
    certainty: 'dateCertainty',
    meaning: 'dateMeaning',
    note: 'dateNote',
  },
  dimensions: {
    raw: 'dimensionsRaw',
    note: 'dimensionsNote',
  },
  collection: {
    kind: 'collectionKind',
    place: 'collectionPlace',
    sources: 'collectionSources',
    accessedAt: 'collectionAccessedAt',
    asOf: 'collectionAsOf',
    note: 'collectionNote',
    noteZh: 'collectionNoteZh',
  },
  version: {
    label: 'versionLabel',
    basis: 'versionBasis',
    sources: 'versionSources',
    note: 'versionNote',
    noteZh: 'versionNoteZh',
  },
  review: {
    state: 'reviewState',
    note: 'reviewNote',
    noteZh: 'reviewNoteZh',
  },
  guide: {
    state: 'guideState',
    timelineYear: 'guideTimelineYear',
    people: 'guidePeople',
    objects: 'guideObjects',
    sources: 'guideSources',
  },
  coordinates: {
    longitude: 'coordinateLongitude',
    latitude: 'coordinateLatitude',
    precision: 'coordinatePrecision',
    method: 'coordinateMethod',
    verification: 'coordinateVerification',
    sources: 'coordinateSources',
    note: 'coordinateNote',
    noteZh: 'coordinateNoteZh',
    crs: null,
  },
};

export interface MigrationResult {
  /** The rewritten source, or the input when nothing applied. */
  text: string;
  changed: boolean;
  errors: string[];
}

const KEY = /^(- )?([A-Za-z][A-Za-z0-9_]*):([ \t]*)(.*)$/;

interface OpenBlock {
  lineIndent: number;
  shift: number | null;
  map: ChildMap;
}

const own = (record: Readonly<Record<string, unknown>>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(record, key);

/**
 * Rewrite one source file. `label` only appears in error messages.
 *
 * Errors are collected rather than thrown so a corpus run can report every
 * offending file before it stops.
 */
export function migrateSource(input: string, label = 'input'): MigrationResult {
  const errors: string[] = [];
  const newline = input.includes('\r\n') ? '\r\n' : '\n';
  const lines = input.split(newline);
  if (lines[0]?.trim() !== '---') return { text: input, changed: false, errors };

  let close = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index]!.trim() === '---') {
      close = index;
      break;
    }
  }
  if (close < 0) {
    errors.push(label + ': frontmatter is never closed');
    return { text: input, changed: false, errors };
  }

  const frontmatter: string[] = [];
  const stack: OpenBlock[] = [];

  for (let index = 1; index < close; index += 1) {
    const line = lines[index]!;
    if (line.trim() === '') {
      frontmatter.push(line);
      continue;
    }

    const indent = line.length - line.trimStart().length;
    while (stack.length > 0 && indent <= stack[stack.length - 1]!.lineIndent) stack.pop();
    const open = stack[stack.length - 1];

    if (open) {
      if (open.shift === null) open.shift = indent - open.lineIndent;
      const targetIndent = Math.max(0, indent - open.shift);
      const content = line.slice(indent);
      const match = KEY.exec(content);
      if (!match) {
        frontmatter.push(' '.repeat(targetIndent) + content);
        continue;
      }
      const key = match[2]!;
      if (!own(open.map, key)) {
        errors.push(label + ':' + (index + 1) + ': unsupported key "' + key + '" inside a nested block');
        frontmatter.push(line);
        continue;
      }
      const target = open.map[key];
      if (target === null) continue;
      frontmatter.push(' '.repeat(targetIndent) + (match[1] ?? '') + target + ':' + match[3]! + match[4]!);
      continue;
    }

    const content = line.slice(indent);
    const match = KEY.exec(content);
    if (!match) {
      frontmatter.push(line);
      continue;
    }
    const dash = match[1] ?? '';
    const key = match[2]!;
    const gap = match[3]!;
    const value = match[4]!;

    if (dash === '' && key === 'schemaVersion') {
      frontmatter.push(value.trim() === String(FROM_VERSION)
        ? 'schemaVersion:' + gap + TO_VERSION
        : line);
      continue;
    }

    if (dash === '' && own(BLOCKS, key)) {
      const map = BLOCKS[key]!;
      const trimmed = value.trim();
      if (trimmed === '') {
        stack.push({ lineIndent: indent, shift: null, map });
        continue;
      }
      if (trimmed === 'null') continue;
      errors.push(label + ':' + (index + 1) + ': nested block "' + key + '" carries an inline value');
      frontmatter.push(line);
      continue;
    }

    frontmatter.push(line);
  }

  const text = ['---', ...frontmatter, ...lines.slice(close)].join(newline);
  return { text, changed: text !== input, errors };
}
