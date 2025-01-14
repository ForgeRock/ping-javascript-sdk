import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { deviceClient } from './device.store';

import {
  MOCK_PUSH_DEVICES,
  MOCK_BINDING_DEVICES,
  MOCK_OATH_DEVICES,
  MOCK_DELETED_OATH_DEVICE,
  MOCK_WEBAUTHN_DEVICES,
} from './mock-data/msw-mock-data';

// Create handlers
export const handlers = [
  // OATH Devices
  http.get('*/devices/2fa/oath', () => {
    return HttpResponse.json(MOCK_OATH_DEVICES);
  }),

  http.delete('*/devices/2fa/oath/:uuid', () => {
    return HttpResponse.json(MOCK_DELETED_OATH_DEVICE);
  }),

  // Push Devices
  http.get('*/devices/2fa/push', () => {
    return HttpResponse.json(MOCK_PUSH_DEVICES);
  }),

  http.delete('*/devices/2fa/push/:uuid', () => {
    return HttpResponse.json(MOCK_PUSH_DEVICES[0]);
  }),

  // WebAuthn Devices
  http.get('*/devices/2fa/webauthn', () => {
    return HttpResponse.json(MOCK_WEBAUTHN_DEVICES);
  }),

  http.put('*/devices/2fa/webauthn/:uuid', () => {
    return HttpResponse.json({
      ...MOCK_WEBAUTHN_DEVICES.result[0],
      deviceName: 'Updated WebAuthn Device',
    });
  }),

  http.delete('*/devices/2fa/webauthn/:uuid', () => {
    return HttpResponse.json(MOCK_WEBAUTHN_DEVICES.result[0]);
  }),

  // Binding Devices
  http.get('*/devices/2fa/binding', () => {
    return HttpResponse.json(MOCK_BINDING_DEVICES);
  }),

  http.put('*/devices/2fa/binding/:uuid', () => {
    return HttpResponse.json({
      ...MOCK_BINDING_DEVICES.result[0],
      deviceName: 'Updated Binding Device',
    });
  }),

  http.delete('*/devices/2fa/binding/:uuid', () => {
    return HttpResponse.json(MOCK_BINDING_DEVICES.result[0]);
  }),
];

export const server = setupServer(...handlers);

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

describe('Device Client Store', () => {
  const config = {
    serverConfig: {
      baseUrl: 'https://api.example.com',
    },
    realmPath: 'test-realm',
  };

  describe('OATH Device Management', () => {
    const client = deviceClient(config);

    it('should fetch OATH devices', async () => {
      const result = await client.oath.get({
        userId: 'test-user',
      });

      expect(result).toEqual(MOCK_OATH_DEVICES);
    });

    it('should delete OATH device', async () => {
      const result = await client.oath.delete({
        userId: 'test-user',
        uuid: 'oath-uuid-1',
        deviceName: 'Test OATH Device',
        id: 'test-id',
        createdDate: new Date(1705555555555),
        lastAccessDate: new Date(1705555555555),
      });

      expect(result).toEqual(MOCK_DELETED_OATH_DEVICE);
    });
  });

  describe('Push Device Management', () => {
    const client = deviceClient(config);

    it('should fetch push devices', async () => {
      const result = await client.push.get({
        userId: 'test-user',
      });

      expect(result).toEqual(MOCK_PUSH_DEVICES);
    });

    it('should delete push device', async () => {
      const result = await client.push.delete({
        userId: 'test-user',
        uuid: 'push-uuid-1',
      });

      expect(result).toEqual(MOCK_PUSH_DEVICES[0]);
    });
  });
  describe('WebAuthn Device Management', () => {
    const client = deviceClient(config);

    it('should fetch webauthn devices', async () => {
      const result = await client.webAuthn.get({
        userId: 'test-user',
      });

      expect(result).toEqual(MOCK_WEBAUTHN_DEVICES);
    });

    it('should update webauthn device name', async () => {
      const mockDevice = MOCK_WEBAUTHN_DEVICES.result[0];
      const result = await client.webAuthn.update({
        userId: 'test-user',
        uuid: mockDevice.uuid,
        id: mockDevice._id,
        deviceName: 'Updated WebAuthn Device',
        credentialId: mockDevice.credentialId,
        createdDate: mockDevice.createdDate,
        lastAccessDate: mockDevice.lastAccessDate,
      });

      expect(result).toEqual({
        ...mockDevice,
        deviceName: 'Updated WebAuthn Device',
      });
    });

    it('should delete webauthn device', async () => {
      const mockDevice = MOCK_WEBAUTHN_DEVICES.result[0];
      const result = await client.webAuthn.delete({
        userId: 'test-user',
        uuid: mockDevice.uuid,
        id: mockDevice._id,
        deviceName: mockDevice.deviceName,
        credentialId: mockDevice.credentialId,
        createdDate: mockDevice.createdDate,
        lastAccessDate: mockDevice.lastAccessDate,
      });

      expect(result).toEqual(mockDevice);
    });
  });

  describe('Bound Device Management', () => {
    const client = deviceClient(config);
    const mockDevice = MOCK_BINDING_DEVICES.result[0];

    it('should fetch bound devices', async () => {
      const result = await client.bound.get({
        userId: 'test-user',
        ...mockDevice,
      });

      expect(result).toEqual(MOCK_BINDING_DEVICES);
    });

    it('should update bound device name', async () => {
      const result = await client.bound.update({
        userId: 'test-user',
        ...mockDevice,
      });

      expect(result).toEqual({
        ...mockDevice,
        deviceName: 'Updated Binding Device',
      });
    });

    it('should delete bound device', async () => {
      const result = await client.bound.delete({
        userId: 'test-user',
        ...mockDevice,
      });

      expect(result).toEqual(mockDevice);
    });
  });
});
