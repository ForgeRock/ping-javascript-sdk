import { describe, it, expect } from 'vitest';
import { detectCorsFlags } from './cors-detector.js';
import type { CorsFlag } from '@forgerock/devtools-types';

function makeEntry(overrides: {
  url?: string;
  method?: string;
  status?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}) {
  return {
    request: {
      url: overrides.url ?? 'https://example.com/authorize',
      method: overrides.method ?? 'POST',
      headers: Object.entries(overrides.requestHeaders ?? {}).map(([name, value]) => ({
        name,
        value,
      })),
    },
    response: {
      status: overrides.status ?? 200,
      headers: Object.entries(overrides.responseHeaders ?? {}).map(([name, value]) => ({
        name,
        value,
      })),
    },
    time: 0,
  };
}

describe('detectCorsFlags', () => {
  it('returns empty array for a clean request', () => {
    const entry = makeEntry({
      requestHeaders: { origin: 'https://app.example.com' },
      responseHeaders: {
        'access-control-allow-origin': 'https://app.example.com',
        'access-control-allow-credentials': 'true',
      },
    });
    const flags = detectCorsFlags(entry);
    expect(flags).toHaveLength(0);
  });

  it('flags status 0 as status-zero', () => {
    const entry = makeEntry({ status: 0 });
    const flags = detectCorsFlags(entry);
    expect(flags.some((f: CorsFlag) => f.reason === 'status-zero')).toBe(true);
  });

  it('flags missing allow-origin when origin header is present', () => {
    const entry = makeEntry({
      requestHeaders: { origin: 'https://app.example.com' },
      responseHeaders: {},
    });
    const flags = detectCorsFlags(entry);
    expect(flags.some((f: CorsFlag) => f.reason === 'missing-allow-origin')).toBe(true);
  });

  it('flags wildcard allow-origin with credentials', () => {
    const entry = makeEntry({
      requestHeaders: { origin: 'https://app.example.com' },
      responseHeaders: {
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
      },
    });
    const flags = detectCorsFlags(entry);
    expect(flags.some((f: CorsFlag) => f.reason === 'wildcard-with-credentials')).toBe(true);
  });

  it('flags credentials mismatch when allow-credentials is false', () => {
    const entry = makeEntry({
      requestHeaders: { origin: 'https://app.example.com' },
      responseHeaders: {
        'access-control-allow-origin': 'https://app.example.com',
        'access-control-allow-credentials': 'false',
      },
    });
    const flags = detectCorsFlags(entry);
    expect(flags.some((f: CorsFlag) => f.reason === 'credentials-mismatch')).toBe(true);
  });

  it('flags credentials mismatch when allow-credentials header is absent', () => {
    const entry = makeEntry({
      requestHeaders: { origin: 'https://app.example.com' },
      responseHeaders: {
        'access-control-allow-origin': 'https://app.example.com',
        // no access-control-allow-credentials header
      },
    });
    const flags = detectCorsFlags(entry);
    expect(flags.some((f: CorsFlag) => f.reason === 'credentials-mismatch')).toBe(true);
  });
});
