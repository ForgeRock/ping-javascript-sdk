/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export interface CustomLogger {
  error: (...args: LogMessage[]) => void;
  warn: (...args: LogMessage[]) => void;
  info: (...args: LogMessage[]) => void;
  debug: (...args: LogMessage[]) => void;
}

// Define log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'none';

// Define log message type
export type LogMessage = string | number | object;
