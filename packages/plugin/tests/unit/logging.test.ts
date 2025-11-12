/**
 * Simplified unit tests for logging functionality.
 *
 * Tests verify that logging methods work without testing exact output format.
 */

import { Logger, createLogger } from '../../src/utils/logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof jest.spyOn>;
  let consoleWarnSpy: ReturnType<typeof jest.spyOn>;
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Verbose Logging', () => {
    it('should log when verbose is enabled', () => {
      const logger = new Logger({ verbose: true, debug: false });
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not log when verbose is disabled', () => {
      const logger = new Logger({ verbose: false, debug: false });
      logger.info('Test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Debug Mode', () => {
    it('should log debug messages when debug is enabled', () => {
      const logger = new Logger({ verbose: false, debug: true });
      logger.debug('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not log debug messages when debug is disabled', () => {
      const logger = new Logger({ verbose: false, debug: false });
      logger.debug('Debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Warning and Error Logging', () => {
    it('should always log warnings', () => {
      const logger = new Logger({ verbose: false, debug: false });
      logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should always log errors', () => {
      const logger = new Logger({ verbose: false, debug: false });
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Logger Factory', () => {
    it('should create logger with createLogger factory', () => {
      const logger = createLogger({ verbose: true, debug: false });
      expect(logger).toBeInstanceOf(Logger);
    });
  });
});
