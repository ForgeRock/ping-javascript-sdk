/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Callback, PolicyRequirement } from '@forgerock/sdk-types';
import JourneyCallback from './index.js';

/**
 * Represents a callback used to collect attributes.
 *
 * @typeparam T Maps to StringAttributeInputCallback, NumberAttributeInputCallback and
 *     BooleanAttributeInputCallback, respectively
 */
class AttributeInputCallback<T extends string | number | boolean> extends JourneyCallback {
  /**
   * @param payload The raw payload returned by OpenAM
   */
  constructor(public override payload: Callback) {
    super(payload);
  }

  /**
   * Gets the attribute name.
   */
  public getName(): string {
    return this.getOutputByName<string>('name', '');
  }

  /**
   * Gets the attribute prompt.
   */
  public getPrompt(): string {
    return this.getOutputByName<string>('prompt', '');
  }

  /**
   * Gets whether the attribute is required.
   */
  public isRequired(): boolean {
    return this.getOutputByName<boolean>('required', false);
  }

  /**
   * Gets the callback's failed policies.
   */
  public getFailedPolicies(): PolicyRequirement[] {
    const failedPoliciesJsonStrings = this.getOutputByName<string[]>('failedPolicies', []);
    try {
      return failedPoliciesJsonStrings.map((v) => JSON.parse(v)) as PolicyRequirement[];
    } catch {
      throw new Error(
        'Unable to parse "failed policies" from the ForgeRock server. The JSON within `AttributeInputCallback` was either malformed or missing.',
      );
    }
  }

  /**
   * Gets the callback's applicable policies.
   */
  public getPolicies(): Record<string, unknown> {
    return this.getOutputByName<Record<string, unknown>>('policies', {});
  }

  /**
   * Set if validating value only.
   */
  public setValidateOnly(value: boolean): void {
    this.setInputValue(value, /validateOnly/);
  }

  /**
   * Sets the attribute's value.
   */
  public setValue(value: T): void {
    this.setInputValue(value);
  }
}

export default AttributeInputCallback;
