/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

import { actionTypes } from './request-mware.derived.js';

import type { ActionTypes, EndpointTypes } from './request-mware.derived.js';
import type { ModifiedFetchArgs, RequestMiddleware } from './request-mware.types.js';

/**
 * @function middlewareWrapper - A "Node" and "Redux" style middleware that is called just before
 * the request is made from the SDK. This allows you access to the request for modification.
 * @param request - A request object container of the URL and the Request Init object
 * @param action - The action object that is passed into the middleware communicating intent
 * @param action.type - A "Redux" style type that contains the serialized action
 * @param action.payload - The payload of the action that can contain metadata
 * @returns {function} - Function that takes middleware parameter & runs middleware against request
 */
export function middlewareWrapper(
  request: ModifiedFetchArgs,
  // eslint-disable-next-line
  { type, payload }: { type: ActionTypes; payload?: any },
): (middleware: RequestMiddleware<typeof type, typeof payload>[] | undefined) => ModifiedFetchArgs {
  // no mutation and no reassignment
  const actionCopy = Object.freeze({ type, payload });

  return (middleware: RequestMiddleware<typeof type, typeof payload>[] | undefined) => {
    if (!Array.isArray(middleware)) {
      return request;
    }

    // Copy middleware so the `shift` below doesn't mutate source
    const mwareCopy = middleware.map((fn) => fn);

    function iterator(): ModifiedFetchArgs {
      const nextMiddlewareToBeCalled = mwareCopy.shift();
      if (nextMiddlewareToBeCalled) nextMiddlewareToBeCalled(request, actionCopy, iterator);
      return request;
    }

    return iterator();
  };
}

/**
 * @function initQuery - Initializes a query object with the provided request object
 * @param {FetchArgs} fetchArgs - The request object to initialize the query with
 * @param {string} endpoint - The endpoint to be used for the query
 * @returns
 */
export function initQuery(
  fetchArgs: FetchArgs,
  endpoint: EndpointTypes,
  payload?: Record<string, unknown>,
) {
  let modifiedRequest: ModifiedFetchArgs = {
    ...fetchArgs,
    url: new URL(fetchArgs.url),
    headers: new Headers(fetchArgs.headers as Record<string, string>),
  };
  const queryApi = {
    applyMiddleware(
      middleware: RequestMiddleware<ActionTypes, ModifiedFetchArgs['body']>[] | undefined,
    ) {
      // Iterates and executes provided middleware functions
      // Allow middleware to mutate `request` argument
      const runMiddleware = middlewareWrapper(modifiedRequest, {
        type: actionTypes[endpoint],
        payload: payload || {},
      });
      modifiedRequest = runMiddleware(middleware);

      return queryApi;
    },
    async applyQuery(
      callback: (
        request: FetchArgs,
      ) => Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
    ) {
      return await callback({ ...modifiedRequest, url: modifiedRequest.url.toString() });
    },
  };

  return queryApi;
}
