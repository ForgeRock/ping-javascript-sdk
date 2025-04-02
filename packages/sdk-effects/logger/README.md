# Logger

A flexible and configurable logging utility for the Ping Identity JavaScript SDK.

## Features

- Multiple log levels (`error`, `warn`, `info`, `debug`, `none`)
- Ability to change log level at runtime
- Support for multiple arguments in log messages
- TypeScript support with proper type definitions

## Installation

```bash
npm install @ping-identity/effects-logger
```

## Usage

```typescript
import { logger } from '@ping-identity/effects-logger';

// Initialize the logger with a specific log level
const log = logger({ level: 'info' });

// Basic usage
log.info('Application started');
log.error('An error occurred:', new Error('Something went wrong'));

// Multiple arguments
log.debug('User data:', { id: '123', name: 'John Doe' });

// Change log level at runtime
log.changeLevel('debug'); // Enable debug logs
log.debug('Debug information is now visible');

log.changeLevel('none'); // Disable all logs
log.error('This error will not be logged');
```

## Log Levels

The logger supports the following log levels (in order of severity):

1. `error` - Critical errors that may cause the application to fail
2. `warn` - Warnings that don't interrupt application flow but require attention
3. `info` - General information about application flow
4. `debug` - Detailed information for debugging purposes
5. `none` - No logs will be output

When a log level is set, only messages of that level or higher severity will be displayed.

## API Reference

### `logger({ level })`

Initializes a new logger instance.

**Parameters:**

- `level`: The initial log level (`'error'`, `'warn'`, `'info'`, `'debug'`, or `'none'`)

**Returns:** A logger instance with the following methods:

- `error(...args)`: Log an error message
- `warn(...args)`: Log a warning message
- `info(...args)`: Log an informational message
- `debug(...args)`: Log a debug message
- `changeLevel(level)`: Change the current log level

## Building

Run `nx build logger` to build the library.

## Running unit tests

Run `nx test @forgerock/sdk-logger` to execute the unit tests via [Vitest](https://vitest.dev/).
