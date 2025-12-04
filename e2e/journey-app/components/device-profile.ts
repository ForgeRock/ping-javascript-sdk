/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Device } from '@forgerock/journey-client/device';
import type { DeviceProfileCallback } from '@forgerock/journey-client/types';

/**
 * Device Profile Component
 * Automatically collects device metadata and location data using the Device class
 */
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

  // Automatically trigger device profile collection
  setTimeout(async () => {
    try {
      const isLocationRequired = callback.isLocationRequired();
      const isMetadataRequired = callback.isMetadataRequired();

      console.log('Collecting device profile...', { isLocationRequired, isMetadataRequired });

      // Create device instance and collect profile
      const device = new Device();
      const profile = await device.getProfile({
        location: isLocationRequired,
        metadata: isMetadataRequired,
      });

      console.log('Device profile collected successfully');

      // Set the profile on the callback
      callback.setProfile(profile);
      message.innerText = 'Device profile collected successfully!';
      message.style.color = 'green';

      // Auto-submit the form after successful collection
      setTimeout(() => {
        const form = document.getElementById('form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }, 500);
    } catch (error) {
      console.error('Device profile collection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.innerText = `Collection failed: ${errorMessage}`;
      message.style.color = 'red';
    }
  }, 100);
}
