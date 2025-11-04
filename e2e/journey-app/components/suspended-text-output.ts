/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { SuspendedTextOutputCallback } from '@forgerock/journey-client/types';

export default function suspendedTextOutputComponent(
  journeyEl: HTMLDivElement,
  callback: SuspendedTextOutputCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const container = document.createElement('div');
  const message = document.createElement('p');

  container.id = collectorKey;
  message.innerText =
    callback.getMessage() || 'Authentication is suspended. Please contact your admin.';
  message.style.cssText = `
    padding: 15px;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    color: #856404;
    margin: 10px 0;
  `;

  container.appendChild(message);
  journeyEl?.appendChild(container);

  console.log('Suspended text output callback:', callback.getMessage());
}
