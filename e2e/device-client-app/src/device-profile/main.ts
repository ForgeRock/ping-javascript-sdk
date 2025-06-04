/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { UserManager } from '@forgerock/javascript-sdk';
import { autoscript } from '../autoscript.js';
import { DeviceClient } from '../types.js';
import { ProfileDevice } from '@forgerock/device-client/types';

async function handleDeviceProfile(client: DeviceClient) {
  try {
    const user = await UserManager.getCurrentUser();

    const query = { userId: (user as Record<string, string>).sub, realm: 'alpha' };

    const profileArr = await client.profile.get(query);
    console.log('GET profiles', profileArr);

    if (Array.isArray(profileArr)) {
      const [profile] = profileArr;
      console.log('profile', profile);

      if (profile) {
        const updatedProfile = await client.profile.update({
          ...query,
          device: { ...profile, alias: 'UpdatedProfile' },
        });
        console.log('updated profile', updatedProfile);

        const deletedProfile = await client.profile.delete({
          ...query,
          device: updatedProfile as ProfileDevice,
        });
        console.log('deleted', deletedProfile);
      } else {
        console.log('No profile to update or delete');
      }
    }
  } catch (err) {
    console.log('failed', err);
  }
}

autoscript(handleDeviceProfile);
