/**
 * Language selection for editorial text.
 *
 * Kept in the domain layer because both the detail view and the map panel need
 * it, and a component importing it from another component would tie two
 * unrelated views together.
 */
export type Locale = 'zh' | 'en';

/**
 * Picks the reader's language when the record carries it, otherwise the
 * language it was written in. Editorial prose is never machine-translated at
 * render time: a missing translation shows the recorded wording instead.
 */
export function pickText(
  locale: Locale,
  zh: string | null | undefined,
  en: string | null | undefined,
): string | null {
  if (locale === 'zh' && zh) return zh;
  return en ?? zh ?? null;
}
