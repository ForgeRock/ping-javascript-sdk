/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

/**
 * Helper functions for generating verifier, challenge and state strings used for
 * Proof Key for Code Exchange (PKCE).
 */

/**
 * Creates a random string.
 *
 * @param size The number for entropy (default: 32)
 */
export function createRandomString(num = 32) {
  const random = crypto.getRandomValues(new Uint8Array(num));
  return btoa(random.join('')).replace(/[^a-zA-Z0-9]+/, '');
}

/**
 * Creates a random state.
 */
export function createState() {
  return createRandomString(16);
}

/**
 * Creates a random verifier.
 */
export function createVerifier() {
  return createRandomString(32);
}

/**
 * Creates a SHA-256 hash of the verifier.
 *
 * @param verifier The verifier to hash
 */
export async function createChallenge(verifier: string) {
  // Create a SHA-256 hash of the specified string
  const uint8Array = new TextEncoder().encode(verifier);
  const arrayBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
  const charCodeArray = Array.from(new Uint8Array(arrayBuffer));

  // Create a base64 encoded, URL-friendly version of the char code array
  return btoa(String.fromCharCode(...charCodeArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
