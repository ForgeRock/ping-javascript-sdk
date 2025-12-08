/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * Import the used types
 */
import type { Dispatch } from '@reduxjs/toolkit';

import { logger as loggerFn } from '@forgerock/sdk-logger';

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
import {
  DeviceValue,
  FidoAuthenticationInputValue,
  FidoRegistrationInputValue,
  PhoneNumberInputValue,
} from './collector.types.js';
/**
 * @function transformSubmitRequest - Transforms a NextNode into a DaVinciRequest for form submissions
 * @param {ContinueNode} node - The node to transform into a DaVinciRequest
 * @returns {DaVinciRequest} - The transformed request object
 */
export function transformSubmitRequest(
  node: ContinueNode,
  logger: ReturnType<typeof loggerFn>,
): DaVinciRequest {
  // Filter out ActionCollectors as they are not used in form submissions
  const collectors = node.client?.collectors?.filter(
    (collector) =>
      collector.category === 'MultiValueCollector' ||
      collector.category === 'SingleValueCollector' ||
      collector.category === 'ValidatedSingleValueCollector' ||
      collector.category === 'ObjectValueCollector' ||
      collector.category === 'SingleValueAutoCollector' ||
      collector.category === 'ObjectValueAutoCollector',
  );

  const formData = collectors?.reduce<{
    [key: string]:
      | string
      | number
      | boolean
      | (string | number | boolean)[]
      | DeviceValue
      | PhoneNumberInputValue
      | FidoRegistrationInputValue
      | FidoAuthenticationInputValue;
  }>((acc, collector) => {
    acc[collector.input.key] = collector.input.value;
    return acc;
  }, {});
  logger.debug('Transforming submit request', { node, formData });

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
export function transformActionRequest(
  node: ContinueNode,
  action: string,
  logger: ReturnType<typeof loggerFn>,
): DaVinciRequest {
  logger.debug('Transforming action request', { node, action });
  return {
    id: node.server.id || '',
    eventName: node.server.eventName || '',
    interactionId: node.server.interactionId || '',
    parameters: {
      eventType: 'action',
      data: {
        actionKey: action,
        formData: {},
      },
    },
  };
}

export function handleResponse(
  cacheEntry: DaVinciCacheEntry,
  dispatch: Dispatch,
  status: number,
  logger: ReturnType<typeof loggerFn>,
) {
  /**
   * 5XX errors are treated as unrecoverable failures
   */
  if (cacheEntry.isError && cacheEntry.error.status >= 500) {
    logger.error('Response of 5XX indicates unrecoverable failure');
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
      logger.error('Error is a client-side timeout');
      dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

      return; // Filter out timeouts
    }

    // Filter our "PingOne Authentication Connector" unrecoverable failures
    if (
      data.connectorId === 'pingOneAuthenticationConnector' &&
      (data.capabilityName === 'returnSuccessResponseRedirect' ||
        data.capabilityName === 'setSession')
    ) {
      logger.error('Error is a PingOne Authentication Connector unrecoverable failure');
      dispatch(nodeSlice.actions.failure({ data, requestId, httpStatus: cacheEntry.error.status }));

      return;
    }

    logger.debug('Response with this error type should be recoverable');
    // If we're still here, we have a 4XX failure that should be recoverable
    dispatch(nodeSlice.actions.error({ data, requestId, httpStatus: cacheEntry.error.status }));

    return;
  }

  /**
   * Check for 3XX errors that result in CORS errors, reported as FETCH_ERROR
   */
  if (cacheEntry.isError && cacheEntry.error.status === 'FETCH_ERROR') {
    logger.error(
      'Response with FETCH_ERROR indicates configuration failure. Please ensure a correct Client ID for your OAuth application.',
    );
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
    logger.error('Response with `isSuccess` but `error` property indicates unrecoverable failure');
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
      logger.error(
        'Response with `isSuccess` and `status` of "failure" indicates unrecoverable failure',
      );
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
