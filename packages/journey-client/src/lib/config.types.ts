/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { BaseConfig, WellKnownResponse, PathsConfig } from '@forgerock/sdk-types';
import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';

export interface JourneyServerConfig {
  baseUrl: string;
  paths?: PathsConfig['paths'];
  timeout?: number;
}

export interface JourneyClientConfig extends BaseConfig {
  serverConfig: JourneyServerConfig;
  middleware?: Array<RequestMiddleware>;
  realmPath?: string;
}

export interface WellknownServerConfig {
  baseUrl: string;
  wellknown: string;
  paths?: PathsConfig['paths'];
  timeout?: number;
}

export interface AsyncJourneyClientConfig {
  serverConfig: WellknownServerConfig;
  middleware?: Array<RequestMiddleware>;
  realmPath?: string;
}

export interface InternalJourneyClientConfig extends JourneyClientConfig {
  wellknownResponse?: WellKnownResponse;
}

export type JourneyConfigInput = JourneyClientConfig | AsyncJourneyClientConfig;

export type { RequestMiddleware };
