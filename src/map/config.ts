/**
 * Provider configuration.
 *
 * IMPORTANT: a browser map key is public. It is shipped inside the built
 * JavaScript whatever `.env` looks like, so it must be restricted by domain,
 * quota, and provider terms. It is not a secret and must not be treated as one.
 * A key that needs to stay private requires a server-side proxy, which this
 * task does not include.
 */

const rawKey = import.meta.env.VITE_TIANDITU_KEY;

/** Trimmed public browser key, or an empty string when the build has none. */
export const tiandituKey: string = typeof rawKey === 'string' ? rawKey.trim() : '';

export const mapIsConfigured = tiandituKey.length > 0;

/** Official JavaScript API 4.0 entry point documented by the provider. */
export const TIANDITU_API_ORIGIN = 'https://api.tianditu.gov.cn';
export const TIANDITU_SCRIPT_URL = `${TIANDITU_API_ORIGIN}/api?v=4.0&tk=${encodeURIComponent(tiandituKey)}`;

export const LOAD_TIMEOUT_MS = 15_000;

/** Fallback view when no marker exists: the national extent, not a site. */
export const DEFAULT_VIEW = { longitude: 104.2, latitude: 35.9, zoom: 4 };
