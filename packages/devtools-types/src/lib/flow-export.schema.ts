import { Schema } from 'effect';
import { FlowStateSchema } from './flow-state.schema.js';

export const FlowExportSchema = Schema.Struct({
  version: Schema.Literal(1),
  exportedAt: Schema.String,
  redacted: Schema.Boolean,
  flow: FlowStateSchema,
});

export type FlowExport = Schema.Schema.Type<typeof FlowExportSchema>;
