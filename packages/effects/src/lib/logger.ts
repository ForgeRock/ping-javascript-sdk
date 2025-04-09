// Define log levels
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'none';

// Define log message type
type LogMessage = string | number | object;

// Create logger configuration
interface LoggerConfig {
  level: LogLevel;
}

const config: LoggerConfig = {
  level: 'info', // Default log level
};

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
const logger = {
  setLevel: (level: LogLevel) => {
    config.level = level;
  },
  error: (...args: LogMessage[]) => {
    if (shouldLog('error', config.level)) {
      logFunctions.error(...args);
    }
  },
  warn: (...args: LogMessage[]) => {
    if (shouldLog('warn', config.level)) {
      logFunctions.warn(...args);
    }
  },
  info: (...args: LogMessage[]) => {
    if (shouldLog('info', config.level)) {
      logFunctions.info(...args);
    }
  },
  debug: (...args: LogMessage[]) => {
    if (shouldLog('debug', config.level)) {
      logFunctions.debug(...args);
    }
  },
};

export default logger;
