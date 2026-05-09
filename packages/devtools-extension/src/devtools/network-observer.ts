import { detectCorsFlags } from './cors-detector.js';
import type { AuthEvent, NetworkData } from '@forgerock/devtools-types';
import type { OidcConfig } from './oidc-discovery.js';
import { matchesDiscoveredEndpoint } from './oidc-discovery.js';

// Patterns match the path segment (before query string).
// Use (?:\?|$) to anchor to end-of-path or start-of-query, avoiding
// false positives on filenames like "authorize.request.js".
const AUTH_URL_PATTERNS = [
  /\/authorize(?:\?|$)/,
  /\/oauth2\/token(?:\?|$)/,
  /\/davinci\//,
  /\/am\/json\//,
  /\/openid-connect\//,
  /\/as\/token(?:\?|$)/,
  /\/access_token(?:\?|$)/,
  /\.well-known\/openid-configuration/,
  /\.well-known\/oauth-authorization-server/,
  /\/par(?:\?|$)/,
  /\/userinfo(?:\?|$)/,
  /\/revoke(?:\?|$)/,
  /\/introspect(?:\?|$)/,
  /\/jwks(?:\?|$)/,
  /\/token(?:\?|$)/,
  /\/end_session(?:\?|$)/,
  /\/logout(?:\?|$)/,
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

export function isAuthRelated(url: string, discoveredConfig?: OidcConfig | null): boolean {
  // Skip static assets (JS, CSS, images, fonts) — they're never auth endpoints
  if (STATIC_ASSET_PATTERN.test(url)) return false;
  if (discoveredConfig && matchesDiscoveredEndpoint(url, discoveredConfig)) return true;
  return AUTH_URL_PATTERNS.some((p) => p.test(url));
}

const STATIC_ASSET_PATTERN =
  /\.(js|mjs|cjs|ts|tsx|jsx|css|map|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)(\?|$)/;

function headersToRecord(headers: HarHeader[]): Record<string, string> {
  return Object.fromEntries(headers.map((h) => [h.name.toLowerCase(), h.value]));
}

const MAX_BODY_PARSE_BYTES = 512 * 1024;

function parseBody(text: string | undefined, contentType?: string): unknown | undefined {
  if (!text || text.trim() === '') return undefined;
  if (text.length > MAX_BODY_PARSE_BYTES) return text;

  if (contentType?.includes('application/x-www-form-urlencoded')) {
    try {
      const params = new URLSearchParams(text);
      const obj: Record<string, string> = {};
      for (const [key, value] of params) {
        obj[key] = value;
      }
      return obj;
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function buildNetworkEvent(
  entry: HarEntry,
  flowId: string | null,
  discoveredConfig?: OidcConfig | null,
): AuthEvent {
  const corsFlags = detectCorsFlags(entry);
  const isCors = corsFlags.some(
    (f) =>
      f.reason === 'status-zero' ||
      f.reason === 'missing-allow-origin' ||
      f.reason === 'wildcard-with-credentials',
  );
  const isError = entry.response.status === 0 || entry.response.status >= 400;

  const reqHeaders = headersToRecord(entry.request.headers);
  const respHeaders = headersToRecord(entry.response.headers);
  const reqContentType = reqHeaders['content-type'];
  const respContentType = respHeaders['content-type'];

  const data: NetworkData = {
    _tag: 'network',
    url: entry.request.url,
    method: entry.request.method,
    status: entry.response.status,
    requestHeaders: reqHeaders,
    responseHeaders: respHeaders,
    duration: entry.time,
    corsFlag: corsFlags[0],
    requestBody: parseBody(entry.request.postData?.text, reqContentType),
    responseBody: parseBody(entry.response.content?.text, respContentType),
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
      isAuthRelated: isAuthRelated(entry.request.url, discoveredConfig),
    },
  };
}
