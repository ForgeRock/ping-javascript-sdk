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

import type { ActionTypes } from './request-mware.derived.js';
import type { Action, ModifiedFetchArgs } from './request-mware.types.js';

import { initQuery, middlewareWrapper } from './request-mware.effects.js';
import middleware from './request-mware.mock.js';

type BaseQueryResponse = Promise<
  QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
>;
type NextFn = () => ModifiedFetchArgs;

describe('Middleware should be called with an action', () => {
  it('should run all middleware testing action for letter and "a"', () => {
    const runMiddleware = middlewareWrapper(
      { url: new URL('https://www.example.com'), headers: new Headers() },
      {
        type: 'a' as ActionTypes,
      },
    );
    const newReq = runMiddleware(middleware);
    expect(newReq.headers).toStrictEqual(new Headers({ 'x-letter': 'true', 'x-char': 'a' }));
    expect(newReq.url.toString()).toBe('https://www.example.com/?letter=true&char=a');
  });
  it('should run all middleware testing action for number and "1"', () => {
    const runMiddleware = middlewareWrapper(
      { url: new URL('https://www.example.com'), headers: new Headers() },
      {
        type: '1' as ActionTypes,
      },
    );
    const newReq = runMiddleware(middleware);
    expect(newReq.headers).toStrictEqual(new Headers({ 'x-letter': 'false', 'x-char': '1' }));
    expect(newReq.url.toString()).toBe('https://www.example.com/?letter=false&char=1');
  });
  it('should run all middleware testing action for no match', () => {
    const runMiddleware = middlewareWrapper(
      { url: new URL('https://www.example.com') },
      {
        type: 'z' as ActionTypes,
      },
    );
    const newReq = runMiddleware(middleware);
    expect(newReq.headers).toBeUndefined();
    expect(newReq.url.toString()).toBe('https://www.example.com/');
  });
  it('should run all middleware testing add action with payload', () => {
    const runMiddleware = middlewareWrapper(
      {
        url: new URL('https://www.example.com'),
        headers: new Headers({ 'x-number': '3' }),
      },
      {
        type: 'ADD' as ActionTypes,
        payload: 'b',
      },
    );
    const newReq = runMiddleware(middleware);
    expect(newReq.headers).toStrictEqual(new Headers({ 'x-number': '3', 'x-char': 'a,b' }));
  });
  it('should not allow middleware to mutate `action`', () => {
    try {
      const runMiddleware = middlewareWrapper(
        { url: new URL('https://www.example.com') },
        {
          type: 'MUTATE-ACTION' as ActionTypes,
        },
      );
      runMiddleware(middleware);
    } catch (err) {
      if (err instanceof TypeError) {
        expect(err.message).toBe(
          `Cannot assign to read only property 'type' of object '#<Object>'`,
        );
      }
    }
  });
});

describe('initQuery function', () => {
  const requestMiddleware = [
    (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
      switch (action.type) {
        case 'DAVINCI_START':
          req.url.searchParams.set('searchParam', 'abc');
          req.headers?.set('x-new-header', '123');
          break;
      }
      next();
    },
  ];

  it('should initialize query and apply query without middleware application', async () => {
    let resultFetchArgs = {} as FetchArgs;

    const fetchArgs = { url: 'https://www.example.com' };
    const endpoint = 'start';
    const mockQuery = async (passedFetchArgs: FetchArgs) => {
      resultFetchArgs = passedFetchArgs;
      const result = Promise.resolve({
        data: 'test',
        meta: {},
        error: undefined,
      }) as BaseQueryResponse;
      return Promise.resolve(result);
    };

    const queryApi = initQuery(fetchArgs, endpoint);
    const response = await queryApi.applyQuery(
      // TODO: this is being required to be passed in
      // it probably shouldn't but we can review later
      async (fetchArgs: FetchArgs) => await mockQuery(fetchArgs),
    );

    expect(resultFetchArgs.url.toString()).toBe('https://www.example.com/');
    expect(resultFetchArgs.headers).toStrictEqual(new Headers());
    expect(response.data).toBe('test');
  });

  it('should initialize query and apply middleware', async () => {
    let resultFetchArgs = {} as FetchArgs;

    const fetchArgs = { url: 'https://www.example.com' };
    const endpoint = 'start';
    const mockQuery = async (passedFetchArgs: FetchArgs) => {
      resultFetchArgs = passedFetchArgs;
      const result = Promise.resolve({
        data: 'test',
        meta: {},
        error: undefined,
      }) as BaseQueryResponse;
      return Promise.resolve(result);
    };

    const queryApi = initQuery(fetchArgs, endpoint).applyMiddleware(requestMiddleware);
    const response = await queryApi.applyQuery(
      async (fetchArgs: FetchArgs) => await mockQuery(fetchArgs),
    );

    expect(resultFetchArgs.url.toString()).toBe('https://www.example.com/?searchParam=abc');
    expect(resultFetchArgs.headers).toStrictEqual(new Headers({ 'x-new-header': '123' }));
    expect(response.data).toBe('test');
  });

  it('should initialize query and handle undefined middleware', async () => {
    let resultFetchArgs = {} as FetchArgs;

    const fetchArgs = { url: 'https://www.example.com' };
    const endpoint = 'start';
    const mockQuery = async (passedFetchArgs: FetchArgs) => {
      resultFetchArgs = passedFetchArgs;
      const result = Promise.resolve({
        data: 'test',
        meta: {},
        error: undefined,
      }) as BaseQueryResponse;
      return Promise.resolve(result);
    };

    const queryApi = initQuery(fetchArgs, endpoint).applyMiddleware(undefined);
    const response = await queryApi.applyQuery(
      async (fetchArgs: FetchArgs) => await mockQuery(fetchArgs),
    );

    expect(resultFetchArgs.url.toString()).toBe('https://www.example.com/');
    expect(resultFetchArgs.headers).toStrictEqual(new Headers());
    expect(response.data).toBe('test');
  });

  it('should initialize query and handle unmatched action type', async () => {
    let resultFetchArgs = {} as FetchArgs;

    const fetchArgs: FetchArgs = { url: 'https://www.example.com' };
    const endpoint = 'unknown' as 'start'; // intentionally incorrect type
    const mockQuery = async (passedFetchArgs: FetchArgs) => {
      resultFetchArgs = passedFetchArgs;
      const result = Promise.resolve({
        data: 'test',
        meta: {},
        error: undefined,
      }) as BaseQueryResponse;
      return Promise.resolve(result);
    };

    const queryApi = initQuery(fetchArgs, endpoint).applyMiddleware(requestMiddleware);
    const response = await queryApi.applyQuery(
      async (fetchArgs: FetchArgs) => await mockQuery(fetchArgs),
    );

    expect(resultFetchArgs.url.toString()).toBe('https://www.example.com/');
    expect(resultFetchArgs.headers).toStrictEqual(new Headers());
    expect(response.data).toBe('test');
  });
});
