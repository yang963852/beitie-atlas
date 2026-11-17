/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // `VITE_BASE_PATH` lets a build target a sub-path such as `/beitie-atlas/`.
  // It is read at build time only; it never contains a secret.
  const base = env.VITE_BASE_PATH?.trim() || '/';

  return {
    base,
    plugins: [react()],
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
