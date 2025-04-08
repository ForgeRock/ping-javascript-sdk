/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/*
 * @forgerock/javascript-sdk
 *
 * middleware.mock.data.ts
 *
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { Action, ModifiedFetchArgs, RequestMiddleware } from './request.effect.types.js';
import type { ActionTypes } from './request.effect.unions.js';

type NextFn = () => ModifiedFetchArgs;

const a = 'a' as ActionTypes;
const b = 'b' as ActionTypes;
const one = '1' as ActionTypes;
const two = '2' as ActionTypes;
const add = 'ADD' as ActionTypes;
const reassignment = 'REASSIGNMENT' as ActionTypes;
const mutateAction = 'MUTATE-ACTION' as ActionTypes;

const middleware: RequestMiddleware[] = [
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case a:
      case b:
        req.url.searchParams.set('letter', 'true');
        if (req.headers) req.headers.set('x-letter', 'true');
        break;
      case one:
      case two:
        req.url.searchParams.set('letter', 'false');
        if (req.headers) req.headers.set('x-letter', 'false');
        break;
    }
    next();
  },
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case a:
        req.url.searchParams.set('char', 'a');
        if (req.headers) req.headers.set('x-char', 'a');
        break;
      case b:
        req.url.searchParams.set('char', 'b');
        if (req.headers) req.headers.set('x-char', 'b');
        break;
    }
    next();
  },
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case one:
        req.url.searchParams.set('char', '1');
        if (req.headers) req.headers.set('x-char', '1');
        break;
      case two:
        req.url.searchParams.set('char', '2');
        if (req.headers) req.headers.set('x-char', '2');
        break;
    }
    next();
  },
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case add:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.headers?.set('x-char', 'a,' + action.payload);
        break;
    }
    next();
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case reassignment:
        req = {
          url: new URL('https://bad.com'),
          headers: new Headers({ 'x-bad': 'true' }),
        };
        break;
    }
    next();
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (req: ModifiedFetchArgs, action: Action, next: NextFn): void => {
    switch (action.type) {
      case mutateAction:
        action.type = 'hello' as ActionTypes;
        break;
    }
    next();
  },
];

export default middleware;
