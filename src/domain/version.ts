/**
 * The package version, injected from package.json at build time. A release
 * updates package.json; the interface edition label follows it instead of
 * carrying a second hand-typed version.
 */
export const APP_VERSION = __APP_VERSION__;

export const EDITION_LABEL = {
  zh: APP_VERSION,
  en: `Edition ${APP_VERSION}`,
} as const;
