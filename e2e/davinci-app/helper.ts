/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { CollectorRichContent } from '@forgerock/davinci-client';

export function dotToCamelCase(str: string) {
  return str
    .split('.')
    .map((part: string, index: number) =>
      index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join('');
}

// Interpolate the template by splitting on {{key}} and inserting links
export function richContentInterpolation(richContent: CollectorRichContent): HTMLParagraphElement {
  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-line';

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

  return p;
}
