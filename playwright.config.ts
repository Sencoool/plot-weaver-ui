import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

/**
 * Runs against the Vue… sorry, React dev server plus a reachable API.
 *
 * Locally:
 *   1. start the API          (narrax-api:  npm run start:dev)
 *   2. start the UI           (narrax-ui:   npm run dev)
 *   3. npm run test:e2e
 *
 * The UI is started automatically when it is not already up, unless
 * E2E_BASE_URL points somewhere else (a deployed environment, where this job is
 * expected to be driven from CI instead).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // The AI test drives a real generation, so the suite is not parallel-safe.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
