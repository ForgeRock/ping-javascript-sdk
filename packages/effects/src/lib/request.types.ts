/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

export const actionTypes = {
  start: 'DAVINCI_START',
  next: 'DAVINCI_NEXT',
  flow: 'DAVINCI_FLOW',
  success: 'DAVINCI_SUCCESS',
  error: 'DAVINCI_ERROR',
  failure: 'DAVINCI_FAILURE',
  resume: 'DAVINCI_RESUME',
} as const;

export type ActionTypes = (typeof actionTypes)[keyof typeof actionTypes];
export type EndpointTypes = keyof typeof actionTypes;
export interface Action<Type extends ActionTypes = ActionTypes, Payload = unknown> {
  type: Type;
  payload: Payload;
}

export interface ModifiedFetchArgs extends Omit<FetchArgs, 'url'> {
  url: URL;
  headers?: Headers;
}

export type RequestMiddleware<Type extends ActionTypes = ActionTypes, Payload = unknown> = (
  req: ModifiedFetchArgs,
  action: Action<Type, Payload>,
  next: () => ModifiedFetchArgs,
) => void;

export interface RequestObj {
  url: URL;
  init: RequestInit;
}

export interface QueryApi<Type extends ActionTypes = ActionTypes, Payload = unknown> {
  applyMiddleware(middleware: RequestMiddleware<Type, Payload>[]): QueryApi<ActionTypes, unknown>;
  applyQuery(
    callback: (
      request: FetchArgs,
    ) => Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
  ): Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
}
