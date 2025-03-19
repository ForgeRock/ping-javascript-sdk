import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test('Test middleware on test page', async ({ page }) => {
  const networkArray = [];
  page.on('request', async (req) => {
    const url = req.url().toString();
    if (url.includes('https://auth.pingone.ca')) {
      networkArray.push(url);
    }
  });

  const { navigate } = asyncEvents(page);
  await navigate('/');

  expect(page.url()).toBe('http://localhost:5829/');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  const startRequest = networkArray.find((url) => url.includes('/authorize'));
  const nextRequest = networkArray.find((url) => url.includes('/customHTMLTemplate'));

  await expect(startRequest.includes('start=true')).toBeTruthy();
  await expect(startRequest.includes('next=true')).toBeFalsy();
  await expect(nextRequest.includes('next=true')).toBeTruthy();
  await expect(nextRequest.includes('start=true')).toBeFalsy();
});
