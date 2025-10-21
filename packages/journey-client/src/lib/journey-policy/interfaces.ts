/*
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { FailedPolicyRequirement } from '@forgerock/sdk-types';

export interface MessageCreator {
  [key: string]: (propertyName: string, params?: { [key: string]: unknown }) => string;
}

export interface ProcessedPropertyError {
  detail: FailedPolicyRequirement;
  messages: string[];
}
