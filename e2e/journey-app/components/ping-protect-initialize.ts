/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PingOneProtectInitializeCallback } from '@forgerock/journey-client/types';

export default function pingProtectInitializeComponent(
  journeyEl: HTMLDivElement,
  callback: PingOneProtectInitializeCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Initializing PingOne Protect...';

  journeyEl?.appendChild(message);

  // TODO: Implement PingOne Protect module initialization here
}
