/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { type ConfigOptions } from '@forgerock/javascript-sdk';
import { configureStore } from '@reduxjs/toolkit';
import { deviceService } from './services/index.js';
import { OathDevice, RetrieveOathQuery } from './types/oath.types.js';
import { DeleteDeviceQuery, PushDevice, PushDeviceQuery } from './types/push-device.types.js';
import { UpdatedWebAuthnDevice, WebAuthnDevice, WebAuthnQuery } from './types/webauthn.types.js';
import { BoundDeviceQuery, Device, GetBoundDevicesQuery } from './types/bound-device.types.js';
import {
  GetProfileDevices,
  ProfileDevice,
  ProfileDevicesQuery,
} from './types/profile-device.types.js';
import { handleError } from './device.store.utils.js';

export const deviceClient = (config: ConfigOptions) => {
  const { middleware, reducerPath, reducer, endpoints } = deviceService({
    baseUrl: config.serverConfig?.baseUrl ?? '',
    realmPath: config?.realmPath ?? '',
  });

  const store = configureStore({
    reducer: {
      [reducerPath]: reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
  });

  /**
   * Device management object containing methods for handling various device types.
   *
   * @type {DeviceManagement}
   */
  return {
    /**
     * Oath device management methods.
     *
     * @type {OathManagement}
     */
    oath: {
      /**
       * Retrieves Oath devices based on the specified query.
       *
       * @async
       * @function get
       * @param {RetrieveOathQuery} query - The query used to retrieve Oath devices.
       * @returns {Promise<OathDevice[] | { error: unknown }>} - A promise that resolves to the retrieved data or an error object if the response is not valid.
       */
      get: async function (query: RetrieveOathQuery): Promise<OathDevice[] | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.getOathDevices.initiate(query));

          if (!response || !response.data || !response.data.result) {
            throw new Error('response did not contain data');
          }

          return response.data.result;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Deletes an Oath device based on the provided query and device information.
       *
       * @async
       * @function delete
       * @param {DeleteOathQuery & OathDevice} query - The query and device information used to delete the Oath device.
       * @returns {Promise<null | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      delete: async function (
        query: RetrieveOathQuery & { device: OathDevice },
      ): Promise<null | { error: unknown }> {
        try {
          const { error } = await store.dispatch(endpoints.deleteOathDevice.initiate(query));

          if (error) {
            handleError(error, 'Failed to delete device: ');
          }

          return null;
        } catch (error) {
          return { error };
        }
      },
    },

    /**
     * Push device management methods.
     *
     * @type {PushManagement}
     */
    push: {
      /**
       * Retrieves Push devices based on the specified query.
       *
       * @async
       * @function get
       * @param {PushDeviceQuery} query - The query used to retrieve Push devices.
       * @returns {Promise<PushDevice[] | { error: unknown }>} - A promise that resolves to the retrieved data or an error object if the response is not valid.
       */
      get: async function (query: PushDeviceQuery): Promise<PushDevice[] | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.getPushDevices.initiate(query));

          if (!response || !response.data || !response.data.result) {
            throw new Error('response did not contain data');
          }

          return response.data.result;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Deletes a Push device based on the provided query.
       *
       * @async
       * @function delete
       * @param {DeleteDeviceQuery} query - The query used to delete the Push device.
       * @returns {Promise<null | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      delete: async function (query: DeleteDeviceQuery): Promise<null | { error: unknown }> {
        try {
          const { error } = await store.dispatch(endpoints.deletePushDevice.initiate(query));

          if (error) {
            handleError(error, 'Failed to delete device: ');
          }

          return null;
        } catch (error) {
          return { error };
        }
      },
    },

    /**
     * WebAuthn device management methods.
     *
     * @type {WebAuthnManagement}
     */
    webAuthn: {
      /**
       * Retrieves WebAuthn devices based on the specified query.
       *
       * @async
       * @function get
       * @param {WebAuthnQuery} query - The query used to retrieve WebAuthn devices.
       * @returns {Promise<WebAuthnDevicesResponse | { error: unknown }>} - A promise that resolves to the retrieved data or an error object if the response is not valid.
       */
      get: async function (query: WebAuthnQuery): Promise<WebAuthnDevice[] | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.getWebAuthnDevices.initiate(query));

          if (!response || !response.data || !response.data.result) {
            throw new Error('response did not contain data');
          }

          return response.data.result;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Updates the name of a WebAuthn device based on the provided query and body.
       *
       * @async
       * @function update
       * @param {WebAuthnQueryWithUUID & { device: WebAuthnBody } } query - The query and body used to update the WebAuthn device name.
       * @returns {Promise<UpdatedWebAuthnDevice | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      update: async function (
        query: WebAuthnQuery & { device: WebAuthnDevice },
      ): Promise<UpdatedWebAuthnDevice | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.updateWebAuthnDeviceName.initiate(query));

          if (!response || !response.data) {
            throw new Error('response did not contain data');
          }

          return response.data;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Deletes a WebAuthn device based on the provided query and body.
       *
       * @async
       * @function delete
       * @param {WebAuthnQueryWithUUID & { device: WebAuthnBody } } query - The query and body used to delete the WebAuthn device.
       * @returns {Promise<null | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      delete: async function (
        query: WebAuthnQuery & { device: WebAuthnDevice | UpdatedWebAuthnDevice },
      ): Promise<null | { error: unknown }> {
        try {
          const { error } = await store.dispatch(
            endpoints.deleteWebAuthnDeviceName.initiate(query),
          );

          if (error) {
            handleError(error, 'Failed to delete device: ');
          }

          return null;
        } catch (error) {
          return { error };
        }
      },
    },

    /**
     * Bound devices management methods.
     *
     * @type {BoundDevicesManagement}
     */
    bound: {
      /**
       * Retrieves bound devices based on the specified query.
       *
       * @async
       * @function get
       * @param {BoundDeviceQuery} query - The query used to retrieve bound devices.
       * @returns {Promise<Device[] | { error: unknown }>} - A promise that resolves to the retrieved data or an error object if the response is not valid.
       */
      get: async function (query: GetBoundDevicesQuery): Promise<Device[] | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.getBoundDevices.initiate(query));

          if (!response || !response.data || !response.data.result) {
            throw new Error('response did not contain data');
          }

          return response.data.result;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Deletes a bound device based on the provided query.
       *
       * @async
       * @function delete
       * @param {BoundDeviceQuery} query - The query used to delete the bound device.
       * @returns {Promise<null | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      delete: async function (query: BoundDeviceQuery): Promise<null | { error: unknown }> {
        try {
          const { error } = await store.dispatch(endpoints.deleteBoundDevice.initiate(query));

          if (error) {
            handleError(error, 'Failed to delete device: ');
          }

          return null;
        } catch (error) {
          return { error };
        }
      },

      /**
       * Updates the name of a bound device based on the provided query.
       *
       * @async
       * @function update
       * @param {BoundDeviceQuery} query - The query used to update the bound device name.
       * @returns {Promise<Device | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      update: async function (query: BoundDeviceQuery): Promise<Device | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.updateBoundDevice.initiate(query));

          if (!response || !response.data) {
            throw new Error('response did not contain data');
          }

          return response.data;
        } catch (error) {
          return { error };
        }
      },
    },
    profile: {
      /**
       * Get profile devices
       *
       * @async
       * @function update
       * @param {GetProfileDevice} query - The query used to get profile devices
       * @returns {Promise<Device[] | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      get: async function (
        query: GetProfileDevices,
      ): Promise<ProfileDevice[] | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.getDeviceProfiles.initiate(query));

          if (!response || !response.data || !response.data.result) {
            throw new Error('response did not contain data');
          }

          return response.data.result;
        } catch (error) {
          return { error };
        }
      },
      /**
       * Get profile devices
       *
       * @async
       * @function update
       * @param {ProfileDevicesQuery} query - The query used to update a profile device
       * @returns {Promise<ProfileDevice | { error: unknown }>} - A promise that resolves to the response data or or an error object if the response is not valid.
       */
      update: async function (
        query: ProfileDevicesQuery,
      ): Promise<ProfileDevice | { error: unknown }> {
        try {
          const response = await store.dispatch(endpoints.updateDeviceProfile.initiate(query));

          if (!response || !response.data) {
            throw new Error('response did not contain data');
          }

          return response.data;
        } catch (error) {
          return { error };
        }
      },
      /**
       * Get profile devices
       *
       * @async
       * @function update
       * @param {ProfileDevicesQuery} query - The query used to update a profile device
       * @returns {Promise<null | { error: unknown }>} - A promise that resolves to the response data or an error object if the response is not valid.
       */
      delete: async function (query: ProfileDevicesQuery): Promise<null | { error: unknown }> {
        try {
          const { error } = await store.dispatch(endpoints.deleteDeviceProfile.initiate(query));

          if (error) {
            handleError(error, 'Failed to delete device profile: ');
          }

          return null;
        } catch (error) {
          return { error };
        }
      },
    },
  };
};
