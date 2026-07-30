import { journey } from '@forgerock/journey-client';
import { QRCode } from '@forgerock/journey-client/qr-code';

const client = await journey({
  config: { serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' } },
});

const step = await client.start();

if (step.type === 'Step') {
  const qrCode = QRCode.getQRCodeData(step);
  console.log(qrCode);
}
