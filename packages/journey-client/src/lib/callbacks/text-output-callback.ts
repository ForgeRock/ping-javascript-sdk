/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { BaseCallback } from './base-callback.js';

/**
 * Represents a callback used to display a message.
 */
export class TextOutputCallback extends BaseCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the message content.
   */
  public getMessage(): string {
    return this.getOutputByName<string>('message', '');
  }

  /**
   * Gets the message type.
   * Official docs state this is a number, but in practice it's a string.
   */
  public getMessageType(): string {
    return this.getOutputByName<string>('messageType', '');
  }
}
