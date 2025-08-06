/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { GenericError } from '@forgerock/sdk-types';

export function transformError(
  error: string,
  message: string,
  status: number | string,
): GenericError {
  return {
    error,
    message,
    status,
    type: 'network_error',
  };
}
