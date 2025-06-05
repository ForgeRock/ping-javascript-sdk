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

async function handlePush(client: DeviceClient) {
  try {
    const user = await UserManager.getCurrentUser();

    const query = { userId: (user as Record<string, string>).sub, realm: 'alpha' };

    const deviceArr = await client.push.get(query);
    console.log('GET devices', deviceArr);

    if (Array.isArray(deviceArr)) {
      const [device] = deviceArr;
      console.log('device', device);

      if (device) {
        const deletedDevice = await client.push.delete({
          ...query,
          device,
        });
        console.log('deleted', deletedDevice);
      } else {
        console.log('No device to delete');
      }
    }
  } catch (err) {
    console.log('failed', err);
  }
}

autoscript(handlePush);
