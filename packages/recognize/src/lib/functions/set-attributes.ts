/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type {
  RecognizeWebComponent,
  RecognizeWebComponentConfiguration,
} from '../recognize.types.js';

export function setAttributes(
  element: RecognizeWebComponent,
  config: RecognizeWebComponentConfiguration,
): void {
  for (const [k, v] of Object.entries(config)) {
    element[k as keyof RecognizeWebComponentConfiguration] = v;
  }
}
