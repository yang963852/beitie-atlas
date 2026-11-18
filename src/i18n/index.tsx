import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { enStrings, type Strings } from './en';
import { zhStrings } from './zh';

export type Locale = 'zh' | 'en';
export type { Strings };

const DICTIONARIES: Record<Locale, Strings> = { zh: zhStrings, en: enStrings };

const STORAGE_KEY = 'beitie.locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'zh' || value === 'en';
}

/**
 * Chinese is the product default. A stored choice wins, so a reader who picked
 * English does not get switched back on the next visit.
 */
export function initialLocale(): Locale {
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* Storage can be blocked; the default is still usable. */
  }
  return 'zh';
}

interface LocaleContextValue {
  locale: Locale;
  strings: Strings;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage?.setItem(STORAGE_KEY, next);
    } catch {
      /* The in-memory choice still applies for this session. */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  }, [locale]);

  const value = useMemo(
    () => ({ locale, strings: DICTIONARIES[locale], setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside a LocaleProvider.');
  }
  return context;
}

export function useStrings(): Strings {
  return useLocale().strings;
}
