/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PollingWaitCallback } from '@forgerock/journey-client/types';

export default function pollingWaitComponent(
  journeyEl: HTMLDivElement,
  callback: PollingWaitCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const message = document.createElement('p');
  const spinner = document.createElement('div');

  container.id = collectorKey;
  message.innerText = callback.getMessage() || 'Please wait...';

  // Simple spinner
  spinner.style.cssText = `
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 10px 0;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  container.appendChild(message);
  container.appendChild(spinner);
  journeyEl?.appendChild(container);

  // TODO: Use set timeout to submit for after delay
}
