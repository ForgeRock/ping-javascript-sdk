/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { handleError, LoginAndGetClient } from '../autoscript.js';
import { ProfileDevice } from '@forgerock/device-client/types';
import { Effect } from 'effect';
import { getUser } from '../util-effects/index.js';

/**
 * @function handleDeviceProfile
 * @description Handles device profile management operations such as getting, updating, and deleting devices
 * @param {DeviceClient} client A device client instance from the JS SDK
 * @returns {Effect.Effect<void, Error, never>} An Effect that performs device profile management operations
 */
const handleDeviceProfile = Effect.gen(function* () {
    const client = yield* LoginAndGetClient
    const user = yield* getUser;


    const query = {
      userId: (user as Record<string, string>).sub,
      realm: 'alpha',
    };

    const profileArr = yield* Effect.promise(() => client.profile.get(query));
    console.log('GET devices', profileArr);

    if (Array.isArray(profileArr)) {
      const [profile] = profileArr;

      if (!profile) {
        yield* Effect.fail(new Error('No profile to delete'));
      }
      console.log('profile', profile);

      const updatedProfile = yield* Effect.promise(() =>
        client.profile.update({
          ...query,
          device: { ...profile, alias: 'UpdatedDeviceName' },
        }),
      );

      if ('error' in updatedProfile) {
        yield* Effect.fail(new Error(`Failed to update device: ${updatedProfile.error}`));
      }
      console.log('updated device', updatedProfile);

      const deletedProfile = yield* Effect.promise(() =>
        client.profile.delete({
          ...query,
          device: updatedProfile as ProfileDevice,
        }),
      );

      if (deletedProfile !== null && deletedProfile.error) {
        yield* Effect.fail(new Error(`Failed to delete device: ${deletedProfile.error}`));
      }

      console.log('deleted', deletedProfile);
    } else {
      yield* Effect.fail(new Error(`Failed to get devices: ${profileArr.error}`));
    }
  });
}

// Execute the device test
Effect.runPromise(handleDeviceProfile).then(console.log, handleError);
