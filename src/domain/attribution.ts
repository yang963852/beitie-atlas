/**
 * Rendering helpers for credited hands.
 *
 * A stele is not a book: the person who wrote the text, the person who brushed
 * it onto the stone, the carver, and the donors who paid for it are separate
 * claims. The interface keeps those roles visible instead of collapsing them
 * into one "author" line.
 */

import type { Attribution, AttributionRole } from './types';

export type Locale = 'zh' | 'en';

export function attributionName(entry: Attribution, locale: Locale): string {
  if (locale === 'zh') return entry.name;
  return entry.nameEn ?? entry.name;
}

export function attributionNote(entry: Attribution, locale: Locale): string | null {
  if (locale === 'zh') return entry.noteZh ?? entry.note ?? null;
  return entry.note ?? null;
}

/**
 * One line for a list row: `撰 岑勋 · 书 颜真卿 · 刻 史华`.
 * An unrecorded maker renders its own wording, never `未署名 未署名`.
 */
export function formatAttribution(
  entries: Attribution[],
  locale: Locale,
  labels: Record<AttributionRole, string>,
): string {
  return entries
    .map((entry) => {
      const name = attributionName(entry, locale);
      if (entry.role === 'unknown') return name;
      return locale === 'zh' ? `${labels[entry.role]} ${name}` : `${name} (${labels[entry.role]})`;
    })
    .join(' · ');
}
