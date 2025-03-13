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
   * SDK Team Tenant
   * DemoUser-sdkWebClient
   */
  '724ec718-c41c-4d51-98b0-84a583f450f9': {
    clientId: '724ec718-c41c-4d51-98b0-84a583f450f9',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/.well-known/openid-configuration',
    },
  },
  '60de77d5-dd2c-41ef-8c40-f8bb2381a359': {
    clientId: '60de77d5-dd2c-41ef-8c40-f8bb2381a359',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email name revoke',
    serverConfig: {
      wellknown:
        'https://auth.pingone.ca/02fb4743-189a-4bc7-9d6c-a919edfe6447/as/.well-known/openid-configuration',
    },
  },
};
