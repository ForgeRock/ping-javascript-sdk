/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenericError } from '@forgerock/sdk-types';

/**
 * Type guard to check if a value is a GenericError.
 *
 * @param value - The value to check
 * @returns True if the value is a GenericError, false otherwise
 */
export function isGenericError(value: unknown): value is GenericError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as GenericError).error === 'string' &&
    'type' in value &&
    typeof (value as GenericError).type === 'string'
  );
}
