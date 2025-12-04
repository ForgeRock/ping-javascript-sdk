/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { RecoveryCodes } from '@forgerock/journey-client/recovery-codes';
import type { JourneyStep, ConfirmationCallback } from '@forgerock/journey-client/types';

export function renderRecoveryCodesStep(journeyEl: HTMLDivElement, step: JourneyStep): boolean {
  if (!RecoveryCodes.isDisplayStep(step)) {
    return false;
  }

  const codes = RecoveryCodes.getCodes(step);
  const deviceName = RecoveryCodes.getDeviceName(step);

  console.log('Recovery Codes step detected via RecoveryCodes module');
  console.log('Recovery codes:', JSON.stringify(codes));
  console.log('Device name:', deviceName);

  const container = document.createElement('div');
  container.id = 'recovery-codes-container';

  const header = document.createElement('h3');
  header.id = 'recovery-codes-header';
  header.innerText = 'Your Recovery Codes';
  container.appendChild(header);

  const instruction = document.createElement('p');
  instruction.innerText =
    'You must make a copy of these recovery codes. They cannot be displayed again.';
  instruction.style.color = '#666';
  container.appendChild(instruction);

  const codesContainer = document.createElement('div');
  codesContainer.id = 'recovery-codes-list';
  codesContainer.style.cssText = `
    padding: 15px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    margin: 10px 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  `;

  codes.forEach((code, index) => {
    const codeEl = document.createElement('div');
    codeEl.className = 'recovery-code';
    codeEl.setAttribute('data-code-index', String(index));
    codeEl.innerText = code;
    codeEl.style.cssText = `
      padding: 5px 10px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 3px;
      text-align: center;
    `;
    codesContainer.appendChild(codeEl);
  });

  container.appendChild(codesContainer);

  if (deviceName) {
    const deviceInfo = document.createElement('p');
    deviceInfo.id = 'recovery-codes-device';
    deviceInfo.innerText = `Device: ${deviceName}`;
    deviceInfo.style.color = '#666';
    container.appendChild(deviceInfo);
  }

  const confirmationCallbacks =
    step.getCallbacksOfType<ConfirmationCallback>('ConfirmationCallback');

  if (confirmationCallbacks.length > 0) {
    const confirmCb = confirmationCallbacks[0];
    const options = confirmCb.getOptions();

    const optionsContainer = document.createElement('div');
    optionsContainer.style.marginTop = '15px';

    options.forEach((option, index) => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '5px';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'recovery-confirmation';
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
