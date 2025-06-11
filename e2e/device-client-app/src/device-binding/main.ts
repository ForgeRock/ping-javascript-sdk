/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { Device } from '@forgerock/device-client/types';
import { Console, Effect } from 'effect';
import { LoginAndGetClient, handleError } from '../autoscript.js';
import { getUser } from '../util-effects/index.js';

/**
 * @function handleDeviceBinding
 * @description Handles device binding management operations such as getting, updating, and deleting devices
 * @param {DeviceClient} client A device client instance from the JS SDK
 * @returns {Effect.Effect<void, Error, never>} An Effect that performs device binding management operations
 */

const deviceBinding = Effect.gen(function* () {
  const client = yield* LoginAndGetClient;
  const user = yield* getUser;
  const query = {
    userId: user.sub,
    realm: 'alpha',
  };

  const deviceArr = yield* Effect.promise(() => client.bound.get(query));

  if (!deviceArr || 'error' in deviceArr) {
    yield* Console.log('No devices found or error occurred', deviceArr);
    return yield* Effect.fail(new Error('No devices found or error occurred'));
  }
  yield* Console.log('GET devices', deviceArr);

  const [device] = deviceArr;

  yield* Console.log('device', device);

  const updatedDevice = yield* Effect.promise(() =>
    client.bound.update({
      ...query,
      device: { ...device, deviceName: 'UpdatedDeviceName' },
    }),
  );

  if ('error' in updatedDevice) {
    return yield* Effect.fail(new Error(`Failed to update device: ${updatedDevice.error}`));
  }

  yield* Console.log('updated device', updatedDevice);

  const deletedDevice = yield* Effect.promise(() =>
    client.bound.delete({
      ...query,
      device: updatedDevice as Device,
    }),
  );

  if (deletedDevice !== null && deletedDevice.error) {
    return yield* Effect.fail(new Error(`Failed to delete device: ${deletedDevice.error}`));
  }

  yield* Console.log('deleted', deletedDevice);
});

Effect.runPromise(deviceBinding).then(console.log).catch(handleError);
