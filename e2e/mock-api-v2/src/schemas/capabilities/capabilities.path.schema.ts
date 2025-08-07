import { Schema } from 'effect';

export const CapabilitiesPathParams = Schema.Struct({
  envid: Schema.String,
  connectionID: Schema.String,
  capabilityName: Schema.String,
});
