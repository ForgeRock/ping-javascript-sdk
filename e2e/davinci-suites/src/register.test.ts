import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test('Test happy paths on test page', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/');

  expect(page.url()).toBe('http://localhost:5829/');

  await expect(page.getByText('Username/Password Form')).toBeVisible();

  page.getByText('No account? Register now!').click();

  await expect(page.getByText('Registration form')).toBeVisible();

  const randomEmailPrefix = Math.random().toString(36).slice(-8);

  await page.getByLabel('First Name').fill('Bruce');
  await page.getByLabel('Last Name').fill('Wayne');
  await page.getByLabel('Email').fill(`${randomEmailPrefix}@autogenerated.com`);
  await page.getByLabel('Password').fill('U.CDmhGLK*nrQPDWEN47ZMyJh');

  await page.getByText('Save').click();

  await expect(page.getByText('Prompt for verification code')).toBeVisible();

  // ... considering test successful if we reach this point
});
