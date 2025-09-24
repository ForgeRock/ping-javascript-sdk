/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { Step, AuthResponse, FailureDetail } from '@forgerock/sdk-types';
import { StepType } from '@forgerock/sdk-types';
import JourneyPolicy from './journey-policy/index.js';
import type { MessageCreator, ProcessedPropertyError } from './journey-policy/interfaces.js';

type JourneyLoginFailure = AuthResponse & {
  payload: Step;
  getCode: () => number;
  getDetail: () => FailureDetail | undefined;
  getMessage: () => string | undefined;
  getProcessedMessage: (messageCreator?: MessageCreator) => ProcessedPropertyError[];
  getReason: () => string | undefined;
};

function getCode(payload: Step): number {
  return Number(payload.code);
}

function getDetail(payload: Step): FailureDetail | undefined {
  return payload.detail;
}

function getMessage(payload: Step): string | undefined {
  return payload.message;
}

function getProcessedMessage(
  payload: Step,
  messageCreator?: MessageCreator,
): ProcessedPropertyError[] {
  return JourneyPolicy.parseErrors(payload, messageCreator);
}

function getReason(payload: Step): string | undefined {
  return payload.reason;
}

function createJourneyLoginFailure(payload: Step): JourneyLoginFailure {
  return {
    payload,
    type: StepType.LoginFailure,
    getCode: () => getCode(payload),
    getDetail: () => getDetail(payload),
    getMessage: () => getMessage(payload),
    getProcessedMessage: (messageCreator?: MessageCreator) =>
      getProcessedMessage(payload, messageCreator),
    getReason: () => getReason(payload),
  };
}

export { createJourneyLoginFailure, JourneyLoginFailure };
