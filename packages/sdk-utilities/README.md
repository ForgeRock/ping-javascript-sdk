# @forgerock/sdk-utilities

## Overview

The `@forgerock/sdk-utilities` package provides a collection of pure utility functions designed to assist with common tasks in JavaScript SDK development, particularly around URL manipulation. These utilities are framework-agnostic and can be used independently or integrated into any JavaScript project.

Key features include:

- **URL Parsing and Stringification**: Easily convert URL strings to structured objects and vice-versa.
- **Query Parameter Management**: Extract, add, and remove query parameters from URLs.
- **Origin and Path Analysis**: Determine if URLs share the same origin, are relative, or absolute.

This package aims to provide robust, well-tested, and efficient helpers to reduce boilerplate and improve the reliability of URL-related operations within your applications.

## Installation

```bash
pnpm add @forgerock/sdk-utilities
# or
npm install @forgerock/sdk-utilities
# or
yarn add @forgerock/sdk-utilities
```

## API Reference

### `url`

A collection of utility functions for URL manipulation.

### `url.parse(url: string): URL`

Parses a URL string into a `URL` object. This is a wrapper around the native `URL` constructor, providing consistent behavior.

- **`url: string`**: The URL string to parse.
- **Returns**: `URL` - A native `URL` object.

### `url.stringify(url: URL): string`

Converts a `URL` object back into a string.

- **`url: URL`**: The `URL` object to stringify.
- **Returns**: `string` - The string representation of the URL.

### `url.getParam(url: string, name: string): string | null`

Retrieves the value of a specific query parameter from a URL string.

- **`url: string`**: The URL string.
- **`name: string`**: The name of the query parameter to retrieve.
- **Returns**: `string | null` - The value of the parameter, or `null` if not found.

### `url.getParams(url: string): Record<string, string>`

Retrieves all query parameters from a URL string as a key-value object.

- **`url: string`**: The URL string.
- **Returns**: `Record<string, string>` - An object where keys are parameter names and values are parameter values.

### `url.removeParams(url: string, params: string[]): string`

Removes specified query parameters from a URL string.

- **`url: string`**: The URL string.
- **`params: string[]`**: An array of parameter names to remove.
- **Returns**: `string` - The URL string with the specified parameters removed.

### `url.removeQuery(url: string): string`

Removes the entire query string (everything after `?`) from a URL.

- **`url: string`**: The URL string.
- **Returns**: `string` - The URL string without the query.

### `url.removeFragment(url: string): string`

Removes the URL fragment (everything after `#`) from a URL.

- **`url: string`**: The URL string.
- **Returns**: `string` - The URL string without the fragment.

### `url.hasSameOrigin(url1: string, url2: string): boolean`

Checks if two URL strings share the same origin (protocol, hostname, and port).

- **`url1: string`**: The first URL string.
- **`url2: string`**: The second URL string.
- **Returns**: `boolean` - `true` if origins are the same, `false` otherwise.

### `url.isRelative(url: string): boolean`

Checks if a URL string is relative (does not include a scheme or hostname).

- **`url: string`**: The URL string.
- **Returns**: `boolean` - `true` if the URL is relative, `false` otherwise.

### `url.isAbsolute(url: string): boolean`

Checks if a URL string is absolute (includes a scheme and hostname).

- **`url: string`**: The URL string.
- **Returns**: `boolean` - `true` if the URL is absolute, `false` otherwise.

### `url.isSameOrigin(url: string, origin: string): boolean`

Checks if a given URL string has the same origin as a specified origin string.

- **`url: string`**: The URL string to check.
- **`origin: string`**: The origin string to compare against (e.g., `window.location.origin`).
- **Returns**: `boolean` - `true` if the URL's origin matches the provided origin, `false` otherwise.

### `url.isSameOriginOrRelative(url: string, origin: string): boolean`

Checks if a URL is either relative or shares the same origin as a specified origin.

- **`url: string`**: The URL string to check.
- **`origin: string`**: The origin string to compare against.
- **Returns**: `boolean` - `true` if the URL is relative or same-origin, `false` otherwise.

## Usage Example

```typescript
import { url } from '@forgerock/sdk-utilities';

const currentOrigin = window.location.origin; // e.g., 'http://localhost:8080'

// Parsing and Stringifying
const parsedUrl = url.parse('http://example.com/path?param1=value1#fragment');
console.log('Parsed URL:', parsedUrl);
console.log('Stringified URL:', url.stringify(parsedUrl));

// Getting Parameters
const paramValue = url.getParam('http://example.com/?code=123&state=abc', 'code');
console.log('Code parameter:', paramValue); // '123'

const allParams = url.getParams('http://example.com/?code=123&state=abc');
console.log('All parameters:', allParams); // { code: '123', state: 'abc' }

// Removing Parameters
const urlWithoutState = url.removeParams('http://example.com/?code=123&state=abc', ['state']);
console.log('URL without state:', urlWithoutState); // 'http://example.com/?code=123'

// Removing Query and Fragment
const urlWithoutQuery = url.removeQuery('http://example.com/path?param=value#fragment');
console.log('URL without query:', urlWithoutQuery); // 'http://example.com/path#fragment'

const urlWithoutFragment = url.removeFragment('http://example.com/path?param=value#fragment');
console.log('URL without fragment:', urlWithoutFragment); // 'http://example.com/path?param=value'

// Origin Checks
console.log(
  'Same origin (current vs example.com):',
  url.hasSameOrigin(currentOrigin, 'http://example.com'),
); // false
console.log('Same origin (current vs current):', url.hasSameOrigin(currentOrigin, currentOrigin)); // true

console.log('Is relative URL:', url.isRelative('/some/path')); // true
console.log('Is absolute URL:', url.isAbsolute('https://example.com')); // true

console.log('Is same origin or relative:', url.isSameOriginOrRelative('/some/path', currentOrigin)); // true
console.log(
  'Is same origin or relative:',
  url.isSameOriginOrRelative('http://localhost:8080/path', currentOrigin),
); // true
console.log(
  'Is same origin or relative:',
  url.isSameOriginOrRelative('http://another.com/path', currentOrigin),
); // false
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-utilities
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/sdk-utilities
```
