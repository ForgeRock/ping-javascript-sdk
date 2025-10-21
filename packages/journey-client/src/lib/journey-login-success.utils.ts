/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { StepType } from '@forgerock/sdk-types';

import type { Step, AuthResponse } from '@forgerock/sdk-types';

type JourneyLoginSuccess = AuthResponse & {
  type: StepType.LoginSuccess;
  payload: Step;
  getRealm: () => string | undefined;
  getSessionToken: () => string | undefined;
  getSuccessUrl: () => string | undefined;
};

function getRealm(payload: Step): string | undefined {
  return payload.realm;
}

function getSessionToken(payload: Step): string | undefined {
  return payload.tokenId;
}

function getSuccessUrl(payload: Step): string | undefined {
  return payload.successUrl;
}

function createJourneyLoginSuccess(payload: Step): JourneyLoginSuccess {
  return {
    payload,
    type: StepType.LoginSuccess,
    getRealm: () => getRealm(payload),
    getSessionToken: () => getSessionToken(payload),
    getSuccessUrl: () => getSuccessUrl(payload),
  };
}

export {
  createJourneyLoginSuccess,
  getRealm,
  getSessionToken,
  getSuccessUrl,
  type JourneyLoginSuccess,
};
