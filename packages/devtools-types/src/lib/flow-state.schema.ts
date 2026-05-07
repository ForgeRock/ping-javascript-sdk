import { Schema } from 'effect';
import { AuthEventSchema, CorsFlagSchema } from './auth-event.schema.js';

export const FlowSummarySchema = Schema.Struct({
  nodeCount: Schema.Number,
  errorCount: Schema.Number,
  corsFlags: Schema.Array(CorsFlagSchema),
  duration: Schema.Number,
  sdkConnected: Schema.Boolean,
});

export const FlowStateSchema = Schema.Struct({
  flowId: Schema.NullOr(Schema.String),
  capturedAt: Schema.String,
  events: Schema.Array(AuthEventSchema),
  summary: FlowSummarySchema,
  lastSdkEventId: Schema.optionalWith(Schema.NullOr(Schema.String), { default: () => null }),
});

export type FlowSummary = Schema.Schema.Type<typeof FlowSummarySchema>;
export type FlowState = Schema.Schema.Type<typeof FlowStateSchema>;
