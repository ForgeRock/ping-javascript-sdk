import type { CorsFlag } from '@forgerock/devtools-types';
import type { HarHeader, HarEntry } from './network-observer.js';

function headerValue(headers: HarHeader[], name: string): string | undefined {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}

export function detectCorsFlags(entry: HarEntry): CorsFlag[] {
  const flags: CorsFlag[] = [];
  const { url, method, headers: reqHeaders } = entry.request;
  const { status, headers: resHeaders } = entry.response;

  const origin = headerValue(reqHeaders, 'origin');
  const allowOrigin = headerValue(resHeaders, 'access-control-allow-origin');
  const allowCredentials = headerValue(resHeaders, 'access-control-allow-credentials');

  if (status === 0) {
    flags.push({ url, method, reason: 'status-zero' });
  }

  if (origin && !allowOrigin) {
    flags.push({ url, method, reason: 'missing-allow-origin' });
  }

  if (allowOrigin === '*' && allowCredentials === 'true') {
    flags.push({ url, method, reason: 'wildcard-with-credentials', allowOrigin, allowCredentials });
  }

  const credentialsDenied = allowCredentials === 'false' || allowCredentials === undefined;

  if (origin && allowOrigin && allowOrigin !== '*' && credentialsDenied) {
    flags.push({ url, method, reason: 'credentials-mismatch', allowOrigin, allowCredentials });
  }

  return flags;
}
