/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable @typescript-eslint/no-empty-function */
import { AuthorizeUrl } from '@forgerock/sdk-types';

// Define specific options for the iframe request
export interface IframeRequestOptions {
  url: string;
  timeout: number;
  // Specify query parameters expected on success/error if needed,
  // otherwise, parse all parameters found.
  // Example: expectedParams?: string[];
}

type ResolvedParams<T> = Record<string, T>;

type Noop = () => void;

/**
 * Initializes the Iframe Manager effect.
 * This follows the functional effect pattern, returning an API
 * within a closure. Configuration could be passed here if needed
 * for default behaviors (e.g., default timeout), but currently,
 * all config is per-request.
 *
 * @returns An object containing the API for managing iframe requests.
 */
export default function iframeManagerInit(/*config: OAuthConfig*/) {
  /**
   * Creates an iframe to make a background request to the specified URL,
   * waits for a redirect, and resolves with the query parameters from the
   * redirect URL.
   *
   * @param options - The options for the iframe request (URL, timeout).
   * @returns A Promise that resolves with the query parameters from the redirect URL or rejects on timeout or error.
   */
  const getAuthCodeByIFrame = (options: {
    url: AuthorizeUrl;
    requestTimeout: number;
  }): Promise<ResolvedParams<string>> => {
    const { url, requestTimeout } = options;

    return new Promise((resolve, reject) => {
      let iframe: HTMLIFrameElement | null = document.createElement('iframe');
      let timerId: number | ReturnType<typeof setTimeout> | null = null;

      // Define these within the promise closure to avoid retaining
      // references after completion.
      let onLoadHandler: () => void = () => {};
      let cleanup: Noop = () => {};

      cleanup = (): void => {
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
        if (iframe) {
          iframe.removeEventListener('load', onLoadHandler);
          // Check if iframe is still mounted before removing
          if (iframe.parentNode) {
            iframe.remove();
          }
          iframe = null; // Dereference iframe for garbage collection
        }
        onLoadHandler = () => {};
        cleanup = () => {};
      };

      onLoadHandler = (): void => {
        try {
          // Accessing contentWindow or contentDocument can throw cross-origin errors
          // if the iframe navigated to a different origin unexpectedly before redirecting back.
          // We expect the final navigation to be back to the original redirect_uri origin.
          if (iframe && iframe.contentWindow) {
            const newHref = iframe.contentWindow.location.href;

            // Avoid processing 'about:blank' or initial load if it's not the target URL
            if (
              newHref === 'about:blank' ||
              !newHref.startsWith(options.url.substring(0, options.url.indexOf('?')))
            ) {
              // Check if the newHref origin matches expected redirect_uri origin if possible
              // Or simply check if it contains expected parameters.
              // For now, we proceed assuming any load could be the redirect.
            }

            const redirectUrl = new URL(newHref);
            const params: ResolvedParams<string> = {};
            redirectUrl.searchParams.forEach((value, key) => {
              params[key] = value;
            });

            // Check for standard OAuth error parameters
            if (params.error) {
              cleanup();
              // Reject with error details from the URL
              reject(
                new Error(
                  `Authorization error: ${params.error}. Description: ${params.error_description || 'N/A'}`,
                ),
              );
            } else if (Object.keys(params).length > 0) {
              // Assume success if parameters are present and no error param exists
              // More specific checks (e.g., for 'code' or 'state') could be added here
              // based on `options.expectedParams` if provided.
              cleanup();
              resolve(params);
            }
            // If no params and no error, it might be an intermediate step,
            // The timeout will eventually handle non-resolving states.
          }
        } catch (error) {
          // Catch potential cross-origin errors or other issues accessing iframe content
          cleanup();
          reject(
            new Error(
              `Failed to process iframe response: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
        }
      };

      timerId = setTimeout(() => {
        cleanup();
        reject(new Error(`Iframe request timed out after ${requestTimeout}ms`));
      }, requestTimeout);

      if (iframe) {
        iframe.style.display = 'none';
        iframe.addEventListener('load', onLoadHandler);
        document.body.appendChild(iframe);
        iframe.src = url; // Start the loading process
      } else {
        // Should not happen, but handle defensively
        reject(new Error('Failed to create iframe element'));
      }
    });
  };

  // Return the public API
  return {
    getAuthCodeByIFrame,
  };
}
