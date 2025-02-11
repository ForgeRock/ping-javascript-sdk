import { expect, test } from '@playwright/test';
import { asyncEvents } from './utils/async-events.js';

test('Test happy paths on test page', async ({ page }) => {
  const { navigate } = asyncEvents(page);
  await navigate('/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');

  console.log(page.url());
  expect(page.url()).toBe('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');

  await expect(page.getByText('Select Test Form')).toBeVisible();

  const formFields = page.getByRole('button', { name: 'Form Fields' });
  const formValidation = page.getByRole('button', { name: 'Form Validation' });

  await expect(formFields).toBeVisible();
  await expect(formValidation).toBeVisible();
});
