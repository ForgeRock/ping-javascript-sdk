import { describe, it, expect } from 'vitest';
import { buildNetworkEvent, isAuthRelated } from './network-observer.js';

describe('isAuthRelated', () => {
  it('matches known auth endpoints', () => {
    expect(isAuthRelated('https://id.example.com/authorize')).toBe(true);
    expect(isAuthRelated('https://id.example.com/oauth2/token')).toBe(true);
    expect(isAuthRelated('https://id.example.com/davinci/connections')).toBe(true);
    expect(isAuthRelated('https://id.example.com/am/json/authenticate')).toBe(true);
  });

  it('does not match unrelated URLs', () => {
    expect(isAuthRelated('https://example.com/api/users')).toBe(false);
    expect(isAuthRelated('https://cdn.example.com/logo.png')).toBe(false);
  });
});

describe('buildNetworkEvent', () => {
  it('maps a HAR entry to an AuthEvent', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/authorize',
        method: 'POST',
        headers: [{ name: 'origin', value: 'https://app.example.com' }],
      },
      response: {
        status: 200,
        headers: [{ name: 'access-control-allow-origin', value: 'https://app.example.com' }],
      },
      time: 123,
    };
    const event = buildNetworkEvent(entry, null);
    expect(event.type).toBe('network:response');
    expect(event.source).toBe('network');
    expect(event.flags.isAuthRelated).toBe(true);
    expect(event.flags.isCors).toBe(false);
    expect(event.data).toMatchObject({
      _tag: 'network',
      url: 'https://id.example.com/authorize',
      method: 'POST',
      status: 200,
    });
  });

  it('sets isCors flag when cors flags detected', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/authorize',
        method: 'POST',
        headers: [{ name: 'origin', value: 'https://app.example.com' }],
      },
      response: { status: 0, headers: [] },
      time: 50,
    };
    const event = buildNetworkEvent(entry, null);
    expect(event.flags.isCors).toBe(true);
    expect(event.flags.isError).toBe(true);
  });
});

describe('buildNetworkEvent body capture', () => {
  it('parses a JSON request body from postData', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/davinci/connections',
        method: 'POST',
        headers: [],
        postData: { text: '{"action":"continueNode"}' },
      },
      response: { status: 200, headers: [] },
      time: 10,
    };
    const event = buildNetworkEvent(entry, null);
    if (event.data._tag !== 'network') throw new Error('not network');
    expect(event.data.requestBody).toEqual({ action: 'continueNode' });
  });

  it('falls back to raw string for non-JSON request body', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/davinci/connections',
        method: 'POST',
        headers: [],
        postData: { text: 'not-json' },
      },
      response: { status: 200, headers: [] },
      time: 10,
    };
    const event = buildNetworkEvent(entry, null);
    if (event.data._tag !== 'network') throw new Error('not network');
    expect(event.data.requestBody).toBe('not-json');
  });

  it('parses a JSON response body from content', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/oauth2/token',
        method: 'POST',
        headers: [],
      },
      response: {
        status: 200,
        headers: [],
        content: { text: '{"access_token":"abc","token_type":"Bearer"}' },
      },
      time: 20,
    };
    const event = buildNetworkEvent(entry, null);
    if (event.data._tag !== 'network') throw new Error('not network');
    expect(event.data.responseBody).toEqual({ access_token: 'abc', token_type: 'Bearer' });
  });

  it('omits requestBody and responseBody when absent', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/authorize',
        method: 'GET',
        headers: [],
      },
      response: { status: 302, headers: [] },
      time: 5,
    };
    const event = buildNetworkEvent(entry, null);
    if (event.data._tag !== 'network') throw new Error('not network');
    expect(event.data.requestBody).toBeUndefined();
    expect(event.data.responseBody).toBeUndefined();
  });

  it('returns undefined for empty body text', () => {
    const entry = {
      request: {
        url: 'https://id.example.com/davinci/connections',
        method: 'POST',
        headers: [],
        postData: { text: '   ' },
      },
      response: { status: 200, headers: [], content: { text: '' } },
      time: 10,
    };
    const event = buildNetworkEvent(entry, null);
    if (event.data._tag !== 'network') throw new Error('not network');
    expect(event.data.requestBody).toBeUndefined();
    expect(event.data.responseBody).toBeUndefined();
  });
});
