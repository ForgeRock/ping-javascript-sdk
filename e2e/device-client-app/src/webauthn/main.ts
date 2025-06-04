/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { UserManager } from '@forgerock/javascript-sdk';
import { autoscript, handleError } from '../autoscript.js';
import { DeviceClient } from '../types.js';
import { UpdatedWebAuthnDevice } from '@forgerock/device-client/types';
import { Effect } from 'effect';

/**
 * @function handleWebAuthN
 * @description Handles WebAuthN device management operations such as getting, updating, and deleting devices
 * @param {DeviceClient} client A device client instance from the JS SDK
 * @returns {Effect.Effect<void, Error, never>} An Effect that performs WebAuthN device management operations
 */
function handleWebAuthN(client: DeviceClient): Effect.Effect<void, Error, never> {
  return Effect.gen(function* () {
    const user = yield* Effect.tryPromise({
      try: () => UserManager.getCurrentUser(),
      catch: (err) => new Error(`Failed to get current user: ${err}`),
    });

    const query = {
      userId: (user as Record<string, string>).sub,
      realm: 'alpha',
    };

    const deviceArr = yield* Effect.promise(() => client.webAuthn.get(query));
    console.log('GET devices', deviceArr);

    if (Array.isArray(deviceArr)) {
      const [device] = deviceArr;

      if (!device) {
        yield* Effect.fail(new Error('No device to delete'));
      }
      console.log('device', device);

      const updatedDevice = yield* Effect.promise(() =>
        client.webAuthn.update({
          ...query,
          device: { ...device, deviceName: 'UpdatedDeviceName' },
        }),
      );

      if ('error' in updatedDevice) {
        yield* Effect.fail(new Error(`Failed to update device: ${updatedDevice.error}`));
      }
      console.log('updated device', updatedDevice);

      const deletedDevice = yield* Effect.promise(() =>
        client.webAuthn.delete({
          ...query,
          device: updatedDevice as UpdatedWebAuthnDevice,
        }),
      );

      if (deletedDevice !== null && deletedDevice.error) {
        yield* Effect.fail(new Error(`Failed to delete device: ${deletedDevice.error}`));
      }

      console.log('deleted', deletedDevice);
    } else {
      yield* Effect.fail(new Error(`Failed to get devices: ${deviceArr.error}`));
    }
  });
}

// Execute the device test
Effect.runPromise(autoscript(handleWebAuthN)).then(console.log, handleError);
