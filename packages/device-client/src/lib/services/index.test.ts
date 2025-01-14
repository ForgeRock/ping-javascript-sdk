/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  MOCK_PUSH_DEVICES,
  MOCK_BINDING_DEVICES,
  MOCK_OATH_DEVICES,
  MOCK_DELETED_OATH_DEVICE,
  MOCK_WEBAUTHN_DEVICES,
} from '../mock-data/msw-mock-data.js';
import { deviceService } from './index.js';
import { describe, it, expect } from 'vitest';

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

describe('OATH Device Endpoints', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  it('should fetch OATH devices', async () => {
    const result = await store.dispatch(
      api.endpoints.getOAthDevices.initiate({
        userId: 'test-user',
      }),
    );

    expect(result.data).toEqual(MOCK_OATH_DEVICES);
  });

  it('should delete OATH device', async () => {
    const result = await store.dispatch(
      api.endpoints.deleteOathDevice.initiate({
        userId: 'test-user',
        uuid: 'oath-uuid-1',
        deviceName: 'Test OATH Device',
        id: 'oath-1',
        createdDate: new Date(1705555555555),
        lastAccessDate: new Date(1705555555555),
      }),
    );

    expect(result.data).toEqual(MOCK_DELETED_OATH_DEVICE);
  });
});

describe('Bound Device Endpoints', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  const mockBindingDevice = MOCK_BINDING_DEVICES.result[0];

  it('should fetch bound devices', async () => {
    const result = await store.dispatch(
      api.endpoints.getBoundDevices.initiate({
        userId: 'test-user',
        ...mockBindingDevice,
      }),
    );

    expect(result.data).toEqual(MOCK_BINDING_DEVICES);
  });

  it('should update binding device name', async () => {
    const result = await store.dispatch(
      api.endpoints.updateBindingDeviceName.initiate({
        userId: 'test-user',
        ...mockBindingDevice,
      }),
    );

    expect(result.data).toEqual({
      ...mockBindingDevice,
      deviceName: 'Updated Binding Device',
    });
  });

  it('should delete binding device', async () => {
    const result = await store.dispatch(
      api.endpoints.deleteBindingDevice.initiate({
        userId: 'test-user',
        ...mockBindingDevice,
      }),
    );

    expect(result.data).toEqual(mockBindingDevice);
  });
});
describe('WebAuthn Device Endpoints', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  const mockWebAuthnDevice = MOCK_WEBAUTHN_DEVICES.result[0];

  it('should fetch webauthn devices', async () => {
    const result = await store.dispatch(
      api.endpoints.getWebAuthnDevices.initiate({
        userId: 'test-user',
      }),
    );

    expect(result.data).toEqual(MOCK_WEBAUTHN_DEVICES);
  });

  it('should update webauthn device name', async () => {
    const result = await store.dispatch(
      api.endpoints.updateWebAuthnDeviceName.initiate({
        userId: 'test-user',
        uuid: mockWebAuthnDevice.uuid,
        id: mockWebAuthnDevice._id,
        deviceName: 'Updated WebAuthn Device',
        credentialId: mockWebAuthnDevice.credentialId,
        createdDate: mockWebAuthnDevice.createdDate,
        lastAccessDate: mockWebAuthnDevice.lastAccessDate,
      }),
    );

    expect(result.data).toEqual({
      ...mockWebAuthnDevice,
      deviceName: 'Updated WebAuthn Device',
    });
  });

  it('should delete webauthn device', async () => {
    const result = await store.dispatch(
      api.endpoints.deleteWebAuthnDeviceName.initiate({
        userId: 'test-user',
        uuid: mockWebAuthnDevice.uuid,
        id: mockWebAuthnDevice._id,
        deviceName: mockWebAuthnDevice.deviceName,
        credentialId: mockWebAuthnDevice.credentialId,
        createdDate: mockWebAuthnDevice.createdDate,
        lastAccessDate: mockWebAuthnDevice.lastAccessDate,
      }),
    );

    expect(result.data).toEqual(mockWebAuthnDevice);
  });
});
describe('Push Device Endpoints', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  const mockPushDevice = MOCK_PUSH_DEVICES[0];

  it('should fetch push devices', async () => {
    const result = await store.dispatch(
      api.endpoints.getPushDevices.initiate({
        userId: 'test-user',
      }),
    );

    expect(result.data).toEqual(MOCK_PUSH_DEVICES);
  });

  it('should delete push device', async () => {
    const result = await store.dispatch(
      api.endpoints.deletePushDevice.initiate({
        userId: 'test-user',
        uuid: mockPushDevice.uuid,
      }),
    );

    expect(result.data).toEqual(mockPushDevice);
  });
});

describe('Request Validation', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  it('should include correct query parameters in OATH devices request', async () => {
    let requestUrl = '';
    server.use(
      http.get('*/devices/2fa/oath', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(MOCK_OATH_DEVICES);
      }),
    );

    await store.dispatch(api.endpoints.getOAthDevices.initiate({ userId: 'test-user' }));

    expect(requestUrl).toContain('_queryFilter=true');
    expect(requestUrl).toContain('test-user');
  });

  it('should construct correct URL for binding device update', async () => {
    let requestUrl = '';
    server.use(
      http.put('*/devices/2fa/binding/*', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(MOCK_BINDING_DEVICES.result[0]);
      }),
    );

    await store.dispatch(
      api.endpoints.updateBindingDeviceName.initiate({
        userId: 'test-user',
        ...MOCK_BINDING_DEVICES.result[0],
      }),
    );

    expect(requestUrl).toContain(`/devices/2fa/binding/${MOCK_BINDING_DEVICES.result[0].uuid}`);
  });
});

describe('Error Handling', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('*/devices/2fa/push', () => {
        throw new Error('Network error');
      }),
    );

    const result = await store.dispatch(
      api.endpoints.getPushDevices.initiate({ userId: 'test-user' }),
    );

    expect(result.error).toBeDefined();
  });
});
describe('Error Handling', () => {
  const api = deviceService({
    baseUrl: 'https://api.example.com',
    realmPath: 'test-realm',
  });

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  it('should handle 404 for non-existent OATH device', async () => {
    server.use(
      http.get('*/devices/2fa/oath', () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    const result = await store.dispatch(
      api.endpoints.getOAthDevices.initiate({ userId: 'test-user' }),
    );

    expect(result.error).toBeDefined();
    if ('status' in result.error!) {
      expect(result.error.status).toBe(404);
    }
  });

  it('should handle 401 for unauthorized access', async () => {
    server.use(
      http.get('*/devices/2fa/webauthn', () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const result = await store.dispatch(
      api.endpoints.getWebAuthnDevices.initiate({ userId: 'test-user' }),
    );

    expect(result.error).toBeDefined();
    if ('status' in result.error!) {
      expect(result.error.status).toBe(401);
    }
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('*/devices/2fa/push', () => {
        throw new Error('Network error');
      }),
    );

    const result = await store.dispatch(
      api.endpoints.getPushDevices.initiate({ userId: 'test-user' }),
    );

    expect(result.error).toBeDefined();
    if ('message' in result.error!) {
      expect(result.error.message).toBeDefined();
    }
  });
});
