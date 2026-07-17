import { journey } from '@forgerock/journey-client';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

const step = await client.start();

if (step.type === 'Step') {
  await client.redirect(step);
}
