/*
 *
 * Copyright (c) 2026 Ping Identity Corporation. All right reserved.
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

/** @internal */
// Webpack rewrites import.meta.url in the vendored SDK to a file:// path the browser cannot
// fetch; a literal new URL(..., import.meta.url) here lets webpack resolve the WASM files
// and emit them as assets.
export const DEFAULT_WASM_BINARY_URL = new URL('../recognize-sdk/wasm.wasm', import.meta.url).href;
export const DEFAULT_WASM_DATA_URL = new URL('../recognize-sdk/wasm.data', import.meta.url).href;
export const DEFAULT_WASM_SCRIPT_URL = new URL('../recognize-sdk/wasm.js', import.meta.url).href;
