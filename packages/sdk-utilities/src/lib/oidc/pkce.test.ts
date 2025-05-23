/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

/**
 * @jest-environment jsdom
 */
import { expect, describe, it } from 'vitest';
import * as crypto from 'crypto';
import { TextEncoder } from 'util';
import { createChallenge, createVerifier } from './pkce.utils.js';

declare let window: unknown;

Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (array: Buffer): Buffer => crypto.randomFillSync(array),
    subtle: {
      digest: (alg: string, array: Uint8Array): Buffer => {
        if (alg === 'SHA-256') {
          return crypto.createHash('sha256').update(array).digest();
        }
        throw new Error(`Unsupported algorithm "${alg}"`);
      },
    },
  },
});

Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
});

describe('The PKCE module', () => {
  it('creates verifiers and challenges in the correct format', async () => {
    const validChars = /[a-z0-9-_]/i;
    for (let i = 0; i < 100; i++) {
      const verifier = createVerifier();
      expect(verifier).toMatch(validChars);
      expect(verifier.length).toBeGreaterThan(89);

      const challenge = await createChallenge(verifier);
      expect(challenge).toMatch(validChars);
    }
  });
});
