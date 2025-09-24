/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import JourneyCallback from './index.js';
import type { Callback } from '@forgerock/sdk-types';

/**
 * Represents a callback used to collect an answer to a choice.
 */
class RedirectCallback extends JourneyCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the redirect URL.
   */
  public getRedirectUrl(): string {
    return this.getOutputByName<string>('redirectUrl', '');
  }
}

export default RedirectCallback;
