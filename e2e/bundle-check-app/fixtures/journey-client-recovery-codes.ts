import { journey } from '@forgerock/journey-client';
import { RecoveryCodes } from '@forgerock/journey-client/recovery-codes';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

const step = await client.start();

if (step.type === 'Step') {
  const codes = RecoveryCodes.getCodes(step);
  console.log(codes);
}
