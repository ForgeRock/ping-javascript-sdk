/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
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
    it('throws synchronously when successParams is empty', () => {
      const manager = iFrameManager();
      expect(() =>
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          successParams: [],
          errorParams: ['error'],
        }),
      ).toThrow('successParams and errorParams must be provided');
    });

    it('throws synchronously when errorParams is empty', () => {
      const manager = iFrameManager();
      expect(() =>
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          successParams: ['code'],
          errorParams: [],
        }),
      ).toThrow('successParams and errorParams must be provided');
    });

    it('throws synchronously when successParams or errorParams is undefined', () => {
      const manager = iFrameManager();
      expect(() =>
        manager.getParamsByRedirect({
          url: 'https://example.com',
          timeout: 1000,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          successParams: undefined as any,
          errorParams: ['error'],
        }),
      ).toThrow('successParams and errorParams must be provided');
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
});
