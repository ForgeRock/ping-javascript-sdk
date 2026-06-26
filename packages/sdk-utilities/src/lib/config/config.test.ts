/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import * as Either from 'effect/Either';
import {
  parseToOidcConfig,
  parseToJourneyConfig,
  parseToDavinciConfig,
  collectErrors,
  parseOidcSection,
  parseUnifiedSdkConfig,
} from './config.utils.js';
import { makeOidcConfig, makeJourneyConfig, makeDavinciConfig } from './config.effects.js';

const minimalOidc = {
  clientId: 'my-client',
  discoveryEndpoint: 'https://example.com/.well-known/openid-configuration',
  scopes: ['openid', 'profile'],
  redirectUri: 'https://app.example.com/callback',
};

const fullConfig = {
  timeout: 30000,
  log: 'DEBUG',
  journey: {
    serverUrl: 'https://example.com/am',
    realm: 'alpha',
    cookieName: 'iPlanetDirectoryPro',
  },
  oidc: {
    ...minimalOidc,
    signOutRedirectUri: 'https://app.example.com/logout',
    refreshThreshold: 60,
    loginHint: 'user@example.com',
    nonce: 'custom-nonce',
    display: 'page',
    prompt: 'login',
    uiLocales: 'en-US',
    acrValues: 'Level3',
    additionalParameters: { max_age: '3600' },
    openId: { deviceAuthorizationEndpoint: 'https://example.com/device/code' },
  },
};

const journeyOnlyConfig = {
  journey: {
    serverUrl: 'https://example.com/am',
    realm: 'alpha',
  },
  oidc: {
    discoveryEndpoint: 'https://example.com/.well-known/openid-configuration',
  },
};

describe('parseUnifiedSdkConfig', () => {
  it('parseUnifiedSdkConfig_ValidFullConfig_ReturnsSuccess', () => {
    expect(Either.isRight(parseUnifiedSdkConfig(fullConfig))).toBe(true);
  });

  it('parseUnifiedSdkConfig_JourneyOnlyConfig_ReturnsSuccess', () => {
    expect(Either.isRight(parseUnifiedSdkConfig(journeyOnlyConfig))).toBe(true);
  });

  it('parseUnifiedSdkConfig_NoOidcOrJourneySection_ReturnsSuccess', () => {
    expect(Either.isRight(parseUnifiedSdkConfig({ timeout: 5000 }))).toBe(true);
  });

  it('parseUnifiedSdkConfig_UnknownTopLevelField_Ignored', () => {
    expect(Either.isRight(parseUnifiedSdkConfig({ timeout: 5000, surprise: 'kept' }))).toBe(true);
  });

  it('parseUnifiedSdkConfig_TimeoutNotNumber_ReturnsTypeError', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseUnifiedSdkConfig({ ...fullConfig, timeout: 'thirty' })),
    );
    expect(errors.some((e) => e.field === 'timeout')).toBe(true);
  });

  it('parseUnifiedSdkConfig_JourneyMissingServerUrl_ReturnsError', () => {
    const errors = Either.getOrThrow(
      Either.flip(
        parseUnifiedSdkConfig({
          journey: { realm: 'alpha' },
          oidc: { discoveryEndpoint: 'https://example.com/.well-known/openid-configuration' },
        }),
      ),
    );
    expect(errors.some((e) => e.field === 'journey.serverUrl')).toBe(true);
  });

  it('parseUnifiedSdkConfig_InvalidOidcNested_PropagatesErrors', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseUnifiedSdkConfig({ ...fullConfig, oidc: { ...minimalOidc, clientId: 42 } })),
    );
    expect(errors.some((e) => e.field === 'oidc.clientId')).toBe(true);
  });

  it('parseUnifiedSdkConfig_MultipleErrors_AllAccumulated', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseUnifiedSdkConfig({ timeout: 'thirty', oidc: { scopes: 'not-an-array' } })),
    );
    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(errors.some((e) => e.field === 'timeout')).toBe(true);
    expect(errors.some((e) => e.field === 'oidc.discoveryEndpoint')).toBe(true);
  });
});

describe('parseToOidcConfig', () => {
  it('parseToOidcConfig_NoOidcBlock_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToOidcConfig({ journey: { serverUrl: 'https://example.com/am' } })),
    );
    expect(errors.some((e) => e.field === 'oidc')).toBe(true);
  });

  it('parseToOidcConfig_MinimalConfig_MapsRequiredFields', () => {
    const data = Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc }));
    expect(data.clientId).toBe('my-client');
    expect(data.redirectUri).toBe('https://app.example.com/callback');
    expect(data.scope).toBe('openid profile');
    expect(data.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('parseToOidcConfig_ScopesJoinedWithSpace', () => {
    const data = Either.getOrThrow(
      parseToOidcConfig({ oidc: { ...minimalOidc, scopes: ['openid', 'email'] } }),
    );
    expect(data.scope).toBe('openid email');
  });

  it('parseToOidcConfig_RefreshThresholdConvertedToMs', () => {
    const data = Either.getOrThrow(
      parseToOidcConfig({ oidc: { ...minimalOidc, refreshThreshold: 60 } }),
    );
    expect(data.oauthThreshold).toBe(60000);
  });

  it('parseToOidcConfig_NoRefreshThreshold_OauthThresholdAbsent', () => {
    expect(
      Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc })).oauthThreshold,
    ).toBeUndefined();
  });

  it('parseToOidcConfig_RealmMappedToRealmPath', () => {
    const data = Either.getOrThrow(
      parseToOidcConfig({
        journey: { serverUrl: 'https://example.com/am', realm: 'alpha' },
        oidc: minimalOidc,
      }),
    );
    expect(data.realmPath).toBe('alpha');
  });

  it('parseToOidcConfig_NoRealm_RealmPathAbsent', () => {
    expect(Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc })).realmPath).toBeUndefined();
  });

  it('parseToOidcConfig_TimeoutPassedToServerConfig', () => {
    const data = Either.getOrThrow(parseToOidcConfig({ timeout: 5000, oidc: minimalOidc }));
    expect(data.serverConfig.timeout).toBe(5000);
  });

  it('parseToOidcConfig_NoTimeout_TimeoutAbsentInServerConfig', () => {
    expect(
      Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc })).serverConfig.timeout,
    ).toBeUndefined();
  });

  it('parseToOidcConfig_AuthorizeParamsMapped', () => {
    const data = Either.getOrThrow(
      parseToOidcConfig({
        oidc: {
          ...minimalOidc,
          loginHint: 'user@example.com',
          nonce: 'custom-nonce',
          display: 'page',
          prompt: 'login',
          uiLocales: 'en-US',
          acrValues: 'Level3',
          additionalParameters: { max_age: '3600' },
        },
      }),
    );
    expect(data.loginHint).toBe('user@example.com');
    expect(data.nonce).toBe('custom-nonce');
    expect(data.display).toBe('page');
    expect(data.prompt).toBe('login');
    expect(data.uiLocales).toBe('en-US');
    expect(data.acrValues).toBe('Level3');
    expect(data.query).toEqual({ max_age: '3600' });
  });

  it('parseToOidcConfig_EmptyScopes_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToOidcConfig({ oidc: { ...minimalOidc, scopes: [] } })),
    );
    expect(errors.some((e) => e.field === 'oidc.scopes')).toBe(true);
  });

  it('parseToOidcConfig_NoAuthorizeParams_AllAbsent', () => {
    const data = Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc }));
    expect(data.loginHint).toBeUndefined();
    expect(data.nonce).toBeUndefined();
    expect(data.query).toBeUndefined();
  });

  it('parseToOidcConfig_OidcMissingDiscoveryEndpoint_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(
        parseToOidcConfig({ oidc: { clientId: 'x', redirectUri: 'x', scopes: ['openid'] } }),
      ),
    );
    expect(errors.some((e) => e.field === 'oidc.discoveryEndpoint')).toBe(true);
  });

  it('parseToOidcConfig_NullInput_ReturnsFailure', () => {
    expect(Either.isLeft(parseToOidcConfig(null))).toBe(true);
  });
});

describe('parseToJourneyConfig', () => {
  it('parseToJourneyConfig_NoOidcBlock_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToJourneyConfig({ journey: { serverUrl: 'https://example.com/am' } })),
    );
    expect(errors.some((e) => e.field === 'oidc')).toBe(true);
  });

  it('parseToJourneyConfig_MinimalConfig_MapsWellknown', () => {
    const data = Either.getOrThrow(parseToJourneyConfig({ oidc: minimalOidc }));
    expect(data.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('parseToJourneyConfig_JourneyOnlyConfig_MapsWellknown', () => {
    const data = Either.getOrThrow(parseToJourneyConfig(journeyOnlyConfig));
    expect(data.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('parseToJourneyConfig_RealmMappedToRealmPath', () => {
    const data = Either.getOrThrow(
      parseToJourneyConfig({
        journey: { serverUrl: 'https://example.com/am', realm: 'beta' },
        oidc: minimalOidc,
      }),
    );
    expect(data.realmPath).toBe('beta');
  });

  it('parseToJourneyConfig_NoRealm_RealmPathAbsent', () => {
    expect(
      Either.getOrThrow(parseToJourneyConfig({ oidc: minimalOidc })).realmPath,
    ).toBeUndefined();
  });

  it('parseToJourneyConfig_TimeoutPassedToServerConfig', () => {
    const data = Either.getOrThrow(parseToJourneyConfig({ timeout: 10000, oidc: minimalOidc }));
    expect(data.serverConfig.timeout).toBe(10000);
  });

  it('parseToJourneyConfig_OidcFieldsNotLeakedToResult', () => {
    const data = Either.getOrThrow(parseToJourneyConfig(fullConfig)) as unknown as Record<
      string,
      unknown
    >;
    expect(data['clientId']).toBeUndefined();
    expect(data['scope']).toBeUndefined();
    expect(data['redirectUri']).toBeUndefined();
  });

  it('parseToJourneyConfig_OidcMissingDiscoveryEndpoint_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToJourneyConfig({ oidc: { realm: 'alpha' } })),
    );
    expect(errors.some((e) => e.field === 'oidc.discoveryEndpoint')).toBe(true);
  });

  it('parseToJourneyConfig_NullInput_ReturnsFailure', () => {
    expect(Either.isLeft(parseToJourneyConfig(null))).toBe(true);
  });
});

describe('parseToDavinciConfig', () => {
  it('parseToDavinciConfig_NoOidcBlock_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToDavinciConfig({ journey: { serverUrl: 'https://example.com/am' } })),
    );
    expect(errors.some((e) => e.field === 'oidc')).toBe(true);
  });

  it('parseToDavinciConfig_MinimalConfig_MapsRequiredFields', () => {
    const data = Either.getOrThrow(parseToDavinciConfig({ oidc: minimalOidc }));
    expect(data.clientId).toBe('my-client');
    expect(data.redirectUri).toBe('https://app.example.com/callback');
    expect(data.scope).toBe('openid profile');
    expect(data.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('parseToDavinciConfig_ScopesJoinedWithSpace', () => {
    const data = Either.getOrThrow(
      parseToDavinciConfig({ oidc: { ...minimalOidc, scopes: ['openid', 'email'] } }),
    );
    expect(data.scope).toBe('openid email');
  });

  it('parseToDavinciConfig_RefreshThresholdConvertedToMs', () => {
    const data = Either.getOrThrow(
      parseToDavinciConfig({ oidc: { ...minimalOidc, refreshThreshold: 30 } }),
    );
    expect(data.oauthThreshold).toBe(30000);
  });

  it('parseToDavinciConfig_RealmMappedToRealmPath', () => {
    const data = Either.getOrThrow(
      parseToDavinciConfig({
        journey: { serverUrl: 'https://example.com/am', realm: 'alpha' },
        oidc: minimalOidc,
      }),
    );
    expect(data.realmPath).toBe('alpha');
  });

  it('parseToDavinciConfig_EmptyScopes_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(parseToDavinciConfig({ oidc: { ...minimalOidc, scopes: [] } })),
    );
    expect(errors.some((e) => e.field === 'oidc.scopes')).toBe(true);
  });

  it('parseToDavinciConfig_TimeoutPassedToServerConfig', () => {
    const data = Either.getOrThrow(parseToDavinciConfig({ timeout: 7000, oidc: minimalOidc }));
    expect(data.serverConfig.timeout).toBe(7000);
  });

  it('parseToDavinciConfig_OidcMissingDiscoveryEndpoint_ReturnsFailure', () => {
    const errors = Either.getOrThrow(
      Either.flip(
        parseToDavinciConfig({ oidc: { clientId: 'x', redirectUri: 'x', scopes: ['openid'] } }),
      ),
    );
    expect(errors.some((e) => e.field === 'oidc.discoveryEndpoint')).toBe(true);
  });

  it('parseToDavinciConfig_NullInput_ReturnsFailure', () => {
    expect(Either.isLeft(parseToDavinciConfig(null))).toBe(true);
  });
});

describe('parseToOidcConfig log mapping', () => {
  it('parseToOidcConfig_LogFieldMapped_ToLogLevel', () => {
    expect(Either.getOrThrow(parseToOidcConfig({ log: 'DEBUG', oidc: minimalOidc })).log).toBe(
      'debug',
    );
  });

  it('parseToOidcConfig_NoLogField_LogLevelAbsent', () => {
    expect(Either.getOrThrow(parseToOidcConfig({ oidc: minimalOidc })).log).toBeUndefined();
  });

  it('parseToOidcConfig_CookieName_NotMappedToResult', () => {
    const data = Either.getOrThrow(
      parseToOidcConfig({
        journey: { serverUrl: 'https://example.com/am', cookieName: 'iPlanetDirectoryPro' },
        oidc: minimalOidc,
      }),
    ) as unknown as Record<string, unknown>;
    expect(data['cookieName']).toBeUndefined();
  });
});

describe('parseToJourneyConfig log mapping', () => {
  it('parseToJourneyConfig_LogFieldMapped_ToLogLevel', () => {
    expect(Either.getOrThrow(parseToJourneyConfig({ log: 'WARN', oidc: minimalOidc })).log).toBe(
      'warn',
    );
  });

  it('parseToJourneyConfig_NoLogField_LogLevelAbsent', () => {
    expect(Either.getOrThrow(parseToJourneyConfig({ oidc: minimalOidc })).log).toBeUndefined();
  });

  it('parseToJourneyConfig_CookieName_NotMappedToResult', () => {
    const data = Either.getOrThrow(
      parseToJourneyConfig({
        journey: { serverUrl: 'https://example.com/am', cookieName: 'iPlanetDirectoryPro' },
        oidc: minimalOidc,
      }),
    ) as unknown as Record<string, unknown>;
    expect(data['cookieName']).toBeUndefined();
  });
});

describe('parseToDavinciConfig log mapping', () => {
  it('parseToDavinciConfig_LogFieldMapped_ToLogLevel', () => {
    expect(Either.getOrThrow(parseToDavinciConfig({ log: 'ERROR', oidc: minimalOidc })).log).toBe(
      'error',
    );
  });

  it('parseToDavinciConfig_NoLogField_LogLevelAbsent', () => {
    expect(Either.getOrThrow(parseToDavinciConfig({ oidc: minimalOidc })).log).toBeUndefined();
  });
});

describe('makeOidcConfig', () => {
  it('makeOidcConfig_ValidFullConfig_ReturnsMappedOidcConfig', () => {
    const result = makeOidcConfig(fullConfig);
    expect(result.clientId).toBe('my-client');
    expect(result.redirectUri).toBe('https://app.example.com/callback');
    expect(result.scope).toBe('openid profile');
    expect(result.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('makeOidcConfig_NullInput_Throws', () => {
    expect(() => makeOidcConfig(null)).toThrow('Invalid unified SDK config');
  });

  it('makeOidcConfig_MissingDiscoveryEndpoint_Throws', () => {
    expect(() =>
      makeOidcConfig({ oidc: { clientId: 'x', scopes: ['openid'], redirectUri: 'x' } }),
    ).toThrow('Invalid unified SDK config');
  });

  it('makeOidcConfig_EmptyDiscoveryEndpoint_Throws', () => {
    expect(() => makeOidcConfig({ oidc: { ...minimalOidc, discoveryEndpoint: '' } })).toThrow(
      'Invalid unified SDK config',
    );
  });

  it('makeOidcConfig_EmptyScopes_Throws', () => {
    expect(() => makeOidcConfig({ oidc: { ...minimalOidc, scopes: [] } })).toThrow(
      'Invalid unified SDK config',
    );
  });

  it('makeOidcConfig_MissingClientId_Throws', () => {
    expect(() =>
      makeOidcConfig({
        oidc: {
          discoveryEndpoint: 'https://example.com/.well-known',
          scopes: ['openid'],
          redirectUri: 'x',
        },
      }),
    ).toThrow('Invalid unified SDK config');
  });
});

describe('makeJourneyConfig', () => {
  it('makeJourneyConfig_ValidConfig_ReturnsMappedJourneyConfig', () => {
    const result = makeJourneyConfig(fullConfig);
    expect(result.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
    expect(result.realmPath).toBe('alpha');
  });

  it('makeJourneyConfig_NullInput_Throws', () => {
    expect(() => makeJourneyConfig(null)).toThrow('Invalid unified SDK config');
  });

  it('makeJourneyConfig_MissingOidcBlock_Throws', () => {
    expect(() => makeJourneyConfig({ journey: { serverUrl: 'https://example.com/am' } })).toThrow(
      'Invalid unified SDK config',
    );
  });
});

describe('makeDavinciConfig', () => {
  it('makeDavinciConfig_ValidFullConfig_ReturnsMappedDavinciConfig', () => {
    const result = makeDavinciConfig(fullConfig);
    expect(result.clientId).toBe('my-client');
    expect(result.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
  });

  it('makeDavinciConfig_NullInput_Throws', () => {
    expect(() => makeDavinciConfig(null)).toThrow('Invalid unified SDK config');
  });

  it('makeDavinciConfig_MissingDiscoveryEndpoint_Throws', () => {
    expect(() =>
      makeDavinciConfig({ oidc: { clientId: 'x', scopes: ['openid'], redirectUri: 'x' } }),
    ).toThrow('Invalid unified SDK config');
  });

  it('makeDavinciConfig_EmptyScopes_Throws', () => {
    expect(() => makeDavinciConfig({ oidc: { ...minimalOidc, scopes: [] } })).toThrow(
      'Invalid unified SDK config',
    );
  });

  it('makeDavinciConfig_MissingClientId_Throws', () => {
    expect(() =>
      makeDavinciConfig({
        oidc: {
          discoveryEndpoint: 'https://example.com/.well-known',
          scopes: ['openid'],
          redirectUri: 'x',
        },
      }),
    ).toThrow('Invalid unified SDK config');
  });
});

describe('collectErrors', () => {
  it('collectErrors_AllRight_ReturnsEmpty', () => {
    expect(collectErrors([Either.right(1), Either.right('a')])).toEqual([]);
  });

  it('collectErrors_MultipleLeft_AccumulatesAllErrors', () => {
    const errors = collectErrors([
      Either.right(1),
      Either.left([{ field: 'a', message: 'bad a' }]),
      Either.left([{ field: 'b', message: 'bad b' }]),
    ]);
    expect(errors.map((e) => e.field)).toEqual(['a', 'b']);
  });

  it('collectErrors_DoesNotShortCircuit', () => {
    const errors = collectErrors([
      Either.left([{ field: 'first', message: 'x' }]),
      Either.left([{ field: 'second', message: 'y' }]),
    ]);
    expect(errors).toHaveLength(2);
  });
});

describe('parseOidcSection', () => {
  it('parseOidcSection_ValidInput_ReturnsParsedConfig', () => {
    const result = parseOidcSection({
      discoveryEndpoint: 'https://example.com/.well-known',
      clientId: 'my-client',
      scopes: ['openid'],
    });
    expect(Either.getOrThrow(result).clientId).toBe('my-client');
  });

  it('parseOidcSection_UnknownField_Ignored', () => {
    const result = parseOidcSection({
      discoveryEndpoint: 'https://example.com/.well-known',
      unknownField: 'kept',
    });
    expect(Either.isRight(result)).toBe(true);
  });

  it('parseOidcSection_MissingDiscoveryEndpoint_ReturnsError', () => {
    const errors = Either.getOrThrow(Either.flip(parseOidcSection({ clientId: 'my-client' })));
    expect(errors.some((e) => e.field === 'oidc.discoveryEndpoint')).toBe(true);
  });
});
