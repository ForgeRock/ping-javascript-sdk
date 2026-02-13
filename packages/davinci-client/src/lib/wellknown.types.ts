/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Re-export WellknownResponse from shared types for convenience
export type { WellknownResponse } from '@forgerock/sdk-types';

/**
 * Simplified endpoint mapping extracted from well-known response.
 * Used internally by DaVinci client for OAuth/OIDC operations.
 */
export interface Endpoints {
  authorize: string;
  issuer: string;
  introspection: string;
  tokens: string;
  userinfo: string;
}
