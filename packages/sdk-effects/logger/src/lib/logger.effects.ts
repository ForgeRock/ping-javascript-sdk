/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { LogLevel, LogMessage } from './logger.types.js';

export default function loggerInit(config: { level: LogLevel }) {
  let logLevel: LogLevel = config.level || 'info';

  // Implement log functions
  const logFunctions = {
    error: (...args: LogMessage[]) => console.error(...args),
    warn: (...args: LogMessage[]) => console.warn(...args),
    info: (...args: LogMessage[]) => console.info(...args),
    debug: (...args: LogMessage[]) => console.debug(...args),
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
