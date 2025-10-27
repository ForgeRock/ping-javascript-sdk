/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback } from '@forgerock/sdk-types';

import { BaseCallback } from './base-callback.js';

interface IdPValue {
  provider: string;
  uiConfig: {
    [key: string]: string;
  };
}

/**
 * Represents a callback used to collect an answer to a choice.
 */
export class SelectIdPCallback extends BaseCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the available providers.
   */
  public getProviders(): IdPValue[] {
    return this.getOutputByName<IdPValue[]>('providers', []);
  }

  /**
   * Sets the provider by name.
   */
  public setProvider(value: string): void {
    const item = this.getProviders().find((item) => item.provider === value);
    if (!item) {
      throw new Error(`"${value}" is not a valid choice`);
    }
    this.setInputValue(item.provider);
  }
}

export type { IdPValue };
