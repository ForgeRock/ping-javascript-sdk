import type { Schema } from 'effect';
import type {
  AuthEventSchema,
  AuthEventTypeSchema,
  AuthEventFlagsSchema,
  NetworkDataSchema,
  SdkDataSchema,
  SdkConfigDataSchema,
  DomDataSchema,
  SessionDataSchema,
  JourneyDataSchema,
  OidcDataSchema,
} from './auth-event.schema.js';

export type AuthEventType = Schema.Schema.Type<typeof AuthEventTypeSchema>;
export type AuthEventFlags = Schema.Schema.Type<typeof AuthEventFlagsSchema>;
export type NetworkData = Schema.Schema.Type<typeof NetworkDataSchema>;
export type SdkData = Schema.Schema.Type<typeof SdkDataSchema>;
export type SdkConfigData = Schema.Schema.Type<typeof SdkConfigDataSchema>;
export type DomData = Schema.Schema.Type<typeof DomDataSchema>;
export type SessionData = Schema.Schema.Type<typeof SessionDataSchema>;
export type JourneyData = Schema.Schema.Type<typeof JourneyDataSchema>;
export type OidcData = Schema.Schema.Type<typeof OidcDataSchema>;
export type AuthEvent = Schema.Schema.Type<typeof AuthEventSchema>;
