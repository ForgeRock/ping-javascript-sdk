/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export interface GenericError {
  code?: string | number;
  error: string;
  message?: string;
  status?: number | string;
  type:
    | 'argument_error'
    | 'auth_error'
    | 'davinci_error'
    | 'fido_error'
    | 'exchange_error'
    | 'internal_error'
    | 'network_error'
    | 'parse_error'
    | 'state_error'
    | 'unknown_error'
    | 'wellknown_error';
}
