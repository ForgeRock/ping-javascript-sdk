import { describe, it, expect } from 'vitest';
import { detectDpop } from './dpop-detector.js';
import type { NetworkData } from '@forgerock/devtools-types';

const makeNetworkData = (overrides: Partial<NetworkData> = {}): NetworkData => ({
  _tag: 'network',
  url: 'https://auth.example.com/token',
  method: 'POST',
  status: 200,
  requestHeaders: {},
  responseHeaders: {},
  duration: 100,
  ...overrides,
});

// Create a minimal DPoP proof JWT (header.payload.signature)
function makeDpopJwt(claims: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ typ: 'dpop+jwt', alg: 'ES256' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const sig = 'fake-signature-part';
  return `${header}.${payload}.${sig}`;
}

describe('detectDpop', () => {
  it('returns null when no DPoP header present', () => {
    const data = makeNetworkData();
    expect(detectDpop(data)).toBeNull();
  });

  it('detects DPoP token type in response', () => {
    const data = makeNetworkData({
      responseBody: { token_type: 'DPoP', access_token: 'xxx' },
    });
    const result = detectDpop(data);
    expect(result).not.toBeNull();
    expect(result!.tokenType).toBe('DPoP');
  });

  it('detects use_dpop_nonce error', () => {
    const data = makeNetworkData({
      status: 400,
      responseBody: { error: 'use_dpop_nonce' },
      responseHeaders: { 'dpop-nonce': 'server-nonce-123' },
    });
    const result = detectDpop(data);
    expect(result).not.toBeNull();
    expect(result!.nonce).toBe('server-nonce-123');
  });

  it('detects DPoP proof header', () => {
    const jwt = makeDpopJwt({
      htm: 'POST',
      htu: 'https://auth.example.com/token',
      iat: 1700000000,
      jti: 'unique-id',
    });
    const data = makeNetworkData({
      requestHeaders: { dpop: jwt },
    });
    const result = detectDpop(data);
    expect(result).not.toBeNull();
    expect(result!.proofJwt).toBe(jwt);
  });

  it('captures DPoP-Nonce response header', () => {
    const jwt = makeDpopJwt({ htm: 'POST', htu: 'https://auth.example.com/token' });
    const data = makeNetworkData({
      requestHeaders: { dpop: jwt },
      responseHeaders: { 'dpop-nonce': 'nonce-abc' },
    });
    const result = detectDpop(data);
    expect(result).not.toBeNull();
    expect(result!.nonce).toBe('nonce-abc');
  });
});
