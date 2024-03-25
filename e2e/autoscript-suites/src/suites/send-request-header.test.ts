/*
 * @forgerock/javascript-sdk
 *
 * send-request-header.test.ts
 *
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { test, expect } from '@playwright/test';
import { setupAndGo } from '../utilities/setup-and-go';

// eslint-disable-next-line
test(`should verifies x-requested-platform header is present in the request`, async ({
  page,
  browserName,
}) => {
  const { networkArray } = await setupAndGo(page, browserName, 'authn-central-login/');
  expect(networkArray.includes('x-requested-platform')).toBe(true);
});
