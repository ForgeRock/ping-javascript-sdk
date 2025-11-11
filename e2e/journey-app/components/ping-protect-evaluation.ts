/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PingOneProtectEvaluationCallback } from '@forgerock/journey-client/types';

export default function pingProtectEvaluationComponent(
  journeyEl: HTMLDivElement,
  callback: PingOneProtectEvaluationCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Evaluating risk assessment...';

  journeyEl?.appendChild(message);

  // TODO: Implement PingOne Protect module evaluation here
}
