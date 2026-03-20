/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export function renderDeleteDevicesSection(
  journeyEl: HTMLDivElement,
  deleteWebAuthnDevice: () => Promise<string>,
): void {
  const deleteWebAuthnDeviceButton = document.createElement('button');
  deleteWebAuthnDeviceButton.type = 'button';
  deleteWebAuthnDeviceButton.id = 'deleteWebAuthnDeviceButton';
  deleteWebAuthnDeviceButton.innerText = 'Delete Webauthn Device';

  const deviceStatus = document.createElement('pre');
  deviceStatus.id = 'deviceStatus';
  deviceStatus.style.minHeight = '1.5em';

  journeyEl.appendChild(deleteWebAuthnDeviceButton);
  journeyEl.appendChild(deviceStatus);

  deleteWebAuthnDeviceButton.addEventListener('click', async () => {
    try {
      deviceStatus.innerText = 'Deleting WebAuthn device...';
      deviceStatus.innerText = await deleteWebAuthnDevice();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      deviceStatus.innerText = `Delete failed: ${message}`;
    }
  });
}
