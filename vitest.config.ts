import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), src: fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          include: ['tests/unit/**/*.test.{js,jsx,mjs,cjs,ts,tsx,mts,cts}', 'src/**/*.test.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
          exclude: ['src/Router/ApplicationSsr.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.mjs'],
        },
      },
      {
        extends: true,
        test: { name: 'ssr', include: ['src/Router/ApplicationSsr.test.tsx'], environment: 'node' },
      },
    ],
    maxWorkers: 1,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
      exclude: ['src/**/*.test.{js,jsx,mjs,cjs,ts,tsx,mts,cts}', 'src/**/*.type.ts', 'src/**/*.styles.ts', 'src/**/*.d.ts', 'src/Assets/Art/**'],
      reporter: ['text-summary', 'json-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
    server: { deps: { inline: ['@mui/material', '@mui/system', '@mui/icons-material', 'react-transition-group'] } },
  },
});
