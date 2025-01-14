import type {
  OAthResponse,
  DeletedOAthDevice,
  PushDevicesResponse,
  DeviceResponse,
  WebAuthnDevicesResponse,
} from '../types/index.js';
// Mock data
export const MOCK_OATH_DEVICES: OAthResponse = [
  {
    _id: 'oath-1',
    _rev: '1-oath',
    createdDate: 1705555555555,
    lastAccessDate: 1705555555555,
    deviceName: 'Test OATH Device',
    uuid: 'oath-uuid-1',
    deviceManagementStatus: true,
  },
];

export const MOCK_DELETED_OATH_DEVICE: DeletedOAthDevice = {
  _id: 'oath-1',
  _rev: '1-oath',
  uuid: 'oath-uuid-1',
  recoveryCodes: ['code1', 'code2'],
  createdDate: 1705555555555,
  lastAccessDate: 1705555555555,
  sharedSecret: 'secret123',
  deviceName: 'Test OATH Device',
  lastLogin: 1705555555555,
  counter: 0,
  checksumDigit: true,
  truncationOffset: 0,
  clockDriftSeconds: 0,
};

export const MOCK_PUSH_DEVICES: PushDevicesResponse = [
  {
    _id: 'push-1',
    _rev: '1-push',
    createdDate: 1705555555555,
    lastAccessDate: 1705555555555,
    deviceName: 'Test Push Device',
    uuid: 'push-uuid-1',
    deviceManagementStatus: true,
  },
];

export const MOCK_WEBAUTHN_DEVICES: WebAuthnDevicesResponse = {
  result: [
    {
      _id: 'webauthn-1',
      _rev: '1-webauthn',
      createdDate: 1705555555555,
      lastAccessDate: 1705555555555,
      credentialId: 'credential-1',
      deviceName: 'Test WebAuthn Device',
      uuid: 'webauthn-uuid-1',
      deviceManagementStatus: true,
    },
  ],
  resultCount: 1,
  pagedResultsCookie: null,
  totalPagedResultsPolicy: 'NONE',
  totalPagedResults: -1,
  remainingPagedResults: -1,
};

export const MOCK_BINDING_DEVICES: DeviceResponse = {
  result: [
    {
      _id: 'binding-1',
      _rev: '1-binding',
      createdDate: 1705555555555,
      lastAccessDate: 1705555555555,
      deviceId: 'device-1',
      deviceName: 'Test Binding Device',
      uuid: 'binding-uuid-1',
      key: {
        kty: 'RSA',
        kid: 'key-1',
        use: 'sig',
        alg: 'RS256',
        n: 'mock-n',
        e: 'mock-e',
      },
      deviceManagementStatus: true,
    },
  ],
  resultCount: 1,
  pagedResultsCookie: null,
  totalPagedResultsPolicy: 'NONE',
  totalPagedResults: -1,
  remainingPagedResults: -1,
};
