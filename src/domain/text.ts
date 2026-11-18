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

/**
 * The language a recorded sentence is written in. Editorial prose is stored as
 * written, so the view must mark it for screen readers and for the browser's
 * hyphenation rather than assume the interface language.
 */
export function detectLang(value: string): 'zh-Hans' | 'en' {
  return /[\u3400-\u9fff]/.test(value) ? 'zh-Hans' : 'en';
}
