import type { NetworkData, OidcSemantics } from '@forgerock/devtools-types';
import { extractJwt } from '../shared/jwt-utils.js';

type DpopInfo = {
  proofJwt?: string;
  tokenType?: string;
  nonce?: string;
};

export function detectDpop(data: NetworkData): NonNullable<OidcSemantics['dpop']> | null {
  const dpopHeader = data.requestHeaders['dpop'];
  if (!dpopHeader) {
    // Check response for DPoP token type
    if (typeof data.responseBody === 'object' && data.responseBody !== null) {
      const body = data.responseBody as Record<string, unknown>;
      if (typeof body['token_type'] === 'string' && body['token_type'].toLowerCase() === 'dpop') {
        return { tokenType: 'DPoP' };
      }
    }

    // Check for use_dpop_nonce error
    if (
      data.status === 400 &&
      typeof data.responseBody === 'object' &&
      data.responseBody !== null
    ) {
      const body = data.responseBody as Record<string, unknown>;
      if (body['error'] === 'use_dpop_nonce') {
        const nonce = data.responseHeaders['dpop-nonce'];
        return { nonce };
      }
    }

    return null;
  }

  const result: DpopInfo = {};

  const proofToken = extractJwt(dpopHeader);
  if (proofToken) {
    result.proofJwt = proofToken;
  }

  // Check DPoP-Nonce response header
  const dpopNonce = data.responseHeaders['dpop-nonce'];
  if (dpopNonce) {
    result.nonce = dpopNonce;
  }

  // Check token_type in response
  if (typeof data.responseBody === 'object' && data.responseBody !== null) {
    const body = data.responseBody as Record<string, unknown>;
    if (typeof body['token_type'] === 'string') {
      result.tokenType = body['token_type'];
    }
  }

  return result;
}
