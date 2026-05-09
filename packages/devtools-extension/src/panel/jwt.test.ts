import { describe, it, expect } from 'vitest';
import { formatUnixTime, base64UrlDecode, parseJwt } from './jwt.js';

describe('formatUnixTime', () => {
  it('formats a Unix timestamp into ISO-like UTC string', () => {
    // 2023-11-14T22:13:20.000Z
    const result = formatUnixTime(1700000000);
    expect(result).toBe('2023-11-14 22:13:20.000 UTC');
  });

  it('handles zero', () => {
    const result = formatUnixTime(0);
    expect(result).toBe('1970-01-01 00:00:00.000 UTC');
  });

  it('returns the number as string for invalid input', () => {
    const result = formatUnixTime(NaN);
    expect(result).toBe('NaN');
  });
});

describe('base64UrlDecode', () => {
  it('decodes standard base64url string', () => {
    // "hello" in base64url = "aGVsbG8"
    const result = base64UrlDecode('aGVsbG8');
    expect(result).toBe('hello');
  });

  it('handles base64url characters (- and _)', () => {
    // base64url uses - for + and _ for /
    // "???" in base64 = "Pz8/" → base64url = "Pz8_"
    const result = base64UrlDecode('Pz8_');
    expect(result).toBe('???');
  });

  it('handles padding correctly for 3-char input', () => {
    // "ab" in base64 = "YWI=" → base64url = "YWI"
    const result = base64UrlDecode('YWI');
    expect(result).toBe('ab');
  });
});

describe('parseJwt', () => {
  // Build a minimal JWT with base64url-encoded header and payload
  function makeJwt(header: Record<string, unknown>, payload: Record<string, unknown>): string {
    const encode = (obj: Record<string, unknown>) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode(header)}.${encode(payload)}.fakesignaturedata1234`;
  }

  it('parses header and payload from a valid JWT', () => {
    const jwt = makeJwt({ alg: 'RS256', typ: 'JWT' }, { sub: 'user-1', exp: 1700000000 });
    const result = parseJwt(jwt);

    expect(result.header).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(result.payload.sub).toBe('user-1');
    expect(result.payload.exp).toBe(1700000000);
  });

  it('returns signature preview (first 16 chars + ellipsis)', () => {
    const jwt = makeJwt({ alg: 'RS256' }, { sub: '1' });
    const result = parseJwt(jwt);

    expect(result.signaturePreview).toBe('fakesignaturedat…');
  });

  it('throws for a string with fewer than 3 parts', () => {
    expect(() => parseJwt('only.two')).toThrow('Not a 3-part JWT');
    expect(() => parseJwt('just-one')).toThrow('Not a 3-part JWT');
  });

  it('throws for a string with more than 3 parts', () => {
    expect(() => parseJwt('a.b.c.d')).toThrow('Not a 3-part JWT');
  });

  it('throws for invalid base64 content', () => {
    expect(() => parseJwt('!!!.@@@.###')).toThrow();
  });

  it('parses JWT with URL-safe base64 characters', () => {
    // Create a payload that would produce + and / in standard base64
    const jwt = makeJwt({ alg: 'RS256' }, { data: '>>>???' });
    const result = parseJwt(jwt);
    expect(result.payload.data).toBe('>>>???');
  });

  it('handles short signature (less than 16 chars)', () => {
    const encode = (obj: Record<string, unknown>) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${encode({ alg: 'RS256' })}.${encode({ sub: '1' })}.abc`;
    const result = parseJwt(jwt);
    expect(result.signaturePreview).toBe('abc…');
  });
});
