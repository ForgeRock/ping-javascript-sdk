import { journey } from '@forgerock/journey-client';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

let step = await client.start();

while (step.type === 'Step') {
  if (step.callbacks.some((cb) => cb.type === 'RedirectCallback')) {
    await client.redirect(step);
    break;
  }
  step = await client.next(step);
}
