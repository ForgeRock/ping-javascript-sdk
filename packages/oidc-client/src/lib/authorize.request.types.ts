/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-types';

export type BuildAuthorizationData = [string, GetAuthorizationUrlOptions];
export type OptionalAuthorizeOptions = Partial<GetAuthorizationUrlOptions>;
export interface AuthorizeErrorResponse {
  id?: string;
  code?: string;
  message?: string;
  details?: [
    {
      code: string;
      message: string;
    },
  ];
}

export interface AuthorizeSuccessResponse {
  _links?: {
    [key: string]: {
      href: string;
    };
  };
  _embedded?: {
    [key: string]: unknown;
  };
  id?: string;
  environment?: {
    id: string;
  };
  session?: {
    id: string;
  };
  resumeUrl?: string;
  status?: string;
  createdAt?: string;
  expiresAt?: string;
  authorizeResponse?: {
    code: string;
    state: string;
  };
}

export interface AuthorizationSuccess {
  code: string;
  state: string;
}

export interface AuthorizationError {
  error: string;
  error_description: string;
  redirectUrl?: string; // URL to redirect the user to for re-authorization
  type: 'auth_error' | 'argument_error' | 'network_error' | 'unknown_error' | 'wellknown_error';
}
