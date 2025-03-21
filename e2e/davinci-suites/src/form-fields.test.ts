import { expect, test } from '@playwright/test';

test('Should render form fields', async ({ page }) => {
  await page.goto('http://localhost:5829/?clientid=60de77d5-dd2c-41ef-8c40-f8bb2381a359');
  await page.locator('body').click();
  await page.goto('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');
  await expect(page.getByRole('heading', { name: 'Select Test Form' })).toBeVisible();
  await page.getByRole('button', { name: 'Form Fields' }).click();
  await page.getByRole('textbox', { name: 'Text Input Label' }).click();
  await page.getByRole('textbox', { name: 'Text Input Label' }).fill('The input');
  await expect(page.getByText('Dropdown List Label')).toBeVisible();
  await page.locator('#dropdown-field-key').selectOption('dropdown-option1-value');
  await page.locator('#dropdown-field-key').selectOption('dropdown-option2-value');
  await expect(page.locator('#dropdown-field-key')).toHaveValue('dropdown-option2-value');
  await page.getByRole('radio', { name: 'option1 label' }).check();

  await page.getByRole('radio', { name: 'option2 label' }).check();
  await page.getByRole('radio', { name: 'option3 label' }).check();
  await page.getByRole('radio', { name: 'option2 label' }).check();

  await page.keyboard.down('Meta');
  await page.selectOption('.select-option-combobox', [{ label: 'option1 label' }]);
  await page.selectOption('.select-option-combobox', [{ label: 'option2 label' }]);
  await page.keyboard.up('Meta');

  await expect(page.getByRole('button', { name: 'Flow Button' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Flow Link' })).toBeVisible();

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('customForm') && request.method() === 'POST',
  );

  await page.getByRole('button', { name: 'Submit' }).click();
  const request = await requestPromise;

  const parsedData = JSON.parse(request.postData());
  const data = parsedData.parameters.data;
  expect(data.actionKey).toBe('submit');
  expect(data.formData).toEqual({
    'combobox-field-key': ['option1 value', 'option2 value'],
    'checkbox-field-key': [],
    'dropdown-field-key': 'dropdown-option2-value',
    'radio-group-key': 'option2 value',
    'text-input-key': 'The input',
  });
});

test('should render form validation fields', async ({ page }) => {
  await page.goto('http://localhost:5829/?clientId=60de77d5-dd2c-41ef-8c40-f8bb2381a359');
  await expect(page.getByRole('link', { name: 'Vite logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Form Validation' })).toBeVisible();
  await expect(page.locator('#form')).toContainText('Form Validation');
  await page.getByRole('button', { name: 'Form Validation' }).click();
  await expect(page.getByRole('heading', { name: 'Form Fields Validation' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Username' }).fill('sdk-user');
  await expect(page.getByRole('textbox', { name: 'Username' })).toHaveValue('sdk-user');

  const password = page.getByRole('textbox', { name: 'Password' });
  await password.type('password');
  await expect(password).toHaveValue('password');

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
    'user.username': 'sdk-user',
    'user.password': 'password',
    'user.email': 'sdk-user@user.com',
  });
});
