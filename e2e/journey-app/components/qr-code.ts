/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { QRCode } from '@forgerock/journey-client/qr-code';
import type { JourneyStep, ConfirmationCallback } from '@forgerock/journey-client/types';

export function renderQRCodeStep(journeyEl: HTMLDivElement, step: JourneyStep): boolean {
  if (!QRCode.isQRCodeStep(step)) {
    return false;
  }

  const qrCodeData = QRCode.getQRCodeData(step);

  console.log('QR Code step detected via QRCode module');
  console.log('QR Code data:', JSON.stringify(qrCodeData));

  const container = document.createElement('div');
  container.id = 'qr-code-container';

  const message = document.createElement('p');
  message.id = 'qr-code-message';
  message.innerText = qrCodeData.message || 'Scan the QR code below';
  container.appendChild(message);

  const uriDisplay = document.createElement('div');
  uriDisplay.id = 'qr-code-uri';
  uriDisplay.style.cssText = `
    padding: 10px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
    margin: 10px 0;
  `;
  uriDisplay.innerText = qrCodeData.uri;
  container.appendChild(uriDisplay);

  const useType = document.createElement('p');
  useType.id = 'qr-code-use-type';
  useType.innerText = `Type: ${qrCodeData.use}`;
  useType.style.color = '#666';
  container.appendChild(useType);

  const confirmationCallbacks =
    step.getCallbacksOfType<ConfirmationCallback>('ConfirmationCallback');

  if (confirmationCallbacks.length > 0) {
    const confirmCb = confirmationCallbacks[0];
    const options = confirmCb.getOptions();

    const optionsContainer = document.createElement('div');
    optionsContainer.style.marginTop = '10px';

    options.forEach((option, index) => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '5px';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'qr-confirmation';
      radio.value = String(index);
      radio.checked = index === confirmCb.getDefaultOption();
      radio.addEventListener('change', () => {
        confirmCb.setOptionIndex(index);
      });

      if (index === confirmCb.getDefaultOption()) {
        confirmCb.setOptionIndex(index);
      }

      label.appendChild(radio);
      label.appendChild(document.createTextNode(` ${option}`));
      optionsContainer.appendChild(label);
    });

    container.appendChild(optionsContainer);
  }

  journeyEl.appendChild(container);

  return true;
}
