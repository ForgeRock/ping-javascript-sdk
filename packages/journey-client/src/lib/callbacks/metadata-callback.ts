/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { BaseCallback } from './base-callback.js';

/**
 * Represents a callback used to deliver and collect miscellaneous data.
 */
export class MetadataCallback extends BaseCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the callback's data.
   */
  public getData<T>(): T {
    return this.getOutputByName<T>('data', {} as T);
  }
}
