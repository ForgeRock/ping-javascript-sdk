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
import * as Either from 'effect/Either';

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
 * @param {ReturnType<typeof loggerFn>} logger - Logger instance
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

  // Determine eventType: check if there's a PollingCollector with a non-empty string value
  const hasPollingWithPayload = collectors?.some(
    (collector) =>
      collector.type === 'PollingCollector' &&
      typeof collector.input.value === 'string' &&
      collector.input.value,
  );
  const eventType = hasPollingWithPayload ? 'polling' : 'submit';

  logger.debug('Transforming submit request', { node, formData });

  return {
    id: node.server.id || '',
    eventName: node.server.eventName || '',
    interactionId: node.server.interactionId || '',
    parameters: {
      eventType,
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
      },
    },
  };
}

type ResponseClassification =
  | { _tag: 'failure'; data: unknown; requestId: string; httpStatus: number; logMessage: string }
  | {
      _tag: 'error';
      data: DavinciErrorResponse;
      requestId: string;
      httpStatus: number;
      logMessage: string;
    }
  | { _tag: 'success'; data: DaVinciSuccessResponse; requestId: string; httpStatus: number }
  | { _tag: 'poll'; requestId: string }
  | { _tag: 'next'; data: DaVinciNextResponse; requestId: string; httpStatus: number };

function classifyError(
  error: NonNullable<DaVinciCacheEntry['error']>,
  requestId: string,
): ResponseClassification {
  if (error.status >= 500) {
    return {
      _tag: 'failure',
      data: error.data,
      requestId,
      httpStatus: error.status,
      logMessage: 'Response of 5XX indicates unrecoverable failure',
    };
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      _tag: 'failure',
      data: {
        code: error.status,
        message: 'Fetch Error: Please ensure a correct Client ID for your OAuth application.',
      },
      requestId,
      httpStatus: 0,
      logMessage:
        'Response with FETCH_ERROR indicates configuration failure. Please ensure a correct Client ID for your OAuth application.',
    };
  }

  const data = error.data as DavinciErrorResponse;

  if (data.code === 1999 || data.code === 'requestTimedOut') {
    return {
      _tag: 'failure',
      data,
      requestId,
      httpStatus: error.status,
      logMessage: 'Error is a client-side timeout',
    };
  }

  if (
    data.connectorId === 'pingOneAuthenticationConnector' &&
    (data.capabilityName === 'returnSuccessResponseRedirect' ||
      data.capabilityName === 'setSession')
  ) {
    return {
      _tag: 'failure',
      data,
      requestId,
      httpStatus: error.status,
      logMessage: 'Error is a PingOne Authentication Connector unrecoverable failure',
    };
  }

  return {
    _tag: 'error',
    data,
    requestId,
    httpStatus: error.status,
    logMessage: 'Response with this error type should be recoverable',
  };
}

function classifySuccess(
  data: NonNullable<DaVinciCacheEntry['data']>,
  requestId: string,
  httpStatus: number,
): ResponseClassification {
  if ('error' in data) {
    return {
      _tag: 'failure',
      data: (data as DaVinciFailureResponse).error,
      requestId,
      httpStatus,
      logMessage: 'Response with `isSuccess` but `error` property indicates unrecoverable failure',
    };
  }

  if ('status' in data && (data as { status: string }).status.toLowerCase() === 'failure') {
    return {
      _tag: 'failure',
      data: (data as DaVinciFailureResponse).error,
      requestId,
      httpStatus,
      logMessage:
        'Response with `isSuccess` and `status` of "failure" indicates unrecoverable failure',
    };
  }

  if ('session' in data || 'authorizeResponse' in data) {
    return { _tag: 'success', data: data as DaVinciSuccessResponse, requestId, httpStatus };
  }

  if (
    'eventName' in data &&
    ['rewindStateToLastRenderedUI', 'rewindStateToSpecificRenderedUI'].includes(
      (data as { eventName: string }).eventName,
    )
  ) {
    return { _tag: 'poll', requestId };
  }

  if ('_links' in data && 'next' in (data as { _links: object })._links) {
    return { _tag: 'next', data: data as DaVinciNextResponse, requestId, httpStatus };
  }

  return {
    _tag: 'failure',
    data,
    requestId,
    httpStatus,
    logMessage: 'Response type is unknown and therefore an unrecoverable failure',
  };
}

export function classifyResponse(
  cacheEntry: DaVinciCacheEntry,
  httpStatus: number,
): ResponseClassification {
  // requestId is typed as string | undefined by RTK; empty string produces a no-op cache key rather than crashing
  const requestId = cacheEntry.requestId ?? '';
  return Either.match(
    cacheEntry.isError ? Either.left(cacheEntry.error) : Either.right(cacheEntry.data),
    {
      onLeft: (error) => classifyError(error, requestId),
      onRight: (data) => classifySuccess(data, requestId, httpStatus),
    },
  );
}

export function handleResponse(
  cacheEntry: DaVinciCacheEntry,
  dispatch: Dispatch,
  status: number,
  logger: ReturnType<typeof loggerFn>,
) {
  const classification = classifyResponse(cacheEntry, status);

  switch (classification._tag) {
    case 'failure':
      logger.error(classification.logMessage);
      dispatch(
        nodeSlice.actions.failure({
          data: classification.data,
          requestId: classification.requestId,
          httpStatus: classification.httpStatus,
        }),
      );
      break;
    case 'error':
      logger.debug(classification.logMessage);
      dispatch(
        nodeSlice.actions.error({
          data: classification.data,
          requestId: classification.requestId,
          httpStatus: classification.httpStatus,
        }),
      );
      break;
    case 'success':
      dispatch(
        nodeSlice.actions.success({
          data: classification.data,
          requestId: classification.requestId,
          httpStatus: classification.httpStatus,
        }),
      );
      break;
    case 'poll':
      dispatch(nodeSlice.actions.poll({ requestId: classification.requestId }));
      break;
    case 'next':
      dispatch(
        nodeSlice.actions.next({
          data: classification.data,
          requestId: classification.requestId,
          httpStatus: classification.httpStatus,
        }),
      );
      break;
    default: {
      const exhaustive: never = classification;
      throw new Error(`Unhandled response classification: ${JSON.stringify(exhaustive)}`);
    }
  }
}
