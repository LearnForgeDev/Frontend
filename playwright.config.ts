import { defineConfig, devices } from '@playwright/test';
import { BACKEND_TIMEOUT_MS } from './tests/e2e/core.const';
import { MINUTE_MS } from './tests/e2e/flows.const';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: MINUTE_MS,
  expect: { timeout: BACKEND_TIMEOUT_MS },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: BACKEND_TIMEOUT_MS,
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});
