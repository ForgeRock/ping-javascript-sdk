import { expect, test } from '@playwright/test';

test('Should render form fields', async ({ page }) => {
  await page.goto('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');
  await page.getByRole('heading', { name: 'Select Test Form' }).click();
  await page.getByRole('button', { name: 'Form Fields' }).click();
  await page.getByRole('textbox', { name: 'Text Input Label' }).click();
  await page.getByRole('textbox', { name: 'Text Input Label' }).click();

  const txtInput = page.getByRole('textbox', { name: 'Text Input Label' });
  await txtInput.fill('This is some text');
  expect(txtInput).toHaveValue('This is some text');

  const flowLink = page.getByRole('button', { name: 'Flow Link' });
  await flowLink.click();

  const flowButton = page.getByRole('button', { name: 'Flow Button' });
  await flowButton.click();

  const requestPromise = page.waitForRequest((request) => request.url().includes('/customForm'));
  await page.getByRole('button', { name: 'Submit' }).click();
  const request = await requestPromise;
  const parsedData = JSON.parse(request.postData());
  const data = parsedData.parameters.data;
  expect(data.actionKey).toBe('submit');
  expect(data.formData).toEqual({
    // leaving this here because it should be fixed and we would have a failing test when we do fix import {  } from "// to remind us to update the test"
    ['undefined']: '',
    ['text-input-key']: 'This is some text',
    ['dropdown-field-key']: '',
    ['radio-group-key']: '',
  });
});

test('should render form validation fields', async ({ page }) => {
  await page.goto('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');
  await expect(page.getByRole('link', { name: 'Vite logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Form Validation' })).toBeVisible();
  await expect(page.locator('#form')).toContainText('Form Validation');
  await page.getByRole('button', { name: 'Form Validation' }).click();
  await expect(page.getByRole('heading', { name: 'Form Fields Validation' })).toBeVisible();
  await expect(page.getByText('Username')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  await expect(page.getByText('Email Address')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('sdk-user');
  await expect(page.getByRole('textbox', { name: 'Username' })).toHaveValue('sdk-user');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('sdk-user@user.com');
  await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveValue(
    'sdk-user@user.com',
  );
  const requestPromise = page.waitForRequest((request) => request.url().includes('/customForm'));
  await page.getByRole('button', { name: 'Submit' }).click();
  const request = await requestPromise;
  const parsedData = JSON.parse(request.postData());
  const data = parsedData.parameters.data;
  expect(data.actionKey).toBe('submit');
  expect(data.formData).toEqual({
    ['undefined']: '',
    'user.username': '',
    'user.password': '',
    'user.email': '',
  });
});
