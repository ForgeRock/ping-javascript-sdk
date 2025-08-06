/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { GenericError } from '@forgerock/sdk-types';

import type {
  FlowCollector,
  PasswordCollector,
  TextCollector,
  IdpCollector,
  SubmitCollector,
  ActionCollector,
  SingleValueCollector,
  SingleSelectCollector,
  MultiSelectCollector,
  DeviceAuthenticationCollector,
  DeviceRegistrationCollector,
  ReadOnlyCollector,
  ValidatedTextCollector,
  PhoneNumberCollector,
  ProtectCollector,
  UnknownCollector,
} from './collector.types.js';
import type { Links } from './davinci.types.js';

export type Collectors =
  | FlowCollector
  | PasswordCollector
  | TextCollector
  | SingleSelectCollector
  | IdpCollector
  | SubmitCollector
  | ActionCollector<'ActionCollector'>
  | SingleValueCollector<'SingleValueCollector'>
  | MultiSelectCollector
  | DeviceAuthenticationCollector
  | DeviceRegistrationCollector
  | PhoneNumberCollector
  | ReadOnlyCollector
  | ValidatedTextCollector
  | ProtectCollector
  | UnknownCollector;

export interface CollectorErrors {
  code: string;
  message: string;
  target: string;
}

export interface ContinueNode {
  cache: {
    key: string;
  };
  client: {
    action: string;
    collectors: Collectors[];
    description?: string;
    name?: string;
    status: 'continue';
  };
  error: null;
  httpStatus: number;
  server: {
    _links?: Links;
    id?: string;
    interactionId?: string;
    interactionToken?: string;
    href?: string;
    eventName?: string;
    status: 'continue';
  };
  status: 'continue';
}

export interface DaVinciError extends Omit<GenericError, 'error'> {
  collectors?: CollectorErrors[];
  internalHttpStatus?: number;
  message: string;
  status: 'error' | 'failure' | 'unknown';
}

export interface ErrorNode {
  cache: {
    key: string;
  };
  client: {
    action: string;
    collectors: Collectors[];
    description?: string;
    name?: string;
    status: 'error';
  };
  error: DaVinciError;
  httpStatus: number;
  server: {
    _links?: Links;
    eventName?: string;
    id?: string;
    interactionId?: string;
    interactionToken?: string;
    status: 'error';
  } | null;
  status: 'error';
}

export interface FailureNode {
  cache: {
    key: string;
  };
  client: {
    status: 'failure';
  };
  error: DaVinciError;
  httpStatus: number;
  server: {
    _links?: Links;
    eventName?: string;
    href?: string;
    id?: string;
    interactionId?: string;
    interactionToken?: string;
    status: 'failure';
  } | null;
  status: 'failure';
}

export interface StartNode {
  cache: null;
  client: {
    status: 'start';
  };
  error: DaVinciError | null;
  server: {
    status: 'start';
  };
  status: 'start';
}

export interface SuccessNode {
  cache: {
    key: string;
  };
  client: {
    authorization?: {
      code?: string;
      state?: string;
    };
    status: 'success';
  } | null;
  error: null;
  httpStatus: number;
  server: {
    _links?: Links;
    eventName?: string;
    id?: string;
    interactionId?: string;
    interactionToken?: string;
    href?: string;
    session?: string;
    status: 'success';
  };
  status: 'success';
}
