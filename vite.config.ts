/// <reference types="vitest/config" />
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { runReleaseGate } from './scripts/lib/release-gate';
import { knowledgePlugin } from './scripts/lib/knowledge-plugin';

// Keep esbuild's scratch files inside the project. On Windows a sandboxed or
// antivirus-locked system temp directory can refuse the delete that esbuild
// performs after transpiling, which fails the build after a successful bundle.
const localTemp = join(process.cwd(), '.private', 'tmp');
mkdirSync(localTemp, { recursive: true });
process.env.TEMP = localTemp;
process.env.TMP = localTemp;
process.env.TMPDIR = localTemp;

// The edition label in the interface must follow the package release instead of
// being typed into a component. Vite replaces `__APP_VERSION__` in the client
// and in Vitest's transform, so there is one source for both.
const packageVersion = (
  JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string }
).version;

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

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // `VITE_BASE_PATH` lets a build target a sub-path such as `/beitie-atlas/`.
  // It is read at build time only; it never contains a secret.
  const base = env.VITE_BASE_PATH?.trim() || '/';

  // The only release path is `npm run release`, which sets this variable after
  // the strict data gate has passed. `npm run build` stays a preview build.
  const buildMode = env.VITE_RELEASE_MODE === '1' ? 'release' : 'preview';
  if (command === 'build' && buildMode === 'release') {
    const report = runReleaseGate();
    if (!report.ok) throw new Error(`Release data gate rejected ${report.errors.length} issue(s). Run npm run check:release for details.`);
  }

  return {
    base,
    define: { __APP_VERSION__: JSON.stringify(packageVersion) },
    server: { watch: { ignored: ['**/.private/**'] } },
    plugins: [react(), knowledgePlugin(process.cwd()), buildModePlugin(buildMode)],
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      // A developer's .env.local must not change what the suite exercises:
      // tests cover the unconfigured map path, the adapter is tested separately.
      env: { VITE_TIANDITU_KEY: '' },
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  };
});
