/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Both a const object (for runtime value access: SessionCheckResponseType.IdToken) and a type
// (for annotations: param: SessionCheckResponseType) are declared under the same name.
// This is the TypeScript const-object + union-type pattern — a tree-shakeable alternative to enums
// that preserves the string literals ('id_token' | 'none') in the compiled output.
export const SessionCheckResponseType = {
  IdToken: 'id_token',
  None: 'none',
} as const;

export type SessionCheckResponseType =
  (typeof SessionCheckResponseType)[keyof typeof SessionCheckResponseType];

/**
 * Both modes send id_token_hint if a stored token is available; the AS falls back to the browser
 * session cookie if it is absent. This means a session check can succeed even without stored tokens.
 *
 * - id_token mode: returns a fresh id_token with claims. subject is validated if provided.
 * - none mode: returns no claims. Success is detected by the iframe landing on the redirect URI.
 */
export interface SessionCheckOptions {
  /** The response type for the session check. Default: SessionCheckResponseType.None */
  responseType?: SessionCheckResponseType;
  /** Overrides OidcConfig.redirectUri for the session check request. */
  redirectUri?: string;
  /** If provided, the sub claim in the returned id_token must match. id_token mode only. */
  subject?: string;
  /** OAuth scope. Default: 'openid'. */
  scope?: string;
}

export interface SessionCheckSuccess {
  /** Decoded id_token payload. Present only in id_token mode. */
  claims?: Record<string, unknown>;
}
