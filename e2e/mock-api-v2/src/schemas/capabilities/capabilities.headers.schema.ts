import { Schema } from 'effect';

export const CapabilitiesHeaders = Schema.Struct({
  'X-Requested-With': Schema.String,
  interactionId: Schema.String,
  interactionToken: Schema.String,
  'Content-Type': Schema.String,
});
