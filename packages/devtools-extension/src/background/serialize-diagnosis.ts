import type { DiagnosisResult, FlowIssue, EventIssue } from './diagnosis-engine.js';

export interface SerializableDiagnosisResult {
  issues: FlowIssue[];
  annotatedEvents: Record<string, EventIssue[]>;
  flowHealth: 'healthy' | 'warning' | 'error';
}

export function serializeDiagnosis(diagnosis: DiagnosisResult): SerializableDiagnosisResult {
  return {
    issues: diagnosis.issues,
    annotatedEvents: Object.fromEntries(diagnosis.annotatedEvents),
    flowHealth: diagnosis.flowHealth,
  };
}
