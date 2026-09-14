/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { username, password } from './utils/demo-user.js';

interface RecognizeInputCapture {
  signedJwt: string | null;
  recognizeId: string | null;
  clientError: string | null;
  clientErrorCode: string | null;
}

function captureRecognizeInputs(page: import('@playwright/test').Page) {
  const captured: RecognizeInputCapture[] = [];

  page.on('request', (request) => {
    if (request.url().includes('/authenticate') && request.method() === 'POST') {
      try {
        const postData = request.postData();
        if (postData) {
          const body = JSON.parse(postData);
          const callbacks = body.callbacks || [];
          for (const callback of callbacks) {
            if (callback.type === 'PingOneRecognizeCallback') {
              const inputs = callback.input || [];
              const value = (name: string) =>
                inputs.find((input: { name: string }) => input.name === name)?.value ?? null;
              captured.push({
                signedJwt: value('IDToken1signedJwt'),
                recognizeId: value('IDToken1recognizeId'),
                clientError: value('IDToken1clientError'),
                clientErrorCode: value('IDToken1clientErrorCode'),
              });
            }
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
  });

  return captured;
}

test('Test PingOne Recognize journey flow', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  const messageArray: string[] = [];
  const captured = captureRecognizeInputs(page);

  page.on('console', async (msg) => {
    messageArray.push(msg.text());
    return Promise.resolve(true);
  });

  await navigate('/?journey=TEST_LoginPingRecognize&clientId=basic');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 15000 });
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  // The callback component should render the server-provided outputs
  await expect(page.locator('#recognizeConfig')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#recognizeConfig')).toContainText('"operationType": "AUTHENTICATE"');
  await expect(page.locator('#recognizeConfig')).toContainText('https://recognize.example.com');
  await expect(page.locator('#recognizeConfig')).toContainText('mock-customer');
  await expect(page.locator('#recognizeConfig')).toContainText('"sdkuser"');
  await expect(page.locator('#recognizeConfig')).toContainText('mock-transaction-data');
  await expect(page.locator('#recognizeConfig')).toContainText('"requestRecognitionFrame": true');

  // Simulated Recognize completion sets the JWT and auto-submits
  await expect(page.getByText('Recognize completed successfully!')).toBeVisible({
    timeout: 10000,
  });

  // Wait for the recognize callback to auto-submit and complete
  await page.waitForResponse((response) => response.url().includes('/authenticate'));

  await expect(page.getByText('Complete')).toBeVisible({ timeout: 15000 });

  // Verify the signed JWT and recognizeId were submitted to the server
  expect(captured.length).toBeGreaterThan(0);
  const lastSubmit = captured[captured.length - 1];
  expect(lastSubmit.signedJwt).toBeTruthy();
  expect(lastSubmit.signedJwt).toContain('.');
  expect(lastSubmit.recognizeId).toBe('mock-recognize-id');
  expect(lastSubmit.clientError).toBe('');

  // Verify the recognize SDK flow through console logs
  expect(messageArray.some((msg) => msg.includes('Recognize data collected successfully'))).toBe(
    true,
  );
});

test('Test PingOne Recognize journey flow with client error', async ({ page }) => {
  const { clickButton, navigate } = asyncEvents(page);
  const captured = captureRecognizeInputs(page);

  await navigate('/?journey=TEST_LoginPingRecognize&clientId=basic&recognizeError=true');

  await expect(page.getByLabel('User Name')).toBeVisible({ timeout: 15000 });
  await page.getByLabel('User Name').fill(username);
  await page.getByLabel('Password').fill(password);
  await clickButton('Submit', '/authenticate');

  // The component simulates a Recognize failure and auto-submits the client error
  await expect(page.getByText('Recognize failed: CORE_FACE_NOT_MATCHING')).toBeVisible({
    timeout: 10000,
  });

  await page.waitForResponse((response) => response.url().includes('/authenticate'));

  // The mock echoes the submitted client error in the 401 failure message
  const errorMessage = page.locator('#errorMessage');
  await expect(errorMessage).toBeVisible({ timeout: 15000 });
  await expect(errorMessage).toContainText('CORE_FACE_NOT_MATCHING');
  await expect(errorMessage).toContainText('3004');

  // Verify the client error was submitted and no JWT was sent
  expect(captured.length).toBeGreaterThan(0);
  const lastSubmit = captured[captured.length - 1];
  expect(lastSubmit.clientError).toBe('CORE_FACE_NOT_MATCHING');
  expect(lastSubmit.clientErrorCode).toBe('3004');
  expect(lastSubmit.signedJwt).toBe('');
  expect(lastSubmit.recognizeId).toBe('');
});
