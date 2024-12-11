export type WebAuthnQuery = {
  realm?: string;
  userId: string;
};

export type WebAuthnQueryWithUUID = {
  uuid: string;
} & WebAuthnQuery;

export type WebAuthnBody = {
  id: string;
  deviceName: string;
  uuid: string;
  credentialId: string;
  createdDate: number;
  lastAccessDate: number;
};

export type WebAuthnDevicesResponse = {
  result: WebAuthnDevice[];
  resultCount: number;
  pagedResultsCookie: null;
  totalPagedResultsPolicy: 'NONE';
  totalPagedResults: -1;
  remainingPagedResults: -1;
};

export type WebAuthnDevice = {
  _id: string;
  _rev: string;
  createdDate: number;
  lastAccessDate: number;
  credentialId: string;
  deviceName: string;
  uuid: string;
  deviceManagementStatus: boolean;
};

export type UpdatedWebAuthnDevice = {
  _id: string;
  _rev: string;
  uuid: string;
  recoveryCodes: string[];
  createdDate: number;
  lastAccessDate: number;
  credentialId: string;
  algorithm: string;
  deviceName: string;
  signCount: number;
  key: {
    kty: string;
    x: string;
    y: string;
    crv: string;
  };
};
export type WebAuthnCredential = {
  _id: string;
  _rev: string;
  uuid: string;
  recoveryCodes: string[];
  createdDate: number;
  lastAccessDate: number;
  credentialId: string;
  algorithm: string;
  deviceName: string;
  key: {
    kty: string;
    x: string;
    y: string;
    crv: string;
  };
};