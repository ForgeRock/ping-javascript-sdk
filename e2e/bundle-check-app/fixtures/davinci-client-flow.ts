import { davinci } from '@forgerock/davinci-client';

const client = await davinci({
  config: {
    serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
    clientId: 'test-client',
    redirectUri: 'https://example.com/callback',
    scope: 'openid profile',
  },
});

let node = await client.start();

// Walk the flow until it reaches a terminal node
while (node.status === 'continue') {
  for (const collector of node.collectors) {
    if (collector.category === 'SingleValueCollector' && collector.type === 'TextCollector') {
      client.update(collector)('test-value');
    }
    if (collector.category === 'SingleValueCollector' && collector.type === 'PasswordCollector') {
      client.update(collector)('test-password');
    }
  }
  node = await client.next();
}

if (node.status === 'success') {
  console.log('Login successful', node.session);
} else if (node.status === 'error' || node.status === 'failure') {
  console.error('Login failed', node.error);
}
