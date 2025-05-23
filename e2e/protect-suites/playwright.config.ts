import { PlaywrightTestConfig } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:8443';

const config: PlaywrightTestConfig = {
  outputDir: './.playwright',
  testDir: './src',
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30000,
  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
    geolocation: { latitude: 24.9884, longitude: -87.3459 },
    bypassCSP: true,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm nx serve @pingidentity/protect-app',
      port: 8443,
      ignoreHTTPSErrors: true,
      reuseExistingServer: !process.env.CI,
      cwd: workspaceRoot,
    },
  ],
};

export default config;
