/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/** *************************************************************
 * Types for legacy middleware configuration
 * **************************************************************/

export enum LegacyActionTypes {
  Authenticate = 'AUTHENTICATE',
  Authorize = 'AUTHORIZE',
  EndSession = 'END_SESSION',
  Logout = 'LOGOUT',
  ExchangeToken = 'EXCHANGE_TOKEN',
  RefreshToken = 'REFRESH_TOKEN',
  ResumeAuthenticate = 'RESUME_AUTHENTICATE',
  RevokeToken = 'REVOKE_TOKEN',
  StartAuthenticate = 'START_AUTHENTICATE',
  UserInfo = 'USER_INFO',
  WellKnown = 'WELL_KNOWN',
}
interface Action {
  type: LegacyActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}
interface RequestObj {
  url: URL;
  init: RequestInit;
}
export type LegacyRequestMiddleware = (
  req: RequestObj,
  action: Action,
  next: () => RequestObj,
) => void;
