/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import JourneyCallback from './index.js';
import type { Callback } from '@forgerock/sdk-types';

/**
 * Represents a callback used to collect a username.
 */
class NameCallback extends JourneyCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the callback's prompt.
   */
  public getPrompt(): string {
    return this.getOutputByName<string>('prompt', '');
  }

  /**
   * Sets the username.
   */
  public setName(name: string): void {
    this.setInputValue(name);
  }
}

export default NameCallback;
