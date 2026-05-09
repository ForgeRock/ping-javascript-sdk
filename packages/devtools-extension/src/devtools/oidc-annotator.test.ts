import { describe, it, expect } from 'vitest';
import { annotateOidc } from './oidc-annotator.js';
import type { NetworkData } from '@forgerock/devtools-types';

const makeNetworkData = (overrides: Partial<NetworkData> = {}): NetworkData => ({
  _tag: 'network',
  url: 'https://auth.example.com/token',
  method: 'POST',
  status: 200,
  requestHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
  responseHeaders: { 'content-type': 'application/json' },
  duration: 100,
  ...overrides,
});

describe('annotateOidc', () => {
  it('returns null for non-OIDC URLs', () => {
    const data = makeNetworkData({ url: 'https://example.com/api/users' });
    expect(annotateOidc(data, null)).toBeNull();
  });

  it('returns null for JS module loads with auth-like filenames', () => {
    // Vite dev server false positive — authorize.request.js is NOT an OIDC endpoint
    expect(
      annotateOidc(
        makeNetworkData({
          url: 'http://localhost:8443/@fs/packages/oidc-client/dist/src/lib/authorize.request.js',
        }),
        null,
      ),
    ).toBeNull();
    expect(
      annotateOidc(
        makeNetworkData({
          url: 'http://localhost:8443/@fs/packages/oidc-client/dist/src/lib/authorize.request.types.js',
        }),
        null,
      ),
    ).toBeNull();
    expect(
      annotateOidc(
        makeNetworkData({
          url: 'http://localhost:8443/@fs/packages/sdk-effects/oidc/dist/src/lib/authorize.effects.js',
        }),
        null,
      ),
    ).toBeNull();
  });

  it('detects discovery phase', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/.well-known/openid-configuration',
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('discovery');
  });

  it('detects authorize phase and parses query params', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/authorize?client_id=app1&state=abc123&code_challenge=xxx&code_challenge_method=S256&scope=openid&nonce=n1',
      method: 'GET',
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('authorize');
    expect(result!.clientId).toBe('app1');
    expect(result!.state).toBe('abc123');
    expect(result!.nonce).toBe('n1');
    expect(result!.pkce).toEqual({ challengeMethod: 'S256', hasVerifier: false });
  });

  it('detects token phase and parses form body', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: {
        grant_type: 'authorization_code',
        code: 'auth-code-123',
        code_verifier: 'verifier-xyz',
        client_id: 'app1',
      },
      responseBody: {
        access_token: 'at-xxx',
        refresh_token: 'rt-xxx',
        id_token: 'idt-xxx',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('token');
    expect(result!.grantType).toBe('authorization_code');
    expect(result!.clientId).toBe('app1');
    expect(result!.pkce).toEqual({ challengeMethod: 'S256', hasVerifier: true });
    expect(result!.tokens).toEqual({
      accessToken: true,
      refreshToken: true,
      idToken: true,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  });

  it('detects error in token response', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/token',
      status: 400,
      requestBody: { grant_type: 'authorization_code' },
      responseBody: {
        error: 'invalid_grant',
        error_description: 'Authorization code expired',
      },
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.error).toEqual({
      error: 'invalid_grant',
      errorDescription: 'Authorization code expired',
    });
  });

  it('uses discovered config for endpoint matching', () => {
    const config = {
      issuer: 'https://auth.example.com',
      tokenEndpoint: 'https://auth.example.com/oauth/v2/token',
    };
    const data = makeNetworkData({
      url: 'https://auth.example.com/oauth/v2/token',
      requestBody: { grant_type: 'client_credentials' },
    });
    const result = annotateOidc(data, config);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('token');
    expect(result!.grantType).toBe('client_credentials');
  });

  it('detects userinfo phase', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/userinfo' });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('userinfo');
  });

  it('detects PAR phase and response', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/par',
      requestBody: { client_id: 'app1', state: 'state1' },
      responseBody: { request_uri: 'urn:example:req-123', expires_in: 60 },
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('par');
    expect(result!.par).toEqual({ requestUri: 'urn:example:req-123', expiresIn: 60 });
  });

  it('detects revocation phase', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/revoke' });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('revocation');
  });

  it('detects introspection phase', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/introspect' });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('introspection');
  });

  it('detects end-session phase', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/end_session' });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('end-session');
  });

  it('detects jwks phase', () => {
    const data = makeNetworkData({ url: 'https://auth.example.com/jwks' });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('jwks');
  });

  it('parses form-urlencoded string body on token request', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
      requestBody: 'grant_type=authorization_code&code=abc&client_id=myapp&code_verifier=v1',
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.grantType).toBe('authorization_code');
    expect(result!.clientId).toBe('myapp');
    expect(result!.pkce).toEqual({ challengeMethod: 'S256', hasVerifier: true });
  });

  it('handles authorize with no query params', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/authorize',
      method: 'GET',
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.oidcPhase).toBe('authorize');
    expect(result!.clientId).toBeUndefined();
  });

  it('detects client_credentials grant', () => {
    const data = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: { grant_type: 'client_credentials', client_id: 'svc' },
      responseBody: { access_token: 'at', token_type: 'Bearer', expires_in: 3600 },
    });
    const result = annotateOidc(data, null);
    expect(result).not.toBeNull();
    expect(result!.grantType).toBe('client_credentials');
    expect(result!.tokens?.accessToken).toBe(true);
    expect(result!.tokens?.refreshToken).toBeUndefined();
  });
});
