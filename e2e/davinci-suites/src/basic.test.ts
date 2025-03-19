import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';
import { password, username } from './utils/demo-user.js';

test('Test happy paths on test page', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/');

  expect(page.url()).toBe('http://localhost:5829/');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Sign On' }).click();

  await expect(page.getByText('Complete')).toBeVisible();

  const sessionToken = await page.locator('#sessionToken').innerText();
  const authCode = await page.locator('#authCode').innerText();
  await expect(sessionToken).toBeTruthy();
  await expect(authCode).toBeTruthy();

  await page.getByText('Get Tokens').click();

  const accessToken = await page.locator('#accessTokenValue').innerText();
  await expect(accessToken).toBeTruthy();

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible();
  const revokeCall = page.waitForResponse((response) => {
    if (response.url().includes('/revoke') && response.status() === 200) {
      return true;
    }
  });
  const signoff = page.waitForResponse((response) => {
    if (response.url().includes('/signoff') && response.status() === 302) {
      return true;
    }
  });
  await logoutButton.click();
  await revokeCall;
  await signoff;
  await expect(page.getByText('Username/Password Form')).toBeVisible();
});
test('ensure query params passed to start are sent off in authorize call', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  // Wait for the request to a URL containing '/authorize'
  const requestPromise = page.waitForRequest((request) => {
    return request
      .url()
      .includes('https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/authorize');
  });
  await navigate('/?testParam=123');

  // Wait for the request to be made to authorize
  const request = await requestPromise;

  // Extract and verify the query parameters from authorize
  const url = new URL(request.url());
  const queryParams = Object.fromEntries(url.searchParams.entries());

  expect(queryParams['testParam']).toBe('123');
  expect(queryParams['client_id']).toBe('724ec718-c41c-4d51-98b0-84a583f450f9');
  expect(queryParams['response_mode']).toBe('pi.flow');

  expect(page.url()).toBe('http://localhost:5829/?testParam=123');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  await page.getByText('Sign On').click();

  await expect(page.getByText('Complete')).toBeVisible();

  const sessionToken = await page.locator('#sessionToken').innerText();
  const authCode = await page.locator('#authCode').innerText();
  expect(sessionToken).toBeTruthy();
  expect(authCode).toBeTruthy();

  await page.getByText('Get Tokens').click();

  const accessToken = await page.locator('#accessTokenValue').innerText();
  expect(accessToken).toBeTruthy();
});
