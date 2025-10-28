/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const actionTypes = {
  // Journey
  begin: 'JOURNEY_START',
  continue: 'JOURNEY_NEXT',
  terminate: 'JOURNEY_TERMINATE',

  // DaVinci
  start: 'DAVINCI_START',
  next: 'DAVINCI_NEXT',
  flow: 'DAVINCI_FLOW',
  success: 'DAVINCI_SUCCESS',
  error: 'DAVINCI_ERROR',
  failure: 'DAVINCI_FAILURE',
  resume: 'DAVINCI_RESUME',

  // OIDC
  authorize: 'AUTHORIZE',
  tokenExchange: 'TOKEN_EXCHANGE',
  revoke: 'REVOKE',
  userInfo: 'USER_INFO',
  endSession: 'END_SESSION',
} as const;

export type ActionTypes = (typeof actionTypes)[keyof typeof actionTypes];
export type EndpointTypes = keyof typeof actionTypes;
