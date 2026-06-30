import { oidc } from '@forgerock/oidc-client';

const client = await oidc({
  config: {
    serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
    clientId: 'test-client',
    redirectUri: 'https://example.com/callback',
    scope: 'openid profile',
  },
});

if ('error' in client) {
  console.error(client.error);
} else {
  // Revoke tokens (server-side invalidation)
  const revokeResult = await client.token.revoke();
  console.log(revokeResult);

  // Full logout (revoke + end session endpoint)
  const logoutResult = await client.logout();
  console.log(logoutResult);
}
