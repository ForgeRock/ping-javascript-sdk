/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';
import type { Callback, NameValue } from '@forgerock/journey-client';

test.describe('Test PingOne Protect journey flow', () => {
  test('initialized with envId (standard config)', async ({ page }) => {
    const { clickButton } = asyncEvents(page);
    const messageArray: string[] = [];

    page.on('console', async (msg) => {
      messageArray.push(msg.text());
      return Promise.resolve(true);
    });

    let riskData: string | null = null;
    let envIdConfig: string | null = null;

    page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();
      const payload = request.postDataJSON();

      // Only process POST requests with JSON payloads
      if (method === 'POST' && payload && requestUrl.includes('/authenticate')) {
        const protectCb: Callback = payload.callbacks?.find(
          (callback: Callback) =>
            callback.type === 'PingOneProtectInitializeCallback' ||
            callback.type === 'PingOneProtectEvaluationCallback',
        );

        if (protectCb?.type === 'PingOneProtectInitializeCallback') {
          const envId = protectCb.output?.find((output: NameValue) => output.name === 'envId')
            ?.value as string | undefined;
          envIdConfig = envId ?? null;
        }

        if (protectCb?.type === 'PingOneProtectEvaluationCallback') {
          const data = protectCb.input?.find((input: NameValue) => input.name === 'IDToken1signals')
            ?.value as string | undefined;
          riskData = data ?? null;
        }
      }
    });

    await page.goto('/?journey=TEST_LoginPingProtect&clientId=basic');

    await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PingOne Protect initialized successfully!')).toBeVisible({
      timeout: 15000,
    });

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

    await expect(page.getByLabel('User Name')).toBeVisible();
    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);
    await clickButton('Submit', '/authenticate');

    await expect(page.getByText('Evaluating risk assessment...')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Risk assessment completed successfully!')).toBeVisible({
      timeout: 15000,
    });

    // Wait for risk data to be evaluated
    await protectPromise;

    // Verify signals were captured from the request
    expect(riskData).not.toBeNull();
    expect(typeof riskData).toBe('string');
    expect(riskData).toMatch(/^R\/o\//);

    // Verify standard config by presence of envId
    expect(envIdConfig).not.toBeNull();
    expect(typeof envIdConfig).toBe('string');

    // Verify the protect SDK flow through console logs
    expect(messageArray.some((msg) => msg.includes('Protect initialized successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Protect data collected successfully'))).toBe(
      true,
    );
  });

  test('intialized with signalInitializationOptions', async ({ page }) => {
    const { clickButton } = asyncEvents(page);
    const messageArray: string[] = [];

    page.on('console', async (msg) => {
      messageArray.push(msg.text());
      return Promise.resolve(true);
    });

    let riskData: string | null = null;
    let envIdConfig: string | null = null;

    page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();
      const payload = request.postDataJSON();

      // Only process POST requests with JSON payloads
      if (method === 'POST' && payload && requestUrl.includes('/authenticate')) {
        const protectCb: Callback = payload.callbacks?.find(
          (callback: Callback) =>
            callback.type === 'PingOneProtectInitializeCallback' ||
            callback.type === 'PingOneProtectEvaluationCallback',
        );

        if (protectCb?.type === 'PingOneProtectInitializeCallback') {
          const envId = protectCb.output?.find((output: NameValue) => output.name === 'envId')
            ?.value as string | undefined;
          envIdConfig = envId ?? null;
        }

        if (protectCb?.type === 'PingOneProtectEvaluationCallback') {
          const data = protectCb.input?.find((input: NameValue) => input.name === 'IDToken1signals')
            ?.value as string | undefined;
          riskData = data ?? null;
        }
      }
    });

    await page.goto('/?journey=TEST_LoginPingProtectSignalsOptions&clientId=basic');

    await expect(page.getByText('Initializing PingOne Protect...')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PingOne Protect initialized successfully!')).toBeVisible({
      timeout: 15000,
    });

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

    await expect(page.getByLabel('User Name')).toBeVisible();
    await page.getByLabel('User Name').fill(username);
    await page.getByLabel('Password').fill(password);
    await clickButton('Submit', '/authenticate');

    await expect(page.getByText('Evaluating risk assessment...')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Risk assessment completed successfully!')).toBeVisible({
      timeout: 15000,
    });

    // Wait for risk data to be evaluated
    await protectPromise;

    // Verify signals were captured from the request
    expect(riskData).not.toBeNull();
    expect(typeof riskData).toBe('string');
    expect(riskData).toMatch(/^R\/o\//);

    // Verify signalInitializationOptions config by absence of envId
    expect(envIdConfig).toBeNull();

    // Verify the protect SDK flow through console logs
    expect(messageArray.some((msg) => msg.includes('Protect initialized successfully'))).toBe(true);
    expect(messageArray.some((msg) => msg.includes('Protect data collected successfully'))).toBe(
      true,
    );
  });
});
