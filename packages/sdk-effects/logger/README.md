# @forgerock/sdk-effects-logger

## Overview

The `@forgerock/sdk-effects-logger` package provides a simple, configurable logging utility designed for use within Effect-TS applications. It offers standard logging levels (debug, info, warn, error, trace) and allows for dynamic adjustment of the log level at runtime. This utility is particularly useful for debugging and monitoring the flow of effects within your application.

## Installation

```bash
pnpm add @forgerock/sdk-effects-logger
# or
npm install @forgerock/sdk-effects-logger
# or
yarn add @forgerock/sdk-effects-logger
```

## API Reference

### `logger(options?: LoggerOptions)`

This is the main factory function that initializes the logger effect.

- **`options`**: `LoggerOptions` (optional) - An object to configure the logger.
  - **`level?: LogLevel`**: The initial log level. Defaults to `LogLevel.ERROR`.
  - **`prefix?: string`**: A string prefix to prepend to all log messages. Defaults to `''`.

- **Returns:** `LoggerService` - An object containing the logging methods.

### `logger.message(level: LogLevel, message: string, ...args: any[])`

Logs a message at a specified level. This is the generic logging method that other level-specific methods (e.g., `logger.debug`, `logger.info`) call internally.

- **`level: LogLevel`**: The log level for this message.
- **`message: string`**: The primary log message.
- **`...args: any[]`**: Additional arguments to be logged (e.g., objects, arrays).

### `logger.error(message: string, ...args: any[])`

Logs a message at the `ERROR` level.

### `logger.warn(message: string, ...args: any[])`

Logs a message at the `WARN` level.

### `logger.info(message: string, ...args: any[])`

Logs a message at the `INFO` level.

### `logger.debug(message: string, ...args: any[])`

Logs a message at the `DEBUG` level.

### `logger.trace(message: string, ...args: any[])`

Logs a message at the `TRACE` level.

### `logger.setLogLevel(level: LogLevel)`

Sets the current log level for the logger instance. Messages with a level lower than the set level will be ignored.

- **`level: LogLevel`**: The new log level to set.

### `logger.getLogLevel(): LogLevel`

Retrieves the current log level of the logger instance.

- **Returns:** `LogLevel` - The current log level.

## Usage Example

```typescript
import { logger, LogLevel } from '@forgerock/sdk-effects-logger';

// Initialize the logger with a debug level and a prefix
const myLogger = logger({ level: LogLevel.DEBUG, prefix: '[MyApp]' });

// Log messages at different levels
myLogger.error('This is an error message.', { code: 500 });
myLogger.warn('A warning occurred here.');
myLogger.info('User logged in successfully.', { userId: 'user123' });
myLogger.debug('Debugging a variable:', { data: [1, 2, 3] });
myLogger.trace('Entering function X with args:', 'arg1', 123);

// Dynamically change the log level
myLogger.setLogLevel(LogLevel.INFO);

// This debug message will not be logged now
myLogger.debug('This message will not appear because the level is INFO.');

// This info message will still be logged
myLogger.info('Application started.');

// Get the current log level
const currentLevel = myLogger.getLogLevel();
console.log(`Current log level: ${LogLevel[currentLevel]}`); // Output: Current log level: INFO
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-effects-logger
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/sdk-effects-logger
```
