/**
 * The package version and build identity, injected by Vite at build time.
 *
 * `package.json` is the only author source of the formal edition. `main` keeps
 * deploying between editions, so the interface also names the revision it was
 * built from; the edition alone would imply that the live site stopped at the
 * last release.
 */
export const APP_VERSION = __APP_VERSION__;
export const BUILD_REVISION = __BUILD_REVISION__;
export const BUILD_DATE = __BUILD_TIME__.slice(0, 10);

export const EDITION_LABEL = {
  zh: APP_VERSION,
  en: `Edition ${APP_VERSION}`,
} as const;

export const BUILD_LABEL = {
  zh: `构建 ${BUILD_REVISION || BUILD_DATE || '未记录'}`,
  en: `build ${BUILD_REVISION || BUILD_DATE || 'unrecorded'}`,
} as const;

export const BUILD_STAMP = {
  zh: `${APP_VERSION} · ${BUILD_LABEL.zh}`,
  en: `Edition ${APP_VERSION} · ${BUILD_LABEL.en}`,
} as const;
