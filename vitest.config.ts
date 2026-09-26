import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Vitest's default glob also collects e2e/*.spec.ts, which belong to Playwright.
// Running those under vitest throws "Playwright Test did not expect test() to be
// called here" and fails `npm run test` — which is exactly how CI broke.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
)
