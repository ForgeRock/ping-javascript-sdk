/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import logger from './logger.effects.js';

describe('logger', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const consoleWarnSpy = vi.spyOn(console, 'warn');
  const consoleInfoSpy = vi.spyOn(console, 'info');
  const consoleDebugSpy = vi.spyOn(console, 'debug');

  // Reset all spies before each test
  beforeEach(() => {
    consoleErrorSpy.mockReset();
    consoleWarnSpy.mockReset();
    consoleInfoSpy.mockReset();
    consoleDebugSpy.mockReset();
  });

  it('should log error messages when level is error or higher', () => {
    const log = logger({ level: 'error' });
    log.error('test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    log.warn('test warn');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log warn messages when level is warn or higher', () => {
    const log = logger({ level: 'warn' });
    log.warn('test warn');
    expect(consoleWarnSpy).toHaveBeenCalledWith('test warn');
    log.info('test info');
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('should log info messages when level is info or higher', () => {
    const log = logger({ level: 'info' });
    log.info('test info');
    expect(consoleInfoSpy).toHaveBeenCalledWith('test info');
    log.debug('test debug');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should log debug messages when level is debug', () => {
    const log = logger({ level: 'debug' });
    log.debug('test debug');
    expect(consoleDebugSpy).toHaveBeenCalledWith('test debug');
  });

  it('should not log messages when level is none', () => {
    const log = logger({ level: 'none' });
    log.error('test error');
    log.warn('test warn');
    log.info('test info');
    log.debug('test debug');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple arguments correctly', () => {
    const log = logger({ level: 'debug' });
    log.debug('test', 123, { key: 'value' });
    expect(consoleDebugSpy).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });

  it('should change log level', () => {
    const log = logger({ level: 'warn' });
    log.error('test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    log.changeLevel('none');
    log.warn('test warn');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
