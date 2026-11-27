import { useLocale, type Locale } from '../i18n';

/**
 * One language control for every header. Both choices stay visible, so the
 * current locale and the target read unambiguously, and the opening desk,
 * the library and the atlas share the same interaction.
 */
export function LocaleSwitch({ className = 'langswitch' }: { className?: string }) {
  const { locale, strings, setLocale } = useLocale();
  const option = (value: Locale, label: string) => (
    <button
      type="button"
      className="langswitch__button"
      aria-pressed={locale === value}
      onClick={() => setLocale(value)}
    >
      {label}
    </button>
  );

  return (
    <div className={className} role="group" aria-label={strings.languageLabel}>
      {option('zh', strings.languageZh)}
      {option('en', strings.languageEn)}
    </div>
  );
}
