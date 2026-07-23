import type { KeylessComponentsStep } from '../recognize-sdk/index.js';

/** @internal */
export const CAMERA_ONLY_DISABLE_STEPS: KeylessComponentsStep[] = [
  'bootstrap',
  'camera-instructions',
  'done',
  'error',
  'server-computation',
  'stm-choice',
  'stm-qrcode',
];
