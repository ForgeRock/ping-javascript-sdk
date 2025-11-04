/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { MetadataCallback } from '@forgerock/journey-client/types';

export default function metadataComponent(
  journeyEl: HTMLDivElement,
  callback: MetadataCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;

  // Metadata callback typically doesn't render UI elements
  // It's used to pass metadata information
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.id = collectorKey;
  hiddenInput.name = collectorKey;
  hiddenInput.value = JSON.stringify(callback.getData());

  journeyEl?.appendChild(hiddenInput);

  console.log('Metadata callback data:', callback.getData());
}
