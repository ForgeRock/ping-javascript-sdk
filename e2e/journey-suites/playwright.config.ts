/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { PlaywrightTestConfig } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:5829';

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
    process.env.CI == 'false'
      ? {
          command: 'pnpm watch @forgerock/journey-app',
          port: 5829,
          ignoreHTTPSErrors: true,
          reuseExistingServer: !process.env.CI,
          cwd: workspaceRoot,
        }
      : undefined,
    {
      command: 'pnpm nx serve @forgerock/journey-app',
      port: 5829,
      ignoreHTTPSErrors: true,
      reuseExistingServer: !process.env.CI,
      cwd: workspaceRoot,
    },
  ].filter(Boolean),
};

export default config;
