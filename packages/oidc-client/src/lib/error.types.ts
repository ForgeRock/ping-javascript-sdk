/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export interface GenericError {
  code?: string | number;
  message: string;
  type:
    | 'argument_error'
    | 'auth_error'
    | 'internal_error'
    | 'network_error'
    | 'state_error'
    | 'unknown_error'
    | 'wellknown_error';
}
