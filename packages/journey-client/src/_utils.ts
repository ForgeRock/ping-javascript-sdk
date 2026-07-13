/**
 * @private
 * @description Creates a decorated `Step` object with convenience functions.
 * Used mostly for mocking and some advanced, edge cases.
 */
export { createJourneyStep } from './lib/step.utils.js';
export type { JourneyStep } from './lib/step.types.js';
export type { CallbackFactory } from './lib/callbacks/factory.js';
export { BaseCallback } from './lib/callbacks/base-callback.js';
