import { journey } from '@forgerock/journey-client';
import { Device } from '@forgerock/journey-client/device';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

const step = await client.start();

if (step.type === 'Step') {
  const device = new Device();
  const profile = await device.getProfile({ collectLocation: false });
  console.log(profile);
}
