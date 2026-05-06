import { deviceClient } from '@forgerock/device-client';

const client = deviceClient({
  serverConfig: {
    baseUrl: 'https://example.com/am',
  },
  realmPath: 'root',
});

// Retrieve OATH (TOTP/HOTP) devices for a user
const oathDevices = await client.oath.get({
  userId: 'user@example.com',
});
console.log(oathDevices);

// Retrieve Push notification devices
const pushDevices = await client.push.get({
  userId: 'user@example.com',
});
console.log(pushDevices);
