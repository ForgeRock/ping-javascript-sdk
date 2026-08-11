/*
 * Copyright © 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { JWTPayload } from 'jose';

export type SessionCheckResponseType = 'id_token' | 'none';

/**
 * Both modes send id_token_hint if a stored token is available; the AS falls back to the browser
 * session cookie if it is absent. This means a session check can succeed even without stored tokens.
 *
 * - id_token mode: returns a fresh id_token with claims. subject is validated if provided.
 * - none mode: returns no claims. Success is detected by the iframe landing on the redirect URI.
 */
export interface SessionCheckOptions {
  /** The response type for the session check. Defaults to 'none'. */
  responseType?: SessionCheckResponseType;
  /** Overrides OidcConfig.redirectUri for the session check request. */
  redirectUri?: string;
  /** If provided, the sub claim in the returned id_token must match. id_token mode only. */
  subject?: string;
  /** OAuth scope. Default: 'openid'. */
  scope?: string;
}

export type SessionCheckSuccess = {
  responseType: SessionCheckResponseType;
  /**
   * Decoded (not signature-verified) JWT payload from the session-check id_token.
   * Claims are bound to this request via nonce and state validation.
   * Do not use these claims for primary authentication or authorization decisions.
   */
  claims?: JWTPayload;
};
