/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ReCaptchaEnterpriseCallback } from '@forgerock/journey-client/types';

export default function recaptchaEnterpriseComponent(
  journeyEl: HTMLDivElement,
  callback: ReCaptchaEnterpriseCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const message = document.createElement('p');

  container.id = collectorKey;
  message.innerText = 'Please complete the reCAPTCHA Enterprise challenge';

  // Create placeholder div for reCAPTCHA Enterprise
  const recaptchaDiv = document.createElement('div');
  recaptchaDiv.id = `recaptcha-enterprise-${collectorKey}`;
  recaptchaDiv.style.cssText = `
    border: 1px solid #ccc;
    padding: 20px;
    text-align: center;
    background-color: #f0f8ff;
    margin: 10px 0;
  `;
  recaptchaDiv.innerText =
    'reCAPTCHA Enterprise placeholder (requires reCAPTCHA Enterprise script)';

  container.appendChild(message);
  container.appendChild(recaptchaDiv);
  journeyEl?.appendChild(container);

  // In a real implementation, you would load the reCAPTCHA Enterprise script
  // and initialize the widget here
  console.log('reCAPTCHA Enterprise callback initialized');

  // TODO: Implement reCAPTCHA Enterprise integration here
}
