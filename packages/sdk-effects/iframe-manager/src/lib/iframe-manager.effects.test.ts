/*
 * Copyright © 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iFrameManager } from './iframe-manager.effects.js';

/**
 * Patches an iframe's contentWindow.location.href to simulate navigation,
 * then fires a 'load' event so the onLoadHandler runs.
 */
function simulateIframeLoad(iframe: HTMLIFrameElement, href: string): void {
  Object.defineProperty(iframe, 'contentWindow', {
    value: { location: { href } },
    writable: true,
    configurable: true,
  });
  iframe.dispatchEvent(new Event('load'));
}

describe('iFrameManager', () => {
  describe('getParamsByRedirect – input validation', () => {
    it('rejects when successParams is empty (no resolveOnRedirectUri)', async () => {
      const manager = iFrameManager();
      await expect(
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          successParams: [],
          errorParams: ['error'],
        }),
      ).rejects.toEqual({
        type: 'internal_error',
        message: 'successParams and errorParams must be provided',
      });
    });

    it('rejects when errorParams is empty (no resolveOnRedirectUri)', async () => {
      const manager = iFrameManager();
      await expect(
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          successParams: ['code'],
          errorParams: [],
        }),
      ).rejects.toEqual({
        type: 'internal_error',
        message: 'successParams and errorParams must be provided',
      });
    });

    it('rejects when errorParams is empty with resolveOnRedirectUri set', async () => {
      const manager = iFrameManager();
      await expect(
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          successParams: [],
          errorParams: [],
          resolveOnRedirectUri: 'https://app.example.com/callback',
        }),
      ).rejects.toEqual({
        type: 'internal_error',
        message: 'errorParams must be provided',
      });
    });

    it('does not reject when successParams is empty but resolveOnRedirectUri is set', async () => {
      const manager = iFrameManager();
      // The promise should not reject immediately — it will eventually timeout
      vi.useFakeTimers();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com',
        timeout: 100,
        successParams: [],
        errorParams: ['error'],
        resolveOnRedirectUri: 'https://app.example.com/callback',
      });
      vi.advanceTimersByTime(100);
      await expect(promise).rejects.toEqual({
        type: 'internal_error',
        message: 'iframe timed out',
      });
      vi.useRealTimers();
    });
  });

  describe('getParamsByRedirect – iframe lifecycle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      document.body.replaceChildren();
    });

    it('creates a hidden iframe with display:none and appends it to document.body', () => {
      const manager = iFrameManager();
      manager.getParamsByRedirect({
        url: 'https://example.com',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe?.style.display).toBe('none');
    });

    it('sets iframe.src to the provided URL', () => {
      const manager = iFrameManager();
      manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.src).toBe('https://example.com/start');
    });

    it('rejects with timeout error when iframe never resolves', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com',
        timeout: 3000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      vi.advanceTimersByTime(3000);

      await expect(promise).rejects.toEqual({
        type: 'internal_error',
        message: 'iframe timed out',
      });
    });

    it('removes the iframe from the DOM after timeout', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com',
        timeout: 3000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      vi.advanceTimersByTime(3000);
      await promise.catch(vi.fn());

      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves with all query params when any successParam key is present in the redirect URL', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(iframe, 'https://app.example.com/callback?code=abc123&state=xyz');

      const result = await promise;
      expect(result).toEqual({ code: 'abc123', state: 'xyz' });
    });

    it('removes the iframe from the DOM after resolving with success params', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(iframe, 'https://app.example.com/callback?code=abc123');

      await promise;
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves (not rejects) with all query params when an errorParam key is present', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error', 'error_description'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(
        iframe,
        'https://app.example.com/callback?error=access_denied&error_description=User+cancelled',
      );

      const result = await promise;
      expect(result).toEqual({
        error: 'access_denied',
        error_description: 'User cancelled',
      });
    });

    it('ignores the initial about:blank load event and keeps waiting', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;

      simulateIframeLoad(iframe, 'about:blank');
      vi.advanceTimersByTime(100);

      simulateIframeLoad(iframe, 'https://app.example.com/callback?code=abc123');

      const result = await promise;
      expect(result).toEqual({ code: 'abc123' });
    });

    it('waits through intermediate redirects before resolving', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;

      simulateIframeLoad(iframe, 'https://example.com/authorize');
      simulateIframeLoad(iframe, 'https://app.example.com/callback?code=final');

      const result = await promise;
      expect(result).toEqual({ code: 'final' });
    });

    it('rejects with internal_error when contentWindow access throws (cross-origin)', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;

      Object.defineProperty(iframe, 'contentWindow', {
        get() {
          throw new DOMException('Blocked a frame with origin', 'SecurityError');
        },
        configurable: true,
      });

      iframe.dispatchEvent(new Event('load'));

      await expect(promise).rejects.toEqual({
        type: 'internal_error',
        message: 'unexpected failure',
      });
    });

    it('removes the iframe from the DOM after cross-origin rejection', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;

      Object.defineProperty(iframe, 'contentWindow', {
        get() {
          throw new DOMException('Blocked a frame with origin', 'SecurityError');
        },
        configurable: true,
      });

      iframe.dispatchEvent(new Event('load'));
      await promise.catch(vi.fn());

      expect(document.querySelector('iframe')).toBeNull();
    });
  });

  describe('getParamsByRedirect – includeHashParams', () => {
    afterEach(() => {
      document.body.replaceChildren();
    });

    it('includes hash fragment params when includeHashParams is true', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['id_token'],
        errorParams: ['error'],
        includeHashParams: true,
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(
        iframe,
        'https://app.example.com/callback#id_token=eyJhbGciOiJSUzI1NiJ9.test.sig&state=abc',
      );

      const result = await promise;
      expect(result.id_token).toBe('eyJhbGciOiJSUzI1NiJ9.test.sig');
      expect(result.state).toBe('abc');
    });

    it('detects error params in query string even when includeHashParams is true', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['id_token'],
        errorParams: ['error'],
        includeHashParams: true,
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(
        iframe,
        'https://app.example.com/callback?error=login_required&error_description=not+logged+in',
      );

      const result = await promise;
      expect(result.error).toBe('login_required');
    });

    it('does not include hash params when includeHashParams is false', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://example.com/start',
        timeout: 5000,
        successParams: ['code'],
        errorParams: ['error'],
        includeHashParams: false,
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      // code is in the query string — resolves regardless of hash
      simulateIframeLoad(iframe, 'https://app.example.com/callback?code=abc123#unrelated=ignored');

      const result = await promise;
      expect(result.code).toBe('abc123');
      expect(result.unrelated).toBeUndefined();
    });
  });

  describe('getParamsByRedirect – resolveOnRedirectUri', () => {
    afterEach(() => {
      document.body.replaceChildren();
    });

    it('resolves immediately when iframe lands on the redirect URI (exact match)', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://as.example.com/authorize',
        timeout: 5000,
        successParams: [],
        errorParams: ['error'],
        resolveOnRedirectUri: 'https://app.example.com/callback',
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(iframe, 'https://app.example.com/callback?state=abc123');

      const result = await promise;
      expect(result.state).toBe('abc123');
    });

    it('resolves with parsed query params on redirect URI landing', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://as.example.com/authorize',
        timeout: 5000,
        successParams: [],
        errorParams: ['error'],
        resolveOnRedirectUri: 'https://app.example.com/callback',
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      simulateIframeLoad(iframe, 'https://app.example.com/callback?state=xyz&session_state=foo');

      const result = await promise;
      expect(result).toEqual({ state: 'xyz', session_state: 'foo' });
    });

    it('does not resolve on a path that is a substring of the redirect URI', async () => {
      vi.useFakeTimers();
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://as.example.com/authorize',
        timeout: 500,
        successParams: [],
        errorParams: ['error'],
        resolveOnRedirectUri: 'https://app.example.com/callback',
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      // "/callbacks-leak" shares the prefix "/callback" — must NOT resolve
      simulateIframeLoad(iframe, 'https://app.example.com/callbacks-leak?state=evil');

      vi.advanceTimersByTime(500);
      await expect(promise).rejects.toEqual({
        type: 'internal_error',
        message: 'iframe timed out',
      });
      vi.useRealTimers();
    });

    it('detects error params before checking redirect URI match', async () => {
      const manager = iFrameManager();
      const promise = manager.getParamsByRedirect({
        url: 'https://as.example.com/authorize',
        timeout: 5000,
        successParams: [],
        errorParams: ['error'],
        resolveOnRedirectUri: 'https://app.example.com/callback',
      });

      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      // Error lands on the redirect URI — error check fires first
      simulateIframeLoad(
        iframe,
        'https://app.example.com/callback?error=login_required&error_description=no+session',
      );

      const result = await promise;
      expect(result.error).toBe('login_required');
    });
  });
});
