/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { expect, test } from '@playwright/test';
import { password, username } from './utils/demo-user.js';
import type { Callback, NameValue } from '@forgerock/javascript-sdk';

test.describe('Test basic login flow with Ping Protect', () => {
  test.afterEach(({ page }) => {
    page.removeListener('console', (msg) => console.log(msg.text()));
  });

  test('should send Protect data and login successfully', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', async (msg) => {
      logs.push(msg.text());
      return Promise.resolve(true);
    });

    let riskData: string | null = null;

    page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();
      const payload = request.postDataJSON();

      // Only process POST requests with JSON payloads
      if (method === 'POST' && payload && requestUrl.includes('/authenticate')) {
        const callback: Callback = payload.callbacks?.find(
          (callback: Callback) => callback.type === 'PingOneProtectEvaluationCallback',
        );

        if (callback) {
          const data = callback.input?.find((input: NameValue) => input.name === 'IDToken1signals')
            ?.value as string | undefined;
          riskData = data ?? null;
        }
      }
    });

    await page.goto('/protect-native.html');
    await expect(page.url()).toBe('http://localhost:8443/protect-native.html');

    await expect(page.getByText('Ping Protect Native')).toBeVisible();
    await expect(page.getByText('Protect initializing')).toBeVisible();

    const protectPromise = page.waitForRequest((req) => {
      return (
        req.method() === 'POST' &&
        req.url().includes('/authenticate') &&
        req
          .postDataJSON()
          ?.callbacks?.some(
            (callback: Callback) => callback.type === 'PingOneProtectEvaluationCallback',
          )
      );
    });

    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Protect evaluating')).toBeVisible();

    await protectPromise;

    // Verify signals were captured from the request
    expect(riskData).not.toBeNull();
    expect(typeof riskData).toBe('string');
    expect(riskData).toMatch(/^R\/o\//);

    await expect(logs.includes('protect initialized')).toBeTruthy();
    await expect(logs.includes('protect evaluating')).toBeTruthy();
    await expect(logs.includes('received data')).toBeTruthy();
    await expect(logs.includes('set data on evaluation callback')).toBeTruthy();
  });
});
