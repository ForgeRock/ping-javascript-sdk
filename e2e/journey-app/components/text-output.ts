/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { TextOutputCallback } from '@forgerock/journey-client/types';

export default function textComponent(
  journeyEl: HTMLDivElement,
  callback: TextOutputCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = callback.getMessage() || '';
  const p = document.createElement('paragraph');

  p.innerText = message;
  p.id = collectorKey;

  console.log(message);

  journeyEl?.appendChild(p);
}
