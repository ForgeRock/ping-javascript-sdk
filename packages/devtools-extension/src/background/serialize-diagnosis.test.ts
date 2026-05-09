import { describe, it, expect } from 'vitest';
import { serializeDiagnosis } from './serialize-diagnosis.js';
import type { DiagnosisResult } from './diagnosis-engine.js';

describe('serializeDiagnosis', () => {
  it('converts annotatedEvents Map to a plain object', () => {
    const diagnosis: DiagnosisResult = {
      issues: [],
      annotatedEvents: new Map([
        [
          'evt-1',
          [
            {
              severity: 'warning',
              title: 'Expired JWT',
              description: 'Token expired',
              steps: ['Refresh'],
            },
          ],
        ],
        ['evt-2', [{ severity: 'error', title: 'CORS', description: 'Blocked', steps: [] }]],
      ]),
      flowHealth: 'warning',
    };

    const result = serializeDiagnosis(diagnosis);

    expect(result.annotatedEvents).toEqual({
      'evt-1': [
        {
          severity: 'warning',
          title: 'Expired JWT',
          description: 'Token expired',
          steps: ['Refresh'],
        },
      ],
      'evt-2': [{ severity: 'error', title: 'CORS', description: 'Blocked', steps: [] }],
    });
  });

  it('preserves issues array as-is', () => {
    const issues = [
      {
        id: 'cors-1',
        severity: 'error' as const,
        category: 'cors' as const,
        title: 'CORS Blocked',
        description: 'Request blocked',
        steps: ['Check headers'],
        relatedEventIds: ['evt-1'],
        dedupKey: 'cors:status-zero',
      },
    ];

    const diagnosis: DiagnosisResult = {
      issues,
      annotatedEvents: new Map(),
      flowHealth: 'error',
    };

    const result = serializeDiagnosis(diagnosis);
    expect(result.issues).toBe(issues);
  });

  it('preserves flowHealth value', () => {
    const diagnosis: DiagnosisResult = {
      issues: [],
      annotatedEvents: new Map(),
      flowHealth: 'healthy',
    };

    expect(serializeDiagnosis(diagnosis).flowHealth).toBe('healthy');
  });

  it('handles empty annotatedEvents Map', () => {
    const diagnosis: DiagnosisResult = {
      issues: [],
      annotatedEvents: new Map(),
      flowHealth: 'healthy',
    };

    const result = serializeDiagnosis(diagnosis);
    expect(result.annotatedEvents).toEqual({});
  });

  it('handles multiple issues per event in annotatedEvents', () => {
    const diagnosis: DiagnosisResult = {
      issues: [],
      annotatedEvents: new Map([
        [
          'evt-1',
          [
            { severity: 'warning', title: 'Issue 1', description: 'Desc 1', steps: [] },
            { severity: 'error', title: 'Issue 2', description: 'Desc 2', steps: ['Fix it'] },
          ],
        ],
      ]),
      flowHealth: 'error',
    };

    const result = serializeDiagnosis(diagnosis);
    expect(result.annotatedEvents['evt-1']).toHaveLength(2);
    expect(result.annotatedEvents['evt-1'][0].title).toBe('Issue 1');
    expect(result.annotatedEvents['evt-1'][1].title).toBe('Issue 2');
  });
});
