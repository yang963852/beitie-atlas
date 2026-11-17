/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Writes the build mode into the served HTML. `scripts/release.ts` checks the
 * same tag in `dist/index.html`, so a preview bundle cannot pass as a release
 * bundle even if the filename looks right.
 */
function buildModePlugin(mode: 'preview' | 'release'): Plugin {
  return {
    name: 'beitie-build-mode',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `    <meta name="beitie-build-mode" content="${mode}" />\n  </head>`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // `VITE_BASE_PATH` lets a build target a sub-path such as `/beitie-atlas/`.
  // It is read at build time only; it never contains a secret.
  const base = env.VITE_BASE_PATH?.trim() || '/';

  // The only release path is `npm run release`, which sets this variable after
  // the strict data gate has passed. `npm run build` stays a preview build.
  const buildMode = env.VITE_RELEASE_MODE === '1' ? 'release' : 'preview';

  return {
    base,
    plugins: [react(), buildModePlugin(buildMode)],
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  };
});
