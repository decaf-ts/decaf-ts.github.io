import { defineConfig, devices } from '@playwright/test';
import { APP_URL } from './fixtures';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  snapshotPathTemplate: '{testDir}/visual/{arg}{ext}',
  webServer: {
    command: 'node /workspaces/decaf-ts/web-page/tests/playwright/serve.mjs /workspaces/decaf-ts/web-page/www /workspaces/decaf-ts/web-page/www-mock',
    url: `${APP_URL}/`,
    reuseExistingServer: true,
    timeout: 30_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
});
