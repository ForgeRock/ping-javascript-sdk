/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ReadOnlyCollector } from '@forgerock/davinci-client/types';

export default function (formEl: HTMLFormElement, collector: ReadOnlyCollector) {
  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-line';
  const { richContent } = collector.output;

  if (richContent.replacements.length === 0) {
    p.innerText = collector.output.content;
    formEl?.appendChild(p);
    return;
  }

  // Interpolate the template by splitting on {{key}} and inserting links
  const segments = richContent.content.split(/\{\{(\w+)\}\}/);
  const replacementMap = new Map(richContent.replacements.map((r) => [r.key, r]));

  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 0) {
      // Text segment
      if (segments[i]) {
        p.appendChild(document.createTextNode(segments[i]));
      }
    } else {
      // Replacement key
      const replacement = replacementMap.get(segments[i]);
      if (replacement?.type === 'link') {
        const a = document.createElement('a');
        a.href = replacement.href;
        a.textContent = replacement.value;
        if (replacement.target) {
          a.target = replacement.target;
          if (replacement.target === '_blank') {
            a.rel = 'noopener noreferrer';
          }
        }
        p.appendChild(a);
      }
    }
  }

  formEl?.appendChild(p);
}
