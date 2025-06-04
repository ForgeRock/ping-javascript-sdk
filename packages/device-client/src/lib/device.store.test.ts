/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { afterEach, afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { deviceClient } from './device.store.js';
import { handlers } from './device.store.test.utils.js';

import {
  MOCK_PUSH_DEVICES,
  MOCK_BINDING_DEVICES,
  MOCK_OATH_DEVICES,
  MOCK_WEBAUTHN_DEVICES,
  MOCK_DEVICE_PROFILE_SUCCESS,
} from './mock-data/device.store.mock.js';

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

      expect(result).toEqual(MOCK_OATH_DEVICES.result);
    });

    it('should delete OATH device', async () => {
      const result = await client.oath.delete({
        userId: 'test-user',
        device: {
          deviceManagementStatus: false,
          _rev: '1221312',
          uuid: 'oath-uuid-1',
          deviceName: 'Test OATH Device',
          _id: 'test-id',
          createdDate: 1705555555555,
          lastAccessDate: 1705555555555,
        },
      });

      expect(result).toEqual(null);
    });

    it('should return error obj if a user does not exist', async () => {
      const badClient = deviceClient(config);
      const result = await badClient.oath.get({
        userId: 'bad-user',
      });
      expect(result).toStrictEqual({ error: new Error('response did not contain data') });
    });

    it('should return error obj if a realm does not exist', async () => {
      const badConfig = { ...config, realmPath: 'fake-realm' };
      const badClient = deviceClient(badConfig);
      const result = await badClient.oath.get({
        userId: 'test-user',
      });
      expect(result).toStrictEqual({ error: new Error('response did not contain data') });
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
        device: MOCK_PUSH_DEVICES[0],
      });
      expect(result).toEqual(null);
    });

    it('should fail with a bad uuid', async () => {
      const client = deviceClient(config);
      const result1 = await client.push.delete({
        userId: 'test-user',
        device: { ...MOCK_PUSH_DEVICES[0], uuid: 'bad-uuid' },
      });

      expect(result1).toEqual({
        error: expect.objectContaining({ message: expect.stringContaining('bad uuid') }),
      });
    });

    it('should fail with a bad userId', async () => {
      const badConfig = { ...config, realmPath: 'bad-realm' };
      const badClient = deviceClient(badConfig);
      const result1 = await badClient.push.delete({
        userId: 'bad-user',
        device: MOCK_PUSH_DEVICES[0],
      });
      const result2 = await badClient.push.get({ userId: 'bad-user' });

      expect(result1).toEqual({
        error: expect.objectContaining({ message: expect.stringContaining('bad user') }),
      });
      expect(result2).toStrictEqual({ error: new Error('response did not contain data') });
    });

    it('should return error obj if a uuid does not exist', async () => {
      const badClient = deviceClient(config);
      const result = await badClient.push.delete({
        userId: 'user',
        device: { ...MOCK_PUSH_DEVICES[0], uuid: 'bad-uuid' },
      });
      expect(result).toEqual({
        error: expect.objectContaining({ message: expect.stringContaining('bad uuid') }),
      });
    });

    it('should return error obj if a user does not exist', async () => {
      const badClient = deviceClient(config);
      const result = await badClient.push.get({
        userId: 'bad-user',
      });
      expect(result).toStrictEqual({ error: new Error('response did not contain data') });
    });

    it('should return error obj if a realm does not exist', async () => {
      const badConfig = { ...config, realmPath: 'fake-realm' };
      const badClient = deviceClient(badConfig);
      const result = await badClient.push.get({
        userId: 'test-user',
      });
      expect(result).toStrictEqual({ error: new Error('response did not contain data') });
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
        device: {
          _id: mockDevice._id,
          _rev: mockDevice._rev,
          uuid: mockDevice.uuid,
          deviceName: 'Updated WebAuthn Device',
          credentialId: mockDevice.credentialId,
          createdDate: mockDevice.createdDate,
          lastAccessDate: mockDevice.lastAccessDate,
          deviceManagementStatus: mockDevice.deviceManagementStatus,
        },
      });

      expect(result).toEqual({
        ...mockDevice,
        deviceName: 'Updated WebAuthn Device',
      });
    });

    it('should error when deleting webauthn device with invalid uuid', async () => {
      const mockDevice = MOCK_WEBAUTHN_DEVICES.result[0];
      const result = await client.webAuthn.delete({
        userId: 'test-user',
        device: {
          ...mockDevice,
          uuid: 'bad-uuid',
        },
      });

      expect(result).toEqual({
        error: expect.objectContaining({ message: expect.stringContaining('bad uuid') }),
      });
    });

    it('should delete webauthn device', async () => {
      const mockDevice = MOCK_WEBAUTHN_DEVICES.result[0];
      const result = await client.webAuthn.delete({
        userId: 'test-user',
        device: mockDevice,
      });

      expect(result).toEqual(null);
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
        device: mockDevice,
      });

      expect(result).toEqual({
        ...mockDevice,
        deviceName: 'Updated Binding Device',
      });
    });

    it('should delete bound device', async () => {
      const result = await client.bound.delete({
        userId: 'test-user',
        device: mockDevice,
      });

      expect(result).toEqual(null);
    });
  });

  describe('Profile Device', () => {
    const client = deviceClient(config);

    it('should fetch device profiles', async () => {
      const result = await client.profile.get({ userId: 'test-user', realm: 'test-realm' });

      expect(result).toEqual(MOCK_DEVICE_PROFILE_SUCCESS);
    });

    it('should update device profiles', async () => {
      const result = await client.profile.update({
        userId: 'test-user',
        realm: 'test-realm',
        device: MOCK_DEVICE_PROFILE_SUCCESS.result[0],
      });

      expect(result).toEqual({ ...MOCK_DEVICE_PROFILE_SUCCESS.result[0], alias: 'new-name' });
    });

    it('should delete device profiles', async () => {
      const result = await client.profile.delete({
        userId: 'hello',
        realm: 'alpha',
        device: MOCK_DEVICE_PROFILE_SUCCESS.result[0],
      });

      expect(result).toEqual(null);
    });
  });
});
