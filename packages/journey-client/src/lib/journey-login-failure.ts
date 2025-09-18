/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Step, AuthResponse, FailureDetail } from '@forgerock/sdk-types';
import { StepType } from '@forgerock/sdk-types';
import FRPolicy from './fr-policy/index.js';
import type { MessageCreator, ProcessedPropertyError } from './fr-policy/interfaces.js';

class JourneyLoginFailure implements AuthResponse {
  /**
   * The type of step.
   */
  public readonly type = StepType.LoginFailure;

  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public payload: Step) {}

  /**
   * Gets the error code.
   */
  public getCode(): number {
    return Number(this.payload.code);
  }

  /**
   * Gets the failure details.
   */
  public getDetail(): FailureDetail | undefined {
    return this.payload.detail;
  }

  /**
   * Gets the failure message.
   */
  public getMessage(): string | undefined {
    return this.payload.message;
  }

  /**
   * Gets processed failure message.
   */
  public getProcessedMessage(messageCreator?: MessageCreator): ProcessedPropertyError[] {
    return FRPolicy.parseErrors(this.payload, messageCreator);
  }

  /**
   * Gets the failure reason.
   */
  public getReason(): string | undefined {
    return this.payload.reason;
  }
}

export default JourneyLoginFailure;
