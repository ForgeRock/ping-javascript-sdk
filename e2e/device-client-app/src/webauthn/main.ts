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
import { UpdatedWebAuthnDevice } from '@forgerock/device-client/types';

async function handleWebAuthN(client: DeviceClient) {
  try {
    const user = await UserManager.getCurrentUser();

    const query = { userId: (user as Record<string, string>).sub, realm: 'alpha' };

    const deviceArr = await client.webAuthn.get(query);
    console.log('GET devices', deviceArr);

    if (Array.isArray(deviceArr)) {
      const [device] = deviceArr;
      console.log('device', device);

      if (device) {
        const updatedDevice = await client.webAuthn.update({
          ...query,
          device: { ...device, deviceName: 'UpdatedDeviceName' },
        });
        console.log('updated device', updatedDevice);

        const deletedDevice = await client.webAuthn.delete({
          ...query,
          device: updatedDevice as UpdatedWebAuthnDevice,
        });
        console.log('deleted', deletedDevice);
      } else {
        console.log('No device to update or delete');
      }
    }
  } catch (err) {
    console.log('failed', err);
  }
}

autoscript(handleWebAuthN);
