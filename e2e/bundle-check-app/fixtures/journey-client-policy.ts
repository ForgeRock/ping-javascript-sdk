import { journey } from '@forgerock/journey-client';
import { Policy } from '@forgerock/journey-client/policy';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

const step = await client.start();

if (step.type === 'Step') {
  const errors = Policy.parseErrors(step.callbacks);
  console.log(errors);
}
