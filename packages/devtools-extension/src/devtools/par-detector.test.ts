import { describe, it, expect } from 'vitest';
import { detectPar } from './par-detector.js';
import type { NetworkData } from '@forgerock/devtools-types';

const makeNetworkData = (overrides: Partial<NetworkData> = {}): NetworkData => ({
  _tag: 'network',
  url: 'https://auth.example.com/par',
  method: 'POST',
  status: 200,
  requestHeaders: {},
  responseHeaders: {},
  duration: 100,
  ...overrides,
});

describe('detectPar', () => {
  it('returns null for non-PAR endpoints', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/token' });
    expect(detectPar(data, null)).toBeNull();
  });

  it('returns null for GET requests to PAR-like URLs', () => {
    const data = makeNetworkData({ method: 'GET' });
    expect(detectPar(data, null)).toBeNull();
  });

  it('detects PAR response with request_uri', () => {
    const data = makeNetworkData({
      responseBody: { request_uri: 'urn:example:abc123', expires_in: 60 },
    });
    const result = detectPar(data, null);
    expect(result).not.toBeNull();
    expect(result!.requestUri).toBe('urn:example:abc123');
    expect(result!.expiresIn).toBe(60);
  });

  it('returns null when response lacks request_uri', () => {
    const data = makeNetworkData({
      responseBody: { error: 'invalid_request' },
    });
    expect(detectPar(data, null)).toBeNull();
  });

  it('matches discovered PAR endpoint', () => {
    const config = {
      issuer: 'https://auth.example.com',
      pushedAuthorizationRequestEndpoint: 'https://auth.example.com/oauth/par',
    };
    const data = makeNetworkData({
      url: 'https://auth.example.com/oauth/par',
      responseBody: { request_uri: 'urn:example:xyz', expires_in: 90 },
    });
    const result = detectPar(data, config);
    expect(result).not.toBeNull();
    expect(result!.requestUri).toBe('urn:example:xyz');
  });
});
