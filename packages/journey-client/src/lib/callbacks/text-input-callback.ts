/*
 * Copyright (c) 2022 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { JourneyCallback } from './index.js';

/**
 * Represents a callback used to retrieve input from the user.
 */
export class TextInputCallback extends JourneyCallback {
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
   * Sets the callback's input value.
   */
  public setInput(input: string): void {
    this.setInputValue(input);
  }
}
