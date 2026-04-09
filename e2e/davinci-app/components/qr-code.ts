/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { QrCodeCollector } from '@forgerock/davinci-client/types';

export default function (formEl: HTMLFormElement, collector: QrCodeCollector) {
  if (collector.error) {
    const errorEl = document.createElement('p');
    errorEl.innerText = `QR Code error: ${collector.error}`;
    formEl.appendChild(errorEl);
    return;
  }

  const container = document.createElement('div');

  const img = document.createElement('img');
  img.src = collector.output.src;
  img.alt = 'QR Code';
  img.setAttribute('data-testid', 'qr-code-image');
  container.appendChild(img);

  if (collector.output.label) {
    const fallback = document.createElement('p');
    fallback.innerText = `Manual code: ${collector.output.label}`;
    fallback.setAttribute('data-testid', 'qr-code-fallback');
    container.appendChild(fallback);
  }

  formEl.appendChild(container);
}
