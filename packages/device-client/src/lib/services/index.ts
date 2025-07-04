/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import {
  DeletedOathDevice,
  OathDevice,
  OathResponse,
  RetrieveOathQuery,
} from '../types/oath.types.js';
import {
  DeleteDeviceQuery,
  DeletedPushDevice,
  PushDevice,
  PushDeviceQuery,
} from '../types/push-device.types.js';
import { BoundDeviceQuery, Device, GetBoundDevicesQuery } from '../types/bound-device.types.js';

import { UpdatedWebAuthnDevice, WebAuthnDevice, WebAuthnQuery } from '../types/webauthn.types.js';
import {
  ProfileDevice,
  GetProfileDevices,
  ProfileDevicesQuery,
} from '../types/profile-device.types.js';

export interface GeneralResponse<T> {
  pagedResultsCookie: string | null;
  remainingPagedResults: number;
  resultCount: number;
  totalPagedResults: number;
  totalPagedResultsPolicy: string;
  result: T;
}

export const deviceService = ({ baseUrl, realmPath }: { baseUrl: string; realmPath: string }) =>
  createApi({
    reducerPath: 'deviceClient',
    baseQuery: fetchBaseQuery({
      credentials: 'include',
      prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        headers.set('x-requested-with', 'forgerock-sdk');
        headers.set('x-requested-platform', 'javascript');

        return headers;
      },
      baseUrl,
    }),
    endpoints: (builder) => ({
      // oath endpoints
      getOathDevices: builder.query<OathResponse, RetrieveOathQuery>({
        query: ({ realm = realmPath, userId }) =>
          `json/realms/${realm}/users/${userId}/devices/2fa/oath?_queryFilter=true`,
      }),

      deleteOathDevice: builder.mutation<
        DeletedOathDevice,
        RetrieveOathQuery & { device: OathDevice }
      >({
        query: ({ realm = realmPath, userId, device }) => ({
          method: 'DELETE',
          url: `json/realms/${realm}/users/${userId}/devices/2fa/oath/${device.uuid}`,
          body: device,
        }),
      }),

      // push device
      getPushDevices: builder.query<GeneralResponse<PushDevice[]>, PushDeviceQuery>({
        query: ({ realm = realmPath, userId }) =>
          `/json/realms/${realm}/users/${userId}/devices/2fa/push?_queryFilter=true`,
      }),

      deletePushDevice: builder.mutation<DeletedPushDevice, DeleteDeviceQuery>({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `/json/realms/${realm}/users/${userId}/devices/2fa/push/${device.uuid}`,
          method: 'DELETE',
          body: {},
        }),
      }),

      // webauthn devices
      getWebAuthnDevices: builder.query<GeneralResponse<WebAuthnDevice[]>, WebAuthnQuery>({
        query: ({ realm = realmPath, userId }) =>
          `/json/realms/${realm}/users/${userId}/devices/2fa/webauthn?_queryFilter=true`,
      }),
      updateWebAuthnDeviceName: builder.mutation<
        UpdatedWebAuthnDevice,
        WebAuthnQuery & { device: WebAuthnDevice }
      >({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `/json/realms/${realm}/users/${userId}/devices/2fa/webauthn/${device.uuid}`,
          method: 'PUT',
          body: device,
        }),
      }),
      deleteWebAuthnDeviceName: builder.mutation<
        UpdatedWebAuthnDevice,
        WebAuthnQuery & { device: UpdatedWebAuthnDevice | WebAuthnDevice }
      >({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `/json/realms/${realm}/users/${userId}/devices/2fa/webauthn/${device.uuid}`,
          method: 'DELETE',
          body: device,
        }),
      }),
      getBoundDevices: builder.mutation<GeneralResponse<Device[]>, GetBoundDevicesQuery>({
        query: ({ realm = realmPath, userId }) =>
          `/json/realms/${realm}/users/${userId}/devices/2fa/binding?_queryFilter=true`,
      }),
      updateBoundDevice: builder.mutation<Device, BoundDeviceQuery>({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `/json/realms/root/realms/${realm}/users/${userId}/devices/2fa/binding/${device.uuid}`,
          method: 'PUT',
          body: device,
        }),
      }),
      deleteBoundDevice: builder.mutation<GeneralResponse<Device>, BoundDeviceQuery>({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `/json/realms/root/realms/${realm}/users/${userId}/devices/2fa/binding/${device.uuid}`,
          method: 'DELETE',
          body: device satisfies Device,
        }),
      }),
      getDeviceProfiles: builder.query<GeneralResponse<ProfileDevice[]>, GetProfileDevices>({
        query: ({ realm = realmPath, userId }) =>
          `json/realms/${realm}/users/${userId}/devices/profile?_queryFilter=true`,
      }),
      updateDeviceProfile: builder.mutation<ProfileDevice, Omit<ProfileDevicesQuery, 'uuid'>>({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `json/realms/${realm}/users/${userId}/devices/profile/${device.identifier}`,
          method: 'PUT',
          body: device,
        }),
      }),
      deleteDeviceProfile: builder.mutation<ProfileDevice, ProfileDevicesQuery>({
        query: ({ realm = realmPath, userId, device }) => ({
          url: `json/realms/${realm}/users/${userId}/devices/profile/${device.identifier}`,
          method: 'DELETE',
          body: device,
        }),
      }),
    }),
  });
