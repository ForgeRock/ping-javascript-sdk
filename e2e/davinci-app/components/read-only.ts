/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ReadOnlyCollector, RichTextCollector } from '@forgerock/davinci-client/types';
import { richContentInterpolation } from '../helper.js';

export default function (
  formEl: HTMLFormElement,
  collector: ReadOnlyCollector | RichTextCollector,
) {
  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-line';

  if (collector.type === 'ReadOnlyCollector') {
    // Display agreement title if it exists
    if (collector.output.title) {
      const titleEl = document.createElement('h3');
      titleEl.innerText = collector.output.title;
      formEl?.appendChild(titleEl);
    }

    p.innerText = collector.output.content;
    formEl?.appendChild(p);
  } else if (collector.type === 'RichTextCollector') {
    const { richContent } = collector.output;

    if (richContent.replacements.length === 0) {
      p.innerText = collector.output.content;
      formEl?.appendChild(p);
      return;
    }

    // Interpolate the template by splitting on {{key}} and inserting links
    const pRichText = richContentInterpolation(richContent);

    formEl?.appendChild(pRichText);
  }
}
