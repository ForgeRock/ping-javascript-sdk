/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { CustomLogger, LogLevel, LogMessage } from './logger.types.js';

export function logger(config: { level: LogLevel; custom?: CustomLogger }) {
  let logLevel: LogLevel = config.level || 'info';
  const custom = config.custom;

  // Implement log functions
  const logFunctions = {
    error: (...args: LogMessage[]) =>
      custom?.error ? custom.error(...args) : console.error(...args),
    warn: (...args: LogMessage[]) => (custom?.warn ? custom.warn(...args) : console.warn(...args)),
    info: (...args: LogMessage[]) => (custom?.info ? custom.info(...args) : console.info(...args)),
    debug: (...args: LogMessage[]) =>
      custom?.debug ? custom.debug(...args) : console.debug(...args),
  };

  // Implement level inclusion
  const shouldLog = (level: LogLevel, currentLevel: LogLevel): boolean => {
    const levelMap: { [key in LogLevel]: number } = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      none: -1,
    };

    return levelMap[level] <= levelMap[currentLevel] && levelMap[currentLevel] !== -1;
  };

  // Compose logger module
  return {
    changeLevel: (level: LogLevel) => {
      logLevel = level;
    },
    error: (...args: LogMessage[]) => {
      if (shouldLog('error', logLevel)) {
        logFunctions.error(...args);
      }
    },
    warn: (...args: LogMessage[]) => {
      if (shouldLog('warn', logLevel)) {
        logFunctions.warn(...args);
      }
    },
    info: (...args: LogMessage[]) => {
      if (shouldLog('info', logLevel)) {
        logFunctions.info(...args);
      }
    },
    debug: (...args: LogMessage[]) => {
      if (shouldLog('debug', logLevel)) {
        logFunctions.debug(...args);
      }
    },
  };
}
