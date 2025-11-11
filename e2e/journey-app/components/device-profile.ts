/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { DeviceProfileCallback } from '@forgerock/journey-client/types';

export default function deviceProfileComponent(
  journeyEl: HTMLDivElement,
  callback: DeviceProfileCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Collecting device profile information...';

  journeyEl?.appendChild(message);

  // Device profile callback typically runs automatically
  // The callback will collect device information in the background
  setTimeout(() => {
    try {
      // Device profile collection is typically handled automatically by the callback
      console.log('Device profile collection initiated');
    } catch (error) {
      console.error('Device profile collection failed:', error);
    }
  }, 100);
}
