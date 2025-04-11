import { describe, it, expect, vi, beforeEach } from 'vitest';
import logger from './logger.js';

describe('logger', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const consoleWarnSpy = vi.spyOn(console, 'warn');
  const consoleInfoSpy = vi.spyOn(console, 'info');
  const consoleDebugSpy = vi.spyOn(console, 'debug');

  beforeEach(() => {
    consoleErrorSpy.mockReset();
    consoleWarnSpy.mockReset();
    consoleInfoSpy.mockReset();
    consoleDebugSpy.mockReset();
    logger.setLevel('info'); // Reset to default level before each test
  });

  it('should log error messages when level is error or higher', () => {
    logger.setLevel('error');
    logger.error('test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    logger.warn('test warn');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log warn messages when level is warn or higher', () => {
    logger.setLevel('warn');
    logger.warn('test warn');
    expect(consoleWarnSpy).toHaveBeenCalledWith('test warn');
    logger.info('test info');
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('should log info messages when level is info or higher', () => {
    logger.setLevel('info');
    logger.info('test info');
    expect(consoleInfoSpy).toHaveBeenCalledWith('test info');
    logger.debug('test debug');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should log debug messages when level is debug', () => {
    logger.setLevel('debug');
    logger.debug('test debug');
    expect(consoleDebugSpy).toHaveBeenCalledWith('test debug');
  });

  it('should not log messages when level is none', () => {
    logger.setLevel('none');
    logger.error('test error');
    logger.warn('test warn');
    logger.info('test info');
    logger.debug('test debug');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple arguments correctly', () => {
    logger.setLevel('debug');
    logger.debug('test', 123, { key: 'value' });
    expect(consoleDebugSpy).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });
});
