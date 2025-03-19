import {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';

import type { ActionTypes } from './request.effect.unions.js';

export interface Action {
  type: ActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface ModifiedFetchArgs extends Omit<FetchArgs, 'url'> {
  url: URL;
  headers?: Headers;
}

export type RequestMiddleware = (
  req: ModifiedFetchArgs,
  action: Action,
  next: () => ModifiedFetchArgs,
) => void;

export interface RequestObj {
  url: URL;
  init: RequestInit;
}

export interface QueryApi {
  applyMiddleware(middleware: RequestMiddleware[]): QueryApi;
  applyQuery(
    callback: (
      request: FetchArgs,
    ) => Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
  ): Promise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
}
