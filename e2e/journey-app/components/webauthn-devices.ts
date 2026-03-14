/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export function renderDeleteDevicesSection(
  journeyEl: HTMLDivElement,
  storeDevicesBeforeSession: () => Promise<string>,
  deleteDevicesInSession: () => Promise<string>,
  deleteAllDevices: () => Promise<string>,
): void {
  const getDevicesButton = document.createElement('button');
  getDevicesButton.type = 'button';
  getDevicesButton.id = 'getDevicesButton';
  getDevicesButton.innerText = 'Get Registered Devices';

  const deleteDevicesButton = document.createElement('button');
  deleteDevicesButton.type = 'button';
  deleteDevicesButton.id = 'deleteDevicesButton';
  deleteDevicesButton.innerText = 'Delete Devices From This Session';

  const deleteAllDevicesButton = document.createElement('button');
  deleteAllDevicesButton.type = 'button';
  deleteAllDevicesButton.id = 'deleteAllDevicesButton';
  deleteAllDevicesButton.innerText = 'Delete All Registered Devices';

  const deviceStatus = document.createElement('pre');
  deviceStatus.id = 'deviceStatus';
  deviceStatus.style.minHeight = '1.5em';

  journeyEl.appendChild(getDevicesButton);
  journeyEl.appendChild(deleteDevicesButton);
  journeyEl.appendChild(deleteAllDevicesButton);
  journeyEl.appendChild(deviceStatus);

  async function setDeviceStatus(
    progressStatus: string,
    action: () => Promise<string>,
    errorPrefix: string,
  ): Promise<void> {
    try {
      deviceStatus.innerText = progressStatus;

      const successMessage = await action();
      deviceStatus.innerText = successMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      deviceStatus.innerText = `${errorPrefix}: ${message}`;
    }
  }

  getDevicesButton.addEventListener('click', async () => {
    await setDeviceStatus(
      'Retrieving existing WebAuthn devices...',
      storeDevicesBeforeSession,
      'Get existing devices failed',
    );
  });

  deleteDevicesButton.addEventListener('click', async () => {
    await setDeviceStatus(
      'Deleting WebAuthn devices in this session...',
      deleteDevicesInSession,
      'Delete failed',
    );
  });

  deleteAllDevicesButton.addEventListener('click', async () => {
    await setDeviceStatus(
      'Deleting all registered WebAuthn devices...',
      deleteAllDevices,
      'Delete failed',
    );
  });
}
