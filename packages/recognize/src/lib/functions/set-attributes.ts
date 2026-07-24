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
