/**
 * Import the used types
 */
import type { Dispatch } from '@reduxjs/toolkit';
import type { RootState } from './client.store.utils.js';

import { nodeSlice } from './node.slice.js';

import type {
  DaVinciCacheEntry,
  DavinciErrorResponse,
  DaVinciFailureResponse,
  DaVinciNextResponse,
  DaVinciRequest,
  DaVinciSuccessResponse,
} from './davinci.types.js';
import type { ContinueNode } from './node.types.js';
import { IdpCollector } from './collector.types.js';
import { InternalErrorResponse } from './client.types.js';

/**
 * @function transformSubmitRequest - Transforms a NextNode into a DaVinciRequest for form submissions
 * @param {ContinueNode} node - The node to transform into a DaVinciRequest
 * @returns {DaVinciRequest} - The transformed request object
 */
export function transformSubmitRequest(node: ContinueNode): DaVinciRequest {
  // Filter out ActionCollectors as they are not used in form submissions
  const collectors = node.client?.collectors?.filter(
    (collector) =>
      collector.category === 'MultiValueCollector' ||
      collector.category === 'SingleValueCollector' ||
      collector.category === 'ValidatedSingleValueCollector',
  );

  const formData = collectors?.reduce<{
    [key: string]: string | number | boolean | (string | number | boolean)[];
  }>((acc, collector) => {
    acc[collector.input.key] = collector.input.value;
    return acc;
  }, {});

  return {
    id: node.server.id || '',
    eventName: node.server.eventName || '',
    interactionId: node.server.interactionId || '',
    parameters: {
      eventType: 'submit',
      data: {
        actionKey: node.client?.action || '',
        formData: formData || {},
      },
    },
  };
}

/**
 * @function transformActionRequest - Transforms a NextNode into a DaVinciRequest for action requests
 * @param {ContinueNode} node - The node to transform into a DaVinciRequest
 * @param {string} action - The action to transform into a DaVinciRequest
 * @returns {DaVinciRequest} - The transformed request object
 */
export function transformActionRequest(node: ContinueNode, action: string): DaVinciRequest {
  return {
    id: node.server.id || '',
    eventName: node.server.eventName || '',
    interactionId: node.server.interactionId || '',
    parameters: {
      eventType: 'action',
      data: {
        actionKey: action,
      },
    },
  };
}

export function handleResponse(cacheEntry: DaVinciCacheEntry, dispatch: Dispatch, status: number) {
  /**
   * 5XX errors are treated as unrecoverable failures
   */
  if (cacheEntry.isError && cacheEntry.error.status >= 500) {
    const data = cacheEntry.error.data as unknown;
    const requestId = cacheEntry.requestId;
    dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

    return; // Filter out 5XX's
  }

  /**
   * Check for 4XX errors that are unrecoverable
   */
  if (cacheEntry.isError && cacheEntry.error.status >= 400 && cacheEntry.error.status < 500) {
    const data = cacheEntry.error.data as DavinciErrorResponse;
    const requestId = cacheEntry.requestId;

    // Filter out client-side "timeout" related unrecoverable failures
    if (data.code === 1999 || data.code === 'requestTimedOut') {
      dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

      return; // Filter out timeouts
    }

    // Filter our "PingOne Authentication Connector" unrecoverable failures
    if (
      data.connectorId === 'pingOneAuthenticationConnector' &&
      (data.capabilityName === 'returnSuccessResponseRedirect' ||
        data.capabilityName === 'setSession')
    ) {
      dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

      return;
    }

    // If we're still here, we have a 4XX failure that should be recoverable
    dispatch(nodeSlice.actions.error({ data, requestId, httpStatus: cacheEntry.error.status }));

    return;
  }

  /**
   * Check for 3XX errors that result in CORS errors, reported as FETCH_ERROR
   */
  if (cacheEntry.isError && cacheEntry.error.status === 'FETCH_ERROR') {
    const data = {
      code: cacheEntry.error.status,
      message: 'Fetch Error: Please ensure a correct Client ID for your OAuth application.',
    };
    const requestId = cacheEntry.requestId;
    dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

    return;
  }

  /**
   * If the response's HTTP status is a success (2XX), but the DaVinci API has returned an error,
   * we need to handle this as a failure or return as unknown.
   */
  if (cacheEntry.isSuccess && 'error' in cacheEntry.data) {
    const data = cacheEntry.data as DaVinciFailureResponse;
    const requestId = cacheEntry.requestId;
    dispatch(
      nodeSlice.actions.failure({
        data: data.error,
        requestId,
        httpStatus: status,
      }),
    );

    return; // Filter out 2XX errors
  }

  /**
   * If the response's HTTP status is a success (2XX), but the DaVinci API has returned an error,
   * we need to handle this as a failure or return as unknown.
   */
  if (cacheEntry.isSuccess && 'status' in cacheEntry.data) {
    const status = cacheEntry.data.status.toLowerCase();

    if (status === 'failure') {
      const data = cacheEntry.data as DaVinciFailureResponse;
      const requestId = cacheEntry.requestId;
      dispatch(
        nodeSlice.actions.failure({
          data: data.error,
          requestId,
          httpStatus: status,
        }),
      );

      return; // Filter out 2XX errors with 'failure' status
    } else {
      // Do nothing
    }
  }

  /**
   * If we've made it here, we have a successful response and do not have an error property.
   * Parse for state of the flow and dispatch appropriate action.
   */
  if (cacheEntry.isSuccess) {
    const requestId = cacheEntry.requestId;
    const hasNextUrl = () => {
      const data = cacheEntry.data;

      if ('_links' in data) {
        if ('next' in data._links) {
          if ('href' in data._links.next) {
            return true;
          }
        }
      }
      return false;
    };

    if ('session' in cacheEntry.data || 'authorizeResponse' in cacheEntry.data) {
      const data = cacheEntry.data as DaVinciSuccessResponse;
      dispatch(nodeSlice.actions.success({ data, requestId, httpStatus: status }));
    } else if (hasNextUrl()) {
      const data = cacheEntry.data as DaVinciNextResponse;
      dispatch(nodeSlice.actions.next({ data, requestId, httpStatus: status }));
    } else {
      // If we got here, the response type is unknown and therefore an unrecoverable failure
      const data = cacheEntry.data as DaVinciFailureResponse;
      dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: status }));
    }
  }
}

export function authorize(
  serverSlice: RootState['node']['server'],
  collector: IdpCollector,
): InternalErrorResponse | void {
  if (serverSlice && '_links' in serverSlice) {
    const continueUrl = serverSlice._links?.['continue']?.href ?? null;
    if (continueUrl) {
      window.localStorage.setItem('continueUrl', continueUrl);
      if (collector.output.url) {
        window.location.assign(collector.output.url);
      }
    } else {
      return {
        error: {
          message:
            'No url found in collector, social login needs a url in the collector to navigate to',
          type: 'network_error',
        },
        type: 'internal_error',
      };
    }
    return {
      error: {
        message:
          'No Continue Url found, social login needs a continue url to be saved in localStorage',
        type: 'network_error',
      },
      type: 'internal_error',
    };
  }
}
