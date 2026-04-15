import type { SymbolMapping } from './types.js';

/**
 * Maps every legacy `@forgerock/javascript-sdk` symbol to its new SDK equivalent.
 *
 * Callbacks that exist with an identical name in `@forgerock/journey-client/types`
 * are auto-discovered and intentionally omitted here.
 */
export const SYMBOL_MAP: Record<string, SymbolMapping> = {
  // ---------------------------------------------------------------------------
  // Renamed / Moved — value exports
  // ---------------------------------------------------------------------------
  FRAuth: {
    new: 'journey',
    package: '@forgerock/journey-client',
    note: 'factory returns `JourneyClient`',
  },
  FRStep: {
    new: 'JourneyStep',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  FRLoginSuccess: {
    new: 'JourneyLoginSuccess',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  FRLoginFailure: {
    new: 'JourneyLoginFailure',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  FRCallback: {
    new: 'BaseCallback',
    package: '@forgerock/journey-client/types',
  },
  CallbackType: {
    new: 'callbackType',
    package: '@forgerock/journey-client',
  },
  StepType: {
    new: 'StepType',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  TokenManager: {
    new: 'oidc',
    package: '@forgerock/oidc-client',
    note: '`oidcClient.token.*`',
  },
  TokenStorage: {
    new: 'oidc',
    package: '@forgerock/oidc-client',
    note: '`oidcClient.token.*`',
  },
  OAuth2Client: {
    new: 'oidc',
    package: '@forgerock/oidc-client',
    note: '`oidcClient.authorize.*` / `oidcClient.token.*`',
  },
  UserManager: {
    new: 'oidc',
    package: '@forgerock/oidc-client',
    note: '`oidcClient.user.info()`',
  },
  FRUser: {
    new: 'oidc',
    package: '@forgerock/oidc-client',
    note: '`oidcClient.user.logout()`',
  },
  ResponseType: {
    new: 'ResponseType',
    package: '@forgerock/oidc-client/types',
    type: true,
  },
  SessionManager: {
    new: 'journeyClient.terminate()',
    package: '',
    note: 'method on JourneyClient, not a standalone import',
  },
  FRWebAuthn: {
    new: 'WebAuthn',
    package: '@forgerock/journey-client/webauthn',
  },
  WebAuthnStepType: {
    new: 'WebAuthnStepType',
    package: '@forgerock/journey-client/webauthn',
  },
  FRQRCode: {
    new: 'QRCode',
    package: '@forgerock/journey-client/qr-code',
  },
  FRRecoveryCodes: {
    new: 'RecoveryCodes',
    package: '@forgerock/journey-client/recovery-codes',
  },
  FRPolicy: {
    new: 'Policy',
    package: '@forgerock/journey-client/policy',
  },
  PolicyKey: {
    new: 'PolicyKey',
    package: '@forgerock/journey-client',
  },
  FRDevice: {
    new: 'deviceClient',
    package: '@forgerock/device-client',
  },
  deviceClient: {
    new: 'deviceClient',
    package: '@forgerock/device-client',
  },

  // ---------------------------------------------------------------------------
  // Renamed / Moved — type exports
  // ---------------------------------------------------------------------------
  AuthResponse: {
    new: 'AuthResponse',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  Callback: {
    new: 'Callback',
    package: '@forgerock/journey-client/types',
    type: true,
    note: 'AM callback interface',
  },
  FailureDetail: {
    new: 'FailureDetail',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  GetAuthorizationUrlOptions: {
    new: 'GetAuthorizationUrlOptions',
    package: '@forgerock/oidc-client/types',
    type: true,
  },
  IdPValue: {
    new: 'IdPValue',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  MessageCreator: {
    new: 'MessageCreator',
    package: '@forgerock/journey-client/policy',
    type: true,
  },
  NameValue: {
    new: 'NameValue',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  OAuth2Tokens: {
    new: 'OauthTokens',
    package: '@forgerock/oidc-client/types',
    type: true,
    note: 'renamed to `OauthTokens`',
  },
  PolicyRequirement: {
    new: 'PolicyRequirement',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  ProcessedPropertyError: {
    new: 'ProcessedPropertyError',
    package: '@forgerock/journey-client/policy',
    type: true,
  },
  RelyingParty: {
    new: 'RelyingParty',
    package: '@forgerock/journey-client/webauthn',
    type: true,
  },
  Step: {
    new: 'Step',
    package: '@forgerock/journey-client/types',
    type: true,
    note: 'AM step response interface',
  },
  StepDetail: {
    new: 'StepDetail',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  Tokens: {
    new: 'Tokens',
    package: '@forgerock/journey-client/types',
    type: true,
  },
  WebAuthnAuthenticationMetadata: {
    new: 'WebAuthnAuthenticationMetadata',
    package: '@forgerock/journey-client/webauthn',
    type: true,
  },
  WebAuthnCallbacks: {
    new: 'WebAuthnCallbacks',
    package: '@forgerock/journey-client/webauthn',
    type: true,
  },
  WebAuthnRegistrationMetadata: {
    new: 'WebAuthnRegistrationMetadata',
    package: '@forgerock/journey-client/webauthn',
    type: true,
  },

  // ---------------------------------------------------------------------------
  // Removed
  // ---------------------------------------------------------------------------
  Config: {
    status: 'removed',
    note: 'pass config to `journey()` / `oidc()` factory params',
  },
  HttpClient: {
    status: 'removed',
    note: 'use `fetch` + manual `Authorization` header',
  },
  Auth: {
    status: 'removed',
    note: 'no replacement needed',
  },
  Deferred: {
    status: 'removed',
    note: 'use native `Promise` constructor',
  },
  PKCE: {
    status: 'removed',
    note: 'handled internally by `@forgerock/oidc-client`',
  },
  LocalStorage: {
    status: 'removed',
    note: 'use `@forgerock/storage` or native APIs',
  },
  ErrorCode: {
    status: 'removed',
    note: 'use `GenericError.type` instead',
  },
  ConfigOptions: {
    status: 'removed',
    note: 'use factory params on `journey()` / `oidc()` instead',
  },
  FRCallbackFactory: {
    status: 'removed',
    note: 'custom callback factories not supported',
  },
  FRStepHandler: {
    status: 'removed',
    note: 'step handling is internal to JourneyClient',
  },
  GetOAuth2TokensOptions: {
    status: 'removed',
    note: 'use `oidcClient.token.get()` params instead',
  },
  GetTokensOptions: {
    status: 'removed',
    note: 'use `oidcClient.token.get()` params instead',
  },
  LoggerFunctions: {
    status: 'removed',
    note: 'use `CustomLogger` from `@forgerock/sdk-logger` instead',
  },
  StepOptions: {
    status: 'removed',
    note: 'per-call config overrides removed; use factory params',
  },
  ValidConfigOptions: {
    status: 'removed',
    note: 'config is encapsulated in client instances',
  },

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------
  WebAuthnOutcome: {
    status: 'internal',
    note: 'internal to webauthn module',
  },
  WebAuthnOutcomeType: {
    status: 'internal',
    note: 'internal to webauthn module',
  },
  defaultMessageCreator: {
    status: 'internal',
    note: 'internal to `@forgerock/journey-client/policy`',
  },
};

/**
 * Package-level renames from legacy to new SDK packages.
 */
export const PACKAGE_MAP: Record<string, { new: string; note?: string }> = {
  '@forgerock/ping-protect': {
    new: '@forgerock/protect',
    note: 'PingOne Protect/Signals integration',
  },
};
