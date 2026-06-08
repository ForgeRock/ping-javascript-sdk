/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { expect, type Page } from '@playwright/test';
import { asyncEvents } from './async-events.js';

export async function loginPingAm(page: Page, username: string, password: string) {
  const { clickWithRedirect } = asyncEvents(page);
  await clickWithRedirect('Login (Background)', '**/am/XUI/**');
  await page.getByLabel('User Name').fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await clickWithRedirect('Next', 'http://localhost:8443/ping-am/**');
  await expect(page.locator('#accessToken-0')).not.toBeEmpty();
}
