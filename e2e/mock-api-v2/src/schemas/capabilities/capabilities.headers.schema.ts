import { Schema } from 'effect';

export const CapabilitiesHeaders = Schema.Struct({
  'X-Requested-With': Schema.optional(Schema.String),
  interactionId: Schema.optional(Schema.String),
  interactionToken: Schema.optional(Schema.String),
  'Content-Type': Schema.optional(Schema.String),
});
