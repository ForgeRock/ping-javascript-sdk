/*
 * @forgerock/javascript-sdk
 *
 * recovery-codes.test.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createJourneyStep } from '../journey-step.utils.js';
import JourneyRecoveryCodes from './index.js';
import {
  displayRecoveryCodesResponse,
  expectedDeviceName,
  expectedRecoveryCodes,
  otherResponse,
} from './script-text.mock.data.js';

describe('Class for managing the Display Recovery Codes node', () => {
  it('should return true if Display Recovery Codes step', () => {
    const step = createJourneyStep(displayRecoveryCodesResponse);
    const isDisplayStep = JourneyRecoveryCodes.isDisplayStep(step);
    expect(isDisplayStep).toBe(true);
  });

  it('should return false if not Display Recovery Codes step', () => {
    const step = createJourneyStep(otherResponse);
    const isDisplayStep = JourneyRecoveryCodes.isDisplayStep(step);
    expect(isDisplayStep).toBe(false);
  });

  it('should return the Recovery Codes as array of strings', () => {
    const step = createJourneyStep(displayRecoveryCodesResponse);
    const recoveryCodes = JourneyRecoveryCodes.getCodes(step);
    expect(recoveryCodes).toStrictEqual(expectedRecoveryCodes);
  });
  it('should return a display name from the getDisplayName method', () => {
    const step = createJourneyStep(displayRecoveryCodesResponse);
    const displayName = JourneyRecoveryCodes.getDeviceName(step);
    expect(displayName).toStrictEqual(expectedDeviceName);
  });
});
