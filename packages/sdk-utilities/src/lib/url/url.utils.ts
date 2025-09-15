/*
 * @forgerock/javascript-sdk
 *
 * url.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Returns the base URL including protocol, hostname and any non-standard port.
 * The returned URL does not include a trailing slash.
 */
function getBaseUrl(url: URL): string {
  const isNonStandardPort =
    (url.protocol === 'http:' && ['', '80'].indexOf(url.port) === -1) ||
    (url.protocol === 'https:' && ['', '443'].indexOf(url.port) === -1);
  const port = isNonStandardPort ? `:${url.port}` : '';

  let hostname = url.hostname;
  // Detect IPv6 hostnames and wrap them in square brackets
  if (hostname.includes(':') && !hostname.startsWith('[') && !hostname.endsWith(']')) {
    hostname = `[${hostname}]`;
  }

  const baseUrl = `${url.protocol}//${hostname}${port}`;
  return baseUrl;
}

function resolve(baseUrl: string, path: string): string {
  const url = new URL(baseUrl);

  if (path.startsWith('/')) {
    return `${getBaseUrl(url)}${path}`;
  }

  const basePath = url.pathname.split('/');
  const destPath = path.split('/').filter((x) => !!x);
  const newPath = [...basePath.slice(0, -1), ...destPath].join('/');

  return `${getBaseUrl(url)}${newPath}`;
}

function parseQuery(fullUrl: string): Record<string, string> {
  const url = new URL(fullUrl);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (query[k] = v));
  return query;
}

function stringify(data: Record<string, string | undefined>): string {
  const pairs: string[] = [];
  for (const k in data) {
    if (data[k]) {
      pairs.push(k + '=' + encodeURIComponent(data[k] as string));
    }
  }
  return pairs.join('&');
}

export { getBaseUrl, parseQuery, resolve, stringify };
