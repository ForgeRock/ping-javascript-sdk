/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export interface AuthorizeSuccessResponse {
  code: string;
  state: string;
  redirectUrl?: string; // Optional, used when the response is from a P1 server
}

export interface AuthorizeErrorResponse {
  error: string;
  error_description: string;
  redirectUrl?: string; // URL to redirect the user to for re-authorization
  type: 'auth_error' | 'wellknown_error' | 'network_error' | 'unknown_error';
}
