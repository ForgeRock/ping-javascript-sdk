/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { http, HttpResponse } from 'msw';

import {
  MOCK_PUSH_DEVICES,
  MOCK_BINDING_DEVICES,
  MOCK_OATH_DEVICES,
  MOCK_DELETED_OATH_DEVICE,
  MOCK_WEBAUTHN_DEVICES,
  MOCK_DEVICE_PROFILE_SUCCESS,
} from './mock-data/device.store.mock.js';

// Create mock service worker handlers
export const handlers = [
  // OATH Devices
  http.get('*/json/realms/:realm/users/:userId/devices/2fa/oath', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json(MOCK_OATH_DEVICES);
  }),

  http.delete('*/json/realms/:realm/users/:userId/devices/2fa/oath/:uuid', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json(MOCK_DELETED_OATH_DEVICE);
  }),

  // Push Devices
  http.get('*/json/realms/:realm/users/:userId/devices/2fa/push', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({ result: MOCK_PUSH_DEVICES });
  }),

  http.delete('*/json/realms/:realm/users/:userId/devices/2fa/push/:uuid', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    if (params['uuid'] === 'bad-uuid') {
      return HttpResponse.json({ error: 'bad uuid' }, { status: 401 });
    }
    return HttpResponse.json(MOCK_PUSH_DEVICES[0]);
  }),

  // WebAuthn Devices
  http.get('*/json/realms/:realm/users/:userId/devices/2fa/webauthn', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({ result: MOCK_WEBAUTHN_DEVICES });
  }),

  http.put('*/json/realms/:realm/users/:userId/devices/2fa/webauthn/:uuid', ({ params }) => {
    if (params['userId'] === 'bad-uuid') {
      return HttpResponse.json({ error: 'bad uuid' }, { status: 401 });
    }
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({
      ...MOCK_WEBAUTHN_DEVICES.result[0],
      deviceName: 'Updated WebAuthn Device',
    });
  }),

  http.delete('*/json/realms/:realm/users/:userId/devices/2fa/webauthn/:uuid', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    if (params['uuid'] === 'bad-uuid') {
      return HttpResponse.json({ error: 'bad uuid' }, { status: 401 });
    }
    return HttpResponse.json(MOCK_WEBAUTHN_DEVICES.result[0]);
  }),

  // Binding Devices
  http.get('*/json/realms/:realm/users/:userId/devices/2fa/binding', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({ result: MOCK_BINDING_DEVICES });
  }),

  http.put(
    '*/json/realms/root/realms/:realm/users/:userId/devices/2fa/binding/:uuid',
    ({ params }) => {
      if (params['realm'] === 'fake-realm') {
        return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
      }
      if (params['userId'] === 'bad-user') {
        return HttpResponse.json({ error: 'bad user' }, { status: 401 });
      }
      if (params['userId'] === 'bad-uuid') {
        return HttpResponse.json({ error: 'bad user' }, { status: 401 });
      }
      return HttpResponse.json({
        ...MOCK_BINDING_DEVICES.result[0],
        deviceName: 'Updated Binding Device',
      });
    },
  ),

  http.delete(
    '*/json/realms/root/realms/:realm/users/:userId/devices/2fa/binding/:uuid',
    ({ params }) => {
      if (params['realm'] === 'fake-realm') {
        return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
      }
      if (params['userId'] === 'bad-user') {
        return HttpResponse.json({ error: 'bad user' }, { status: 401 });
      }
      if (params['userId'] === 'bad-uuid') {
        return HttpResponse.json({ error: 'bad uuid' }, { status: 401 });
      }
      return HttpResponse.json({ result: MOCK_BINDING_DEVICES.result[0] });
    },
  ),

  // profile devices
  http.get('*/json/realms/:realm/users/:userId/devices/profile', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({ result: MOCK_DEVICE_PROFILE_SUCCESS });
  }),

  http.put('*/json/realms/:realm/users/:userId/devices/profile/:uuid', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    return HttpResponse.json({
      ...MOCK_DEVICE_PROFILE_SUCCESS.result[0],
      alias: 'new-name',
    });
  }),

  http.delete('*/json/realms/:realm/users/:userId/devices/profile/:uuid', ({ params }) => {
    if (params['realm'] === 'fake-realm') {
      return HttpResponse.json({ error: 'bad realm' }, { status: 401 });
    }
    if (params['userId'] === 'bad-user') {
      return HttpResponse.json({ error: 'bad user' }, { status: 401 });
    }
    if (params['userId'] === 'bad-uuid') {
      return HttpResponse.json({ error: 'bad uuid' }, { status: 401 });
    }
    return HttpResponse.json(MOCK_DEVICE_PROFILE_SUCCESS.result[0]);
  }),
];
