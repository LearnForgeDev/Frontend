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
  },
}));
