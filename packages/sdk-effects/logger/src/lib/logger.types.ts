/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export type { LogLevel } from '@forgerock/sdk-types';

export interface CustomLogger {
  error: (...args: LogMessage[]) => void;
  warn: (...args: LogMessage[]) => void;
  info: (...args: LogMessage[]) => void;
  debug: (...args: LogMessage[]) => void;
}

export type LogMessage = string | number | object;
