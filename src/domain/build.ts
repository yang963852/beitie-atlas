/**
 * The build mode is written into the HTML by Vite (`vite.config.ts`) and read
 * back at runtime. The release command checks the same meta tag in `dist`, so a
 * preview bundle cannot be mistaken for a release bundle by inspecting the
 * artifact alone.
 */

export type BuildMode = 'preview' | 'release';

function readBuildMode(): BuildMode {
  if (typeof document !== 'undefined') {
    const content = document
      .querySelector('meta[name="beitie-build-mode"]')
      ?.getAttribute('content');
    if (content === 'release' || content === 'preview') return content;
  }
  return import.meta.env.VITE_RELEASE_MODE === '1' ? 'release' : 'preview';
}

export const buildMode: BuildMode = readBuildMode();

export const isReleaseBuild = buildMode === 'release';
