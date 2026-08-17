/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { DaVinciConfig } from '@forgerock/davinci-client/types';

export const serverConfigs: Record<string, DaVinciConfig> = {
  /**
   * SocialLoginTenant
   * SDK social login demo
   */
  '85ff55b3-f78c-4c6a-8fb3-7e8ca02d6791': {
    clientId: '85ff55b3-f78c-4c6a-8fb3-7e8ca02d6791',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.com/c2a669c0-c396-4544-994d-9c6eb3fb1602/as/.well-known/openid-configuration',
    },
  },
  /**
   * SocialLoginTenant
   * SDKTests
   */
  '6044ba2a-e4b1-477f-babc-9f622b6e0ff3': {
    clientId: '6044ba2a-e4b1-477f-babc-9f622b6e0ff3',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.com/c2a669c0-c396-4544-994d-9c6eb3fb1602/as/.well-known/openid-configuration',
    },
  },
  /**
   * Login Registration
   */
  '625e45e0-dde5-402e-9bf9-7da1275df03a': {
    clientId: '625e45e0-dde5-402e-9bf9-7da1275df03a',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration',
    },
  },
  /**
   * Form Fields
   * QR Code
   * ValidatedPasswordCollector / Password Policy
   */
  'e4ef2896-8d90-4abd-bf0f-7b8034995927': {
    clientId: 'e4ef2896-8d90-4abd-bf0f-7b8034995927',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration',
    },
  },
  /**
   * MFA: FIDO, Email, SMS
   */
  '9c1d9655-7d1b-46f3-a96d-345690259d2a': {
    clientId: '9c1d9655-7d1b-46f3-a96d-345690259d2a',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration',
    },
  },
  /**
   * AutoCollectors: Polling, Metadata, Protect
   */
  '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0': {
    clientId: '31a587ce-9aa4-4f36-a09f-78cd8a0a74a0',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/356a254c-cba3-4ade-be1a-860136e8df01/as/.well-known/openid-configuration',
    },
  },
};
