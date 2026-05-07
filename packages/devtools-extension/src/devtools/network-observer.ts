import { detectCorsFlags } from './cors-detector.js';
import type { AuthEvent, NetworkData } from '@forgerock/devtools-types';

const AUTH_URL_PATTERNS = [
  /\/authorize/,
  /\/oauth2\/token/,
  /\/davinci\//,
  /\/am\/json\//,
  /\/openid-connect\//,
  /\/as\/token/,
] as const;

export interface HarHeader {
  name: string;
  value: string;
}

export interface HarEntry {
  request: {
    url: string;
    method: string;
    headers: HarHeader[];
    postData?: { text: string };
  };
  response: {
    status: number;
    headers: HarHeader[];
    content?: { text: string };
  };
  time: number;
}

export function isAuthRelated(url: string): boolean {
  return AUTH_URL_PATTERNS.some((p) => p.test(url));
}

function headersToRecord(headers: HarHeader[]): Record<string, string> {
  return Object.fromEntries(headers.map((h) => [h.name.toLowerCase(), h.value]));
}

const MAX_BODY_PARSE_BYTES = 512 * 1024;

function parseBody(text: string | undefined): unknown | undefined {
  if (!text || text.trim() === '') return undefined;
  if (text.length > MAX_BODY_PARSE_BYTES) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function buildNetworkEvent(entry: HarEntry, flowId: string | null): AuthEvent {
  const corsFlags = detectCorsFlags(entry);
  const isCors = corsFlags.some(
    (f) =>
      f.reason === 'status-zero' ||
      f.reason === 'missing-allow-origin' ||
      f.reason === 'wildcard-with-credentials',
  );
  const isError = entry.response.status === 0 || entry.response.status >= 400;

  const data: NetworkData = {
    _tag: 'network',
    url: entry.request.url,
    method: entry.request.method,
    status: entry.response.status,
    requestHeaders: headersToRecord(entry.request.headers),
    responseHeaders: headersToRecord(entry.response.headers),
    duration: entry.time,
    corsFlag: corsFlags[0],
    requestBody: parseBody(entry.request.postData?.text),
    responseBody: parseBody(entry.response.content?.text),
  };

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type: 'network:response',
    source: 'network',
    flowId,
    causedBy: null,
    data,
    flags: {
      isCors,
      isError,
      isAuthRelated: isAuthRelated(entry.request.url),
    },
  };
}
