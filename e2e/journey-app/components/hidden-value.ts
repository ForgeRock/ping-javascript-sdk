/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { HiddenValueCallback } from '@forgerock/journey-client/types';

export default function hiddenValueComponent(
  journeyEl: HTMLDivElement,
  callback: HiddenValueCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const input = document.createElement('input');

  input.type = 'hidden';
  input.id = collectorKey;
  input.name = collectorKey;
  input.value = String(callback.getInputValue() || '');

  journeyEl?.appendChild(input);

  // Hidden value callback typically doesn't require user interaction
  // The value is usually set programmatically or by the server
}
