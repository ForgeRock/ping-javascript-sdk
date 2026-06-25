/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, test } from '@playwright/test';

import { asyncEvents } from './utils/async-events.js';

test.describe('Challenge Polling', () => {
  test('should succeed when opening magic link', async ({ page, browser }) => {
    const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
    const davinciPolicy = 'f40b544a4dfb575daa0cf5e9487c206a';
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await expect(page.url()).toBe(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciPolicy}`,
    );

    await page.getByRole('button', { name: 'Sign On' }).click();
    await expect(page.getByRole('heading', { name: 'Polling' })).toBeVisible();

    // Get magic link
    const linkLocator = page.getByText('Number Challenge https://auth.pingone');
    await expect(linkLocator).toBeVisible();

    const linkLocatorText = await linkLocator.innerText();
    const magicLink = linkLocatorText.split('Number Challenge ')[1];
    expect(magicLink).toContain('https://auth.pingone');

    // Start polling
    await page.getByRole('button', { name: 'Start polling' }).click();
    await expect(page.getByText('Polling...')).toBeVisible();

    // Go to magic link in another browser to complete challenge
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto(magicLink);
    await expect(newPage.getByText('Close me')).toBeVisible();
    await newContext.close();

    // Check for success
    await expect(page.getByText('Message: approved')).toBeVisible();
  });

  test('should timeout when retries are exhausted', async ({ page }) => {
    const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
    const davinciPolicy = 'f40b544a4dfb575daa0cf5e9487c206a';
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await expect(page.url()).toBe(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciPolicy}`,
    );

    await page.getByRole('button', { name: 'Sign On' }).click();
    await expect(page.getByRole('heading', { name: 'Polling' })).toBeVisible();

    // Track poll retries
    let numPollRequests = 0;
    page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();

      if (method === 'POST' && requestUrl.includes('/status')) {
        numPollRequests++;
      }
    });

    // Start polling
    await page.getByRole('button', { name: 'Start polling' }).click();
    await expect(page.getByText('Polling...')).toBeVisible();

    // Wait for timeout
    const pollInterval = 2000; // milliseconds
    const maxRetries = 5;
    await expect(page.getByText('Error: timedOut')).toBeVisible({
      timeout: 2 * pollInterval * maxRetries,
    });

    // Check max retry count
    expect(numPollRequests).toBe(maxRetries);
  });

  test('should return expired status after challenge expires', async ({ page }) => {
    const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
    const davinciPolicy = 'f40b544a4dfb575daa0cf5e9487c206a';
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await expect(page.url()).toBe(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciPolicy}`,
    );

    await page.getByRole('button', { name: 'Sign On' }).click();
    await expect(page.getByRole('heading', { name: 'Polling' })).toBeVisible();

    // Track poll retries
    let numPollRequests = 0;
    page.on('request', (request) => {
      const method = request.method();
      const requestUrl = request.url();

      if (method === 'POST' && requestUrl.includes('/status')) {
        numPollRequests++;
      }
    });

    // Wait for challenge to expire
    const challengeExpiry = 15000; // milliseconds
    await page.waitForTimeout(challengeExpiry + 5000);

    // Start polling
    await page.getByRole('button', { name: 'Start polling' }).click();
    await expect(page.getByText('Polling...')).toBeVisible();

    // Check for expired status
    await expect(page.getByText('Error: expired')).toBeVisible();

    // Check poll count
    expect(numPollRequests).toBe(1);
  });
});

test.describe('Continue Polling', () => {
  test('should succeed on QR code scan simulation', async ({ page }) => {
    const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
    const davinciPolicy = '27aacf0efcc480dfcd00b04be8023cdc';
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await expect(page.url()).toBe(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciPolicy}`,
    );

    await expect(page.getByRole('heading', { name: 'Select Continue Polling Test' })).toBeVisible();
    await page.getByRole('button', { name: 'Success' }).click();
    await expect(page.getByRole('heading', { name: 'Polling' })).toBeVisible();

    // Start polling
    const numberCounterSuccess = 2;
    for (let i = 0; i < numberCounterSuccess; i++) {
      await page.getByRole('button', { name: 'Start polling' }).click();
      await expect(page.getByText('Polling...')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start polling' })).toBeDisabled();
    }

    // Check for success
    await expect(page.getByText('Message: Done')).toBeVisible();
  });

  test('should timeout when retries are exhausted', async ({ page }) => {
    const clientId = '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0';
    const davinciPolicy = '27aacf0efcc480dfcd00b04be8023cdc';
    const { navigate } = asyncEvents(page);
    await navigate(`/?clientId=${clientId}&acr_values=${davinciPolicy}`);

    await expect(page.url()).toBe(
      `http://localhost:5829/?clientId=${clientId}&acr_values=${davinciPolicy}`,
    );

    await expect(page.getByRole('heading', { name: 'Select Continue Polling Test' })).toBeVisible();
    await page.getByRole('button', { name: 'Timeout' }).click();
    await expect(page.getByRole('heading', { name: 'Polling' })).toBeVisible();

    // Start polling
    const maxRetries = 3;
    for (let i = 0; i < maxRetries + 1; i++) {
      await page.getByRole('button', { name: 'Start polling' }).click();
      await expect(page.getByText('Polling...')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start polling' })).toBeDisabled();
    }

    // Check for timeout
    await expect(page.getByText('Error: timedOut')).toBeVisible();
  });
});
