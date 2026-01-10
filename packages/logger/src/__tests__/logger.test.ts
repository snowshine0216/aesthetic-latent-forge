import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  setGlobalLogLevel,
  getGlobalLogLevel,
  resetGlobalLogLevel,
  shouldLog,
  LOG_LEVEL_VALUES,
  getDefaultLevel,
  getDefaultFormat,
  safeStringify,
} from '../index';
import type { Logger, LogLevel } from '../types';

describe('@repo/logger', () => {
  // Store original NODE_ENV
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset global state before each test
    resetGlobalLogLevel();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  // ============================================
  // Logger Creation Tests
  // ============================================
  describe('Logger Creation', () => {
    it('should create a named logger with the given name', () => {
      const logger = createLogger('MyService');
      expect(logger.name).toBe('MyService');
    });

    it('should create a logger with default options based on environment', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('TestLogger');
      expect(logger.level).toBe('debug');
    });

    it('should create a logger with custom level', () => {
      const logger = createLogger('App', { level: 'warn' });
      expect(logger.level).toBe('warn');
    });

    it('should include logger name in log output', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = createLogger('CustomPrefix', { level: 'debug' });

      logger.debug('Test message');

      expect(debugSpy).toHaveBeenCalled();
      const output = debugSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('CustomPrefix');
    });
  });

  // ============================================
  // Log Level Filtering Tests
  // ============================================
  describe('Log Level Filtering', () => {
    it('should log all messages when level is debug', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('Test', { level: 'debug' });

      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should filter debug messages when level is info', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const logger = createLogger('Test', { level: 'info' });

      logger.debug('should not appear');
      logger.info('should appear');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should only log warn and error when level is warn', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('Test', { level: 'warn' });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should only log error when level is error', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('Test', { level: 'error' });

      logger.warn('warn');
      logger.error('error');

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should log nothing when level is silent', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const logger = createLogger('Test', { level: 'silent' });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Log Output Format Tests
  // ============================================
  describe('Log Output Format', () => {
    it('should output human-readable format in console mode', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'console' });

      logger.info('Hello World');

      expect(infoSpy).toHaveBeenCalled();
      const output = infoSpy.mock.calls[0]?.[0] as string;
      // Console format includes color codes and readable structure
      expect(output).toContain('Hello World');
      expect(output).toContain('Test');
      expect(output).toContain('INFO');
    });

    it('should output structured JSON in json mode', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'json' });

      logger.info('Hello World');

      expect(infoSpy).toHaveBeenCalled();
      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('info');
      expect(parsed.name).toBe('Test');
      expect(parsed.message).toBe('Hello World');
    });

    it('should include metadata in output', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'json' });

      logger.info('Request received', { requestId: 'abc123', userId: 456 });

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.requestId).toBe('abc123');
      expect(parsed.userId).toBe(456);
    });

    it('should include timestamp in output when enabled', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', {
        level: 'info',
        format: 'json',
        timestamp: true,
      });

      logger.info('Test message');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe('string');
    });

    it('should exclude timestamp when disabled', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', {
        level: 'info',
        format: 'json',
        timestamp: false,
      });

      logger.info('Test message');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.timestamp).toBeUndefined();
    });
  });

  // ============================================
  // Child Loggers Tests
  // ============================================
  describe('Child Loggers', () => {
    it('should inherit parent log level', () => {
      const logger = createLogger('Parent', { level: 'warn' });
      const child = logger.child({ requestId: 'abc' });

      expect(child.level).toBe('warn');
    });

    it('should merge bindings from parent and child', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('API', {
        level: 'info',
        format: 'json',
        bindings: { service: 'api' },
      });
      const child = logger.child({ requestId: 'req-123' });

      child.info('Request handled');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.service).toBe('api');
      expect(parsed.requestId).toBe('req-123');
    });

    it('should not affect parent when child is modified', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const parent = createLogger('Parent', {
        level: 'info',
        format: 'json',
        bindings: { app: 'test' },
      });
      const child = parent.child({ extra: 'child-only' });

      parent.info('Parent log');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.app).toBe('test');
      expect(parsed.extra).toBeUndefined();
    });

    it('should allow nested child loggers', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Root', {
        level: 'info',
        format: 'json',
        bindings: { level: 'root' },
      });
      const child1 = logger.child({ level1: 'child1' });
      const child2 = child1.child({ level2: 'child2' });

      child2.info('Nested log');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level1).toBe('child1');
      expect(parsed.level2).toBe('child2');
    });
  });

  // ============================================
  // Global Configuration Tests
  // ============================================
  describe('Global Configuration', () => {
    it('should update default level for new loggers via setGlobalLogLevel', () => {
      setGlobalLogLevel('error');
      const logger = createLogger('Test');

      expect(logger.level).toBe('error');
      expect(getGlobalLogLevel()).toBe('error');
    });

    it('should not affect already-created loggers when global level changes', () => {
      const existingLogger = createLogger('Existing', { level: 'debug' });

      setGlobalLogLevel('error');

      expect(existingLogger.level).toBe('debug');
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================
  describe('Edge Cases', () => {
    it('should handle circular references in meta without throwing', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'json' });

      const circular: Record<string, unknown> = { name: 'test' };
      circular.self = circular;

      expect(() => logger.info('Circular test', circular)).not.toThrow();
      expect(infoSpy).toHaveBeenCalled();

      const output = infoSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('[Circular]');
    });

    it('should handle undefined meta without throwing', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info' });

      expect(() => logger.info('No meta', undefined)).not.toThrow();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should log empty string message', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'json' });

      logger.info('');

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.message).toBe('');
    });

    it('should stringify non-string first argument', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('Test', { level: 'info', format: 'json' });

      // TypeScript would normally prevent this, but we test runtime behavior
      (logger.info as (msg: unknown) => void)(12345);

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.message).toBe('12345');
    });
  });

  // ============================================
  // Level Utility Tests
  // ============================================
  describe('Level Utilities', () => {
    it('should have correct LOG_LEVEL_VALUES', () => {
      expect(LOG_LEVEL_VALUES.debug).toBe(0);
      expect(LOG_LEVEL_VALUES.info).toBe(1);
      expect(LOG_LEVEL_VALUES.warn).toBe(2);
      expect(LOG_LEVEL_VALUES.error).toBe(3);
      expect(LOG_LEVEL_VALUES.silent).toBe(4);
    });

    it('shouldLog should return correct values', () => {
      expect(shouldLog('debug', 'debug')).toBe(true);
      expect(shouldLog('debug', 'info')).toBe(true);
      expect(shouldLog('info', 'debug')).toBe(false);
      expect(shouldLog('warn', 'info')).toBe(false);
      expect(shouldLog('error', 'warn')).toBe(false);
      expect(shouldLog('silent', 'error')).toBe(false);
    });

    it('getDefaultLevel should return correct level based on NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      expect(getDefaultLevel()).toBe('info');

      process.env.NODE_ENV = 'test';
      expect(getDefaultLevel()).toBe('silent');

      process.env.NODE_ENV = 'development';
      expect(getDefaultLevel()).toBe('debug');
    });

    it('getDefaultFormat should return json in production', () => {
      process.env.NODE_ENV = 'production';
      expect(getDefaultFormat()).toBe('json');

      process.env.NODE_ENV = 'development';
      expect(getDefaultFormat()).toBe('console');
    });
  });

  // ============================================
  // Safe Stringify Tests
  // ============================================
  describe('safeStringify', () => {
    it('should stringify simple objects', () => {
      const obj = { a: 1, b: 'hello' };
      expect(safeStringify(obj)).toBe('{"a":1,"b":"hello"}');
    });

    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;

      const result = safeStringify(obj);
      expect(result).toContain('[Circular]');
    });

    it('should handle nested circular references', () => {
      const obj: Record<string, unknown> = {
        a: 1,
        nested: { b: 2 },
      };
      (obj.nested as Record<string, unknown>).parent = obj;

      const result = safeStringify(obj);
      expect(result).toContain('[Circular]');
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration', () => {
    it('should export createLogger from package', () => {
      expect(typeof createLogger).toBe('function');
    });

    it('should export Logger type (compile-time check)', () => {
      // This test verifies that the type is exported correctly
      // It's a compile-time check, not a runtime check
      const logger: Logger = createLogger('TypeTest');
      expect(logger.name).toBe('TypeTest');
    });

    it('should work with bindings option', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger('CacheService', {
        level: 'info',
        format: 'json',
        bindings: { service: 'cache', version: '1.0.0' },
      });

      logger.info('Cache hit', { key: 'user:123', ttl: 3600 });

      const output = infoSpy.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.name).toBe('CacheService');
      expect(parsed.service).toBe('cache');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.key).toBe('user:123');
      expect(parsed.ttl).toBe(3600);
      expect(parsed.message).toBe('Cache hit');
    });
  });
});
