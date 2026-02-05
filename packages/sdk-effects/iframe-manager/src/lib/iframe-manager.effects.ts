/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable @typescript-eslint/no-empty-function */

export interface GetParamsFromIFrameOptions {
  /** The URL to load in the iframe. */
  url: string;
  /** Timeout in milliseconds for the entire operation. */
  timeout: number;
  /** Array of query parameter keys expected upon successful completion. */
  successParams: string[];
  /** Array of query parameter keys indicating an error occurred. */
  errorParams: string[];
}

export type ResolvedParams = Record<string, string>;

type Noop = () => void;

function hasErrorParams(params: URLSearchParams, errorParams: string[]): boolean {
  for (const key of errorParams) {
    if (params.has(key)) {
      return true;
    }
  }
  return false;
}

// Helper function to check if all required success params are present
function hasSomeSuccessParams(params: URLSearchParams, successParams: string[]): boolean {
  return successParams.some((key) => params.has(key));
}

function searchParamsToRecord(params: URLSearchParams): ResolvedParams {
  const result: ResolvedParams = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Initializes the Iframe Manager effect.
 * @returns An object containing the API for managing iframe requests.
 */
export function iFrameManager() {
  /**
   * Creates a hidden iframe to navigate to the specified URL,
   * waits for a redirect back to the application's origin,
   * and resolves/rejects based on the query parameters found in the redirect URL.
   * IMPORTANT: This relies on the final redirect target being on the SAME ORIGIN
   * as the parent window due to browser security restrictions (Same-Origin Policy).
   * Accessing contentWindow.location of a cross-origin iframe will fail.
   *
   * @param options - The options for the iframe request (URL, timeout, success/error params).
   * @returns A Promise that resolves with the parsed query parameters on success or
   *          when error params are present; rejects on timeout or if unable to access iframe content.
   */
  return {
    getParamsByRedirect: (options: GetParamsFromIFrameOptions): Promise<ResolvedParams> => {
      const { url, timeout, successParams, errorParams } = options;

      if (
        !successParams ||
        !errorParams ||
        successParams.length === 0 ||
        errorParams.length === 0
      ) {
        const error = new Error('successParams and errorParams must be provided');
        throw error;
      }

      return new Promise<ResolvedParams>((resolve, reject) => {
        let iframe: HTMLIFrameElement | null = null;
        let timerId: ReturnType<typeof setTimeout> | null = null;

        let onLoadHandler: () => void = () => {};
        let cleanup: Noop = () => {};

        cleanup = (): void => {
          if (!iframe && !timerId) return;

          if (timerId) {
            clearTimeout(timerId);
            timerId = null;
          }
          if (iframe) {
            iframe.removeEventListener('load', onLoadHandler);
            if (iframe.parentNode) {
              iframe.remove();
            }
            iframe = null;
          }
          onLoadHandler = () => {};
          cleanup = () => {};
        };

        onLoadHandler = (): void => {
          try {
            if (iframe && iframe.contentWindow) {
              const currentIframeHref = iframe.contentWindow.location.href;

              if (currentIframeHref === 'about:blank' || !currentIframeHref) {
                return; // Wait for actual navigation
              }

              const redirectUrl = new URL(currentIframeHref);
              const searchParams = redirectUrl.searchParams;
              const parsedParams = searchParamsToRecord(searchParams);

              // 1. Check for Error Parameters
              if (hasErrorParams(searchParams, errorParams)) {
                cleanup();
                resolve(parsedParams); // Resolve with all parsed params for context
                return;
              }

              // 2. Check for Success Parameters
              if (hasSomeSuccessParams(searchParams, successParams)) {
                cleanup();
                resolve(parsedParams); // Resolve with all parsed params
                return;
              }

              /*
               * 3. Neither Error nor Success: Intermediate Redirect?
               * If neither error nor all required success params are found,
               * assume it's an intermediate step in the redirect flow.
               * Do nothing, let the timeout eventually handle non-resolving states
               * or wait for the next 'load' event.
               */
            }
          } catch {
            // This likely means a cross-origin navigation occurred where access is denied.
            cleanup();
            reject({
              type: 'internal_error',
              message: 'unexpected failure',
            });
          }
        };

        try {
          iframe = document.createElement('iframe');
          iframe.style.display = 'none'; // Hide the iframe
          iframe.addEventListener('load', onLoadHandler);
          document.body.appendChild(iframe);

          timerId = setTimeout(() => {
            cleanup();
            reject({
              type: 'internal_error',
              message: 'iframe timed out',
            });
          }, timeout);

          iframe.src = url;
        } catch {
          cleanup(); // Attempt cleanup even if setup failed partially
          reject({
            type: 'internal_error',
            message: 'error setting up iframe',
          });
        }
      });
    },
  };
}
