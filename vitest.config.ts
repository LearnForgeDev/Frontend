import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.mjs'],
    maxWorkers: 1,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.types.ts', 'src/**/*.styles.ts', 'src/**/*.d.ts', 'src/Assets/Art/**'],
      reporter: ['text-summary', 'json-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
    server: { deps: { inline: ['@mui/material', '@mui/system', '@mui/icons-material', 'react-transition-group'] } },
  },
}));
