import { describe, it, expect } from 'vitest';
import {
  parseWellKnownResponse,
  isWellKnownUrl,
  matchesDiscoveredEndpoint,
} from './oidc-discovery.js';

describe('isWellKnownUrl', () => {
  it('matches openid-configuration', () => {
    expect(isWellKnownUrl('https://auth.example.com/.well-known/openid-configuration')).toBe(true);
  });

  it('matches oauth-authorization-server', () => {
    expect(isWellKnownUrl('https://auth.example.com/.well-known/oauth-authorization-server')).toBe(
      true,
    );
  });

  it('does not match unrelated URLs', () => {
    expect(isWellKnownUrl('https://example.com/api/users')).toBe(false);
  });
});

describe('parseWellKnownResponse', () => {
  it('parses a valid OIDC discovery response', () => {
    const response = {
      issuer: 'https://auth.example.com',
      authorization_endpoint: 'https://auth.example.com/authorize',
      token_endpoint: 'https://auth.example.com/token',
      userinfo_endpoint: 'https://auth.example.com/userinfo',
      jwks_uri: 'https://auth.example.com/jwks',
      pushed_authorization_request_endpoint: 'https://auth.example.com/par',
    };
    const config = parseWellKnownResponse(response);
    expect(config).not.toBeNull();
    expect(config!.issuer).toBe('https://auth.example.com');
    expect(config!.authorizationEndpoint).toBe('https://auth.example.com/authorize');
    expect(config!.tokenEndpoint).toBe('https://auth.example.com/token');
    expect(config!.pushedAuthorizationRequestEndpoint).toBe('https://auth.example.com/par');
  });

  it('returns null for missing issuer', () => {
    expect(parseWellKnownResponse({ token_endpoint: 'https://example.com/token' })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(parseWellKnownResponse(null)).toBeNull();
    expect(parseWellKnownResponse('string')).toBeNull();
  });
});

describe('matchesDiscoveredEndpoint', () => {
  const config = {
    issuer: 'https://auth.example.com',
    authorizationEndpoint: 'https://auth.example.com/authorize',
    tokenEndpoint: 'https://auth.example.com/token',
    userinfoEndpoint: 'https://auth.example.com/userinfo',
    revocationEndpoint: 'https://auth.example.com/revoke',
    pushedAuthorizationRequestEndpoint: 'https://auth.example.com/par',
    jwksUri: 'https://auth.example.com/jwks',
  };

  it('matches authorization endpoint', () => {
    expect(matchesDiscoveredEndpoint('https://auth.example.com/authorize', config)).toBe(
      'authorize',
    );
  });

  it('matches token endpoint', () => {
    expect(matchesDiscoveredEndpoint('https://auth.example.com/token', config)).toBe('token');
  });

  it('matches PAR endpoint', () => {
    expect(matchesDiscoveredEndpoint('https://auth.example.com/par', config)).toBe('par');
  });

  it('strips query params for matching', () => {
    expect(
      matchesDiscoveredEndpoint('https://auth.example.com/authorize?response_type=code', config),
    ).toBe('authorize');
  });

  it('returns null for unknown URLs', () => {
    expect(matchesDiscoveredEndpoint('https://example.com/api/users', config)).toBeNull();
  });

  it('returns null when config is null', () => {
    expect(matchesDiscoveredEndpoint('https://auth.example.com/authorize', null)).toBeNull();
  });
});
