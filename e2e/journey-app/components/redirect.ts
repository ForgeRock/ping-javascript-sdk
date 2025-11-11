/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { RedirectCallback } from '@forgerock/journey-client/types';

export default function redirectComponent(
  journeyEl: HTMLDivElement,
  callback: RedirectCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const message = document.createElement('p');
  const button = document.createElement('button');

  container.id = collectorKey;
  message.innerText = 'You will be redirected to complete authentication';
  button.innerText = 'Continue to External Provider';
  button.style.cssText = `
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 10px 0;
  `;

  container.appendChild(message);
  container.appendChild(button);
  journeyEl?.appendChild(container);

  button.addEventListener('click', () => {
    try {
      const redirectUrl = callback.getRedirectUrl();
      console.log('Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Redirect failed:', error);
    }
  });
}
