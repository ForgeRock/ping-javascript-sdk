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
  // Token exchange after authorization code callback
  const tokens = await client.token.exchange('auth-code-123', 'state-abc');
  if ('error' in tokens) {
    console.error(tokens.error);
  } else {
    console.log(tokens);
  }

  // Retrieve stored tokens (with auto-renew if backgroundRenew is set)
  const stored = await client.token.get({ backgroundRenew: false });
  if ('error' in stored) {
    console.error(stored.error);
  } else {
    console.log(stored);
  }
}
