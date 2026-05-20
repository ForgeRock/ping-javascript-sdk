/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
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

  if (collector.type !== 'RichTextCollector') {
    p.innerText = collector.output.content;
    formEl?.appendChild(p);
    return;
  }

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
