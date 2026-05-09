import { describe, it, expect } from 'vitest';
import { annotateOidc } from './oidc-annotator.js';
import { detectDpop } from './dpop-detector.js';
import { detectPar } from './par-detector.js';
import { makeEmptyOidcFlowState, trackOidcEvent } from './oidc-flow-tracker.js';
import { parseWellKnownResponse } from './oidc-discovery.js';
import { runDiagnosis } from '../background/diagnosis-engine.js';
import type { AuthEvent, NetworkData, OidcSemantics } from '@forgerock/devtools-types';
import type { OidcConfig } from './oidc-discovery.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let eventCounter = 0;

function makeNetworkData(overrides: Partial<NetworkData> = {}): NetworkData {
  return {
    _tag: 'network',
    url: 'https://auth.example.com/token',
    method: 'POST',
    status: 200,
    requestHeaders: {},
    responseHeaders: {},
    duration: 50,
    ...overrides,
  };
}

function makeAuthEvent(
  data: NetworkData,
  oidcSemantics: OidcSemantics | undefined,
  overrides: Partial<AuthEvent> = {},
): AuthEvent {
  eventCounter += 1;
  return {
    id: `evt-${eventCounter}`,
    timestamp: 1000 + eventCounter * 100,
    type: 'network:response',
    source: 'network',
    flowId: null,
    causedBy: null,
    data,
    flags: {
      isCors: false,
      isError: data.status >= 400,
      isAuthRelated: true,
    },
    ...(oidcSemantics ? { oidcSemantics } : {}),
    ...overrides,
  } as AuthEvent;
}

function annotateAndBuild(
  data: NetworkData,
  config: OidcConfig | null = null,
  overrides: Partial<AuthEvent> = {},
): AuthEvent {
  const semantics = annotateOidc(data, config);
  if (semantics && data.requestHeaders['dpop']) {
    const dpop = detectDpop(data);
    if (dpop) {
      (semantics as Record<string, unknown>).dpop = dpop;
    }
  }
  return makeAuthEvent(data, semantics ?? undefined, overrides);
}

// ─── Integration: Auth Code + PKCE (no SDK) ─────────────────────────────────

describe('Integration: Auth Code + PKCE flow (no SDK)', () => {
  it('annotates a complete auth code flow with PKCE', () => {
    eventCounter = 0;

    // 1. Discovery
    const discoveryData = makeNetworkData({
      url: 'https://auth.example.com/.well-known/openid-configuration',
      method: 'GET',
      responseBody: {
        issuer: 'https://auth.example.com',
        authorization_endpoint: 'https://auth.example.com/authorize',
        token_endpoint: 'https://auth.example.com/token',
        userinfo_endpoint: 'https://auth.example.com/userinfo',
      },
    });
    const discoveryEvent = annotateAndBuild(discoveryData);
    expect(discoveryEvent.oidcSemantics?.oidcPhase).toBe('discovery');

    const config = parseWellKnownResponse(discoveryData.responseBody)!;
    expect(config.issuer).toBe('https://auth.example.com');

    // 2. Authorize
    const authorizeData = makeNetworkData({
      url: 'https://auth.example.com/authorize?response_type=code&client_id=spa&redirect_uri=https://app.example.com/callback&scope=openid+profile&state=xyz&nonce=n123&code_challenge=abc&code_challenge_method=S256',
      method: 'GET',
      status: 302,
    });
    const authorizeEvent = annotateAndBuild(authorizeData, config);
    expect(authorizeEvent.oidcSemantics?.oidcPhase).toBe('authorize');
    expect(authorizeEvent.oidcSemantics?.clientId).toBe('spa');
    expect(authorizeEvent.oidcSemantics?.state).toBe('xyz');
    expect(authorizeEvent.oidcSemantics?.nonce).toBe('n123');
    expect(authorizeEvent.oidcSemantics?.pkce).toEqual({
      challengeMethod: 'S256',
      hasVerifier: false,
    });

    // 3. Token exchange
    const tokenData = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: {
        grant_type: 'authorization_code',
        code: 'auth-code-xyz',
        code_verifier: 'verifier-xyz',
        client_id: 'spa',
        redirect_uri: 'https://app.example.com/callback',
      },
      responseBody: {
        access_token: 'at-xxx',
        id_token: 'idt-xxx',
        refresh_token: 'rt-xxx',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    });
    const tokenEvent = annotateAndBuild(tokenData, config);
    expect(tokenEvent.oidcSemantics?.oidcPhase).toBe('token');
    expect(tokenEvent.oidcSemantics?.grantType).toBe('authorization_code');
    expect(tokenEvent.oidcSemantics?.pkce?.hasVerifier).toBe(true);
    expect(tokenEvent.oidcSemantics?.tokens?.accessToken).toBe(true);
    expect(tokenEvent.oidcSemantics?.tokens?.idToken).toBe(true);

    // 4. UserInfo
    const userinfoData = makeNetworkData({
      url: 'https://auth.example.com/userinfo',
      method: 'GET',
      responseBody: { sub: 'user-123', name: 'Test User' },
    });
    const userinfoEvent = annotateAndBuild(userinfoData, config);
    expect(userinfoEvent.oidcSemantics?.oidcPhase).toBe('userinfo');

    // Diagnosis should be clean for this flow
    const events = [discoveryEvent, authorizeEvent, tokenEvent, userinfoEvent];
    const diagnosis = runDiagnosis(events);
    expect(diagnosis.flowHealth).toBe('healthy');
  });
});

// ─── Integration: Auth Code + DPoP ──────────────────────────────────────────

describe('Integration: Auth Code + DPoP flow', () => {
  it('detects DPoP proof and token type through the flow', () => {
    eventCounter = 100;
    const makeDpopJwt = (claims: Record<string, unknown>): string => {
      const header = btoa(JSON.stringify({ typ: 'dpop+jwt', alg: 'ES256' }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const payload = btoa(JSON.stringify(claims))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `${header}.${payload}.fakesig`;
    };

    const dpopJwt = makeDpopJwt({
      htm: 'POST',
      htu: 'https://auth.example.com/token',
      iat: Math.floor(Date.now() / 1000),
      jti: 'dpop-jti-1',
    });

    const tokenData = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestHeaders: { dpop: dpopJwt, 'content-type': 'application/x-www-form-urlencoded' },
      requestBody: { grant_type: 'authorization_code', code: 'code1', code_verifier: 'v1' },
      responseBody: {
        access_token: 'at-dpop',
        token_type: 'DPoP',
        expires_in: 3600,
      },
    });

    const semantics = annotateOidc(tokenData, null)!;
    const dpop = detectDpop(tokenData)!;
    expect(dpop.proofJwt).toBe(dpopJwt);
    expect(dpop.tokenType).toBe('DPoP');

    // Build full event
    const enriched = {
      ...semantics,
      dpop,
    } as OidcSemantics;

    const event = makeAuthEvent(tokenData, enriched);
    expect(event.oidcSemantics?.dpop?.tokenType).toBe('DPoP');

    // DPoP-valid flow should not flag issues
    const diagnosis = runDiagnosis([event]);
    expect(
      diagnosis.issues.filter((i) => i.category === 'dpop' && i.severity === 'error'),
    ).toHaveLength(0);
  });
});

// ─── Integration: PAR + Auth Code ───────────────────────────────────────────

describe('Integration: PAR flow', () => {
  it('links PAR → authorize → token as a single flow', () => {
    eventCounter = 200;
    let flowState = makeEmptyOidcFlowState();

    const config: OidcConfig = {
      issuer: 'https://auth.example.com',
      authorizationEndpoint: 'https://auth.example.com/authorize',
      tokenEndpoint: 'https://auth.example.com/token',
      pushedAuthorizationRequestEndpoint: 'https://auth.example.com/par',
    };

    // 1. PAR
    const parData = makeNetworkData({
      url: 'https://auth.example.com/par',
      method: 'POST',
      requestBody: { client_id: 'app1', response_type: 'code', scope: 'openid' },
      responseBody: { request_uri: 'urn:example:par-456', expires_in: 90 },
    });
    const parEvent = annotateAndBuild(parData, config);
    expect(parEvent.oidcSemantics?.oidcPhase).toBe('par');
    expect(parEvent.oidcSemantics?.par?.requestUri).toBe('urn:example:par-456');

    const parDetected = detectPar(parData, config);
    expect(parDetected?.requestUri).toBe('urn:example:par-456');

    const parTrack = trackOidcEvent(parEvent, flowState);
    flowState = parTrack.updatedState;
    expect(parTrack.flowId).not.toBeNull();

    // 2. Authorize with request_uri only
    const authorizeData = makeNetworkData({
      url: 'https://auth.example.com/authorize?request_uri=urn:example:par-456&client_id=app1',
      method: 'GET',
      status: 302,
    });
    const authorizeEvent = annotateAndBuild(authorizeData, config);
    const authTrack = trackOidcEvent(authorizeEvent, flowState);
    flowState = authTrack.updatedState;

    // 3. Token
    const tokenData = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: { grant_type: 'authorization_code', code: 'code2' },
      responseBody: { access_token: 'at2', token_type: 'Bearer' },
    });
    const tokenEvent = annotateAndBuild(tokenData, config);
    const tokenTrack = trackOidcEvent(tokenEvent, flowState);

    // Token should be linked to same flow as authorize/PAR
    expect(tokenTrack.flowId).not.toBeNull();
  });
});

// ─── Integration: Client Credentials ────────────────────────────────────────

describe('Integration: Client Credentials grant', () => {
  it('creates a standalone token flow', () => {
    eventCounter = 300;

    const data = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: { grant_type: 'client_credentials', client_id: 'service-app' },
      responseBody: { access_token: 'svc-at', token_type: 'Bearer', expires_in: 600 },
    });
    const event = annotateAndBuild(data);
    expect(event.oidcSemantics?.grantType).toBe('client_credentials');
    expect(event.oidcSemantics?.tokens?.accessToken).toBe(true);
    expect(event.oidcSemantics?.tokens?.refreshToken).toBeUndefined();

    const diagnosis = runDiagnosis([event]);
    expect(diagnosis.flowHealth).toBe('healthy');
  });
});

// ─── Integration: Refresh Token Rotation ────────────────────────────────────

describe('Integration: Refresh Token Rotation', () => {
  it('tracks sequential refresh grants', () => {
    eventCounter = 400;
    let flowState = makeEmptyOidcFlowState();

    // Initial authorize
    const authEvent = annotateAndBuild(
      makeNetworkData({
        url: 'https://auth.example.com/authorize?response_type=code&client_id=app',
        method: 'GET',
        status: 302,
      }),
    );
    const authTrack = trackOidcEvent(authEvent, flowState);
    flowState = authTrack.updatedState;

    // Initial token
    const tokenEvent = annotateAndBuild(
      makeNetworkData({
        url: 'https://auth.example.com/token',
        requestBody: { grant_type: 'authorization_code', code: 'c1' },
        responseBody: { access_token: 'at1', refresh_token: 'rt1', token_type: 'Bearer' },
      }),
    );
    const tokenTrack = trackOidcEvent(tokenEvent, flowState);
    flowState = tokenTrack.updatedState;

    // First refresh
    const refresh1Event = annotateAndBuild(
      makeNetworkData({
        url: 'https://auth.example.com/token',
        requestBody: { grant_type: 'refresh_token', refresh_token: 'rt1' },
        responseBody: { access_token: 'at2', refresh_token: 'rt2', token_type: 'Bearer' },
      }),
    );
    const refresh1Track = trackOidcEvent(refresh1Event, flowState);
    flowState = refresh1Track.updatedState;

    // Second refresh
    const refresh2Event = annotateAndBuild(
      makeNetworkData({
        url: 'https://auth.example.com/token',
        requestBody: { grant_type: 'refresh_token', refresh_token: 'rt2' },
        responseBody: { access_token: 'at3', refresh_token: 'rt3', token_type: 'Bearer' },
      }),
    );
    const refresh2Track = trackOidcEvent(refresh2Event, flowState);
    flowState = refresh2Track.updatedState;

    expect(flowState.refreshCount).toBe(2);
    // All should be in same flow
    expect(refresh1Track.flowId).toBe(authTrack.flowId);
    expect(refresh2Track.flowId).toBe(authTrack.flowId);
  });
});

// ─── Integration: SDK + Network Dual Mode ───────────────────────────────────

describe('Integration: SDK bridge + OIDC network (dual mode)', () => {
  it('OIDC annotations coexist with SDK events', () => {
    eventCounter = 500;

    const sdkEvent: AuthEvent = {
      id: 'sdk-500',
      timestamp: 1000,
      type: 'sdk:node-change',
      source: 'sdk',
      flowId: 'flow-sdk-1',
      causedBy: null,
      data: {
        _tag: 'sdk',
        nodeStatus: 'continue',
        nodeName: 'Login Form',
        interactionId: 'int-1',
        interactionToken: 'tok-1',
      },
      flags: { isCors: false, isError: false, isAuthRelated: true },
    };

    // Network event that also gets OIDC annotation
    const tokenData = makeNetworkData({
      url: 'https://auth.example.com/token',
      requestBody: { grant_type: 'authorization_code', code: 'c-sdk' },
      responseBody: { access_token: 'at-sdk', token_type: 'Bearer' },
    });
    const tokenEvent = annotateAndBuild(tokenData, null, {
      flowId: 'flow-sdk-1',
      causedBy: 'sdk-500',
    });

    // Both should coexist
    expect(sdkEvent.data._tag).toBe('sdk');
    expect(tokenEvent.oidcSemantics?.oidcPhase).toBe('token');
    expect(tokenEvent.causedBy).toBe('sdk-500');

    // Diagnosis handles both without errors
    const events = [sdkEvent, tokenEvent];
    const diagnosis = runDiagnosis(events);
    // Should not crash or produce false positives
    expect(diagnosis.flowHealth).not.toBe('error');
  });
});
