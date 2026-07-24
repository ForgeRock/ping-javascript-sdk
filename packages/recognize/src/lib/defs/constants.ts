/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import type { KeylessComponentsStep } from '../recognize-sdk/index.js';

/** @internal */
export const CAMERA_ONLY_DISABLE_STEPS: KeylessComponentsStep[] = [
  'bootstrap',
  'camera-instructions',
  'camera-permission',
  'done',
  'error',
  'server-computation',
  'stm-choice',
  'stm-qrcode',
];
