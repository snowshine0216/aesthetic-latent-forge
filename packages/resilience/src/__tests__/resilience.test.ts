// ============================================
// Main Resilience Tests
// ============================================

import { describe, it, expect, vi } from 'vitest';
import {
  withResilience,
  ResilienceError,
  RetryExhaustedError,
  TimeoutError,
  BulkheadRejectedError,
  RETRY_DEFAULTS,
  BULKHEAD_DEFAULTS,
  TIMEOUT_DEFAULT,
} from '../index';

describe('withResilience', () => {
  describe('Fallback', () => {
    it('should return fallback value when all retries fail', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 2, delay: 10, jitter: false },
        fallback: { name: 'Guest', id: 'default' },
      });

      const result = await resilientFn();
      expect(result).toEqual({ name: 'Guest', id: 'default' });
    }, 10000);

    it('should call fallback function with the error', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));
      const fallbackFn = vi.fn().mockReturnValue({ fallbackData: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 2, delay: 10, jitter: false },
        fallback: fallbackFn,
      });

      const result = await resilientFn();
      expect(result).toEqual({ fallbackData: true });
      expect(fallbackFn).toHaveBeenCalled();
    }, 10000);

    it('should support async fallback functions', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));
      const fallbackFn = vi.fn().mockResolvedValue({ asyncFallback: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 2, delay: 10, jitter: false },
        fallback: fallbackFn,
      });

      const result = await resilientFn();
      expect(result).toEqual({ asyncFallback: true });
    }, 10000);

    it('should throw error when no fallback is provided', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 2, delay: 10, jitter: false },
      });

      await expect(resilientFn()).rejects.toThrow();
    }, 10000);

    it('should not use fallback when operation succeeds', async () => {
      const mockFn = vi.fn().mockResolvedValue({ success: true });
      const fallbackFn = vi.fn().mockReturnValue({ fallback: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 2 },
        fallback: fallbackFn,
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(fallbackFn).not.toHaveBeenCalled();
    });
  });

  describe('Metrics', () => {
    it('should call onRetry with correct event data on each retry', async () => {
      const onRetry = vi.fn();
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test-op',
        retry: { attempts: 3, delay: 10, jitter: false },
        metrics: { onRetry },
      });

      await resilientFn();

      expect(onRetry).toHaveBeenCalled();
      
      const event = onRetry.mock.calls[0][0];
      expect(event).toHaveProperty('attempt');
      expect(event).toHaveProperty('maxAttempts', 3);
      expect(event).toHaveProperty('error');
      expect(event).toHaveProperty('delay');
      expect(event).toHaveProperty('name', 'test-op');
    }, 10000);

    it('should call onSuccess with duration and attempt count', async () => {
      const onSuccess = vi.fn();
      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test-success',
        retry: { attempts: 3 },
        metrics: { onSuccess },
      });

      await resilientFn();

      expect(onSuccess).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          attempts: 1,
          name: 'test-success',
        })
      );
      
      const event = onSuccess.mock.calls[0][0];
      expect(event.duration).toBeGreaterThanOrEqual(0);
    });

    it('should call onFailure with error and attempt count', async () => {
      const onFailure = vi.fn();
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test-failure',
        retry: { attempts: 2, delay: 10, jitter: false },
        metrics: { onFailure },
      });

      try {
        await resilientFn();
      } catch {
        // Expected
      }

      expect(onFailure).toHaveBeenCalledOnce();
      expect(onFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-failure',
        })
      );
      
      const event = onFailure.mock.calls[0][0];
      expect(event.error).toBeDefined();
      expect(event.duration).toBeGreaterThanOrEqual(0);
    }, 10000);
  });

  describe('Logger Integration', () => {
    it('should log retry attempts when logger is provided', async () => {
      const logger = createMockLogger();
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test-logged',
        retry: { attempts: 3, delay: 10, jitter: false },
        logger,
      });

      await resilientFn();

      expect(logger.warn).toHaveBeenCalled();
    }, 10000);

    it('should log successful completion when logger is provided', async () => {
      const logger = createMockLogger();
      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test-success-log',
        retry: { attempts: 3 },
        logger,
      });

      await resilientFn();

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log final failure when logger is provided', async () => {
      const logger = createMockLogger();
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test-failure-log',
        retry: { attempts: 2, delay: 10, jitter: false },
        logger,
      });

      try {
        await resilientFn();
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    }, 10000);

    it('should not throw when logger is not provided', async () => {
      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test-no-logger',
        retry: { attempts: 3 },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
    });
  });

  describe('Type Safety', () => {
    it('should preserve function signature', async () => {
      const typedFn = async (id: string, count: number): Promise<{ id: string; count: number }> => {
        return { id, count };
      };

      const resilientFn = withResilience(typedFn, {
        name: 'typed',
        retry: { attempts: 3 },
      });

      const result = await resilientFn('test-id', 42);
      expect(result.id).toBe('test-id');
      expect(result.count).toBe(42);
    });

    it('should work with various return types', async () => {
      // String return
      const stringFn = async (): Promise<string> => 'hello';
      const resilientString = withResilience(stringFn, { retry: { attempts: 1 } });
      expect(await resilientString()).toBe('hello');

      // Number return
      const numberFn = async (): Promise<number> => 42;
      const resilientNumber = withResilience(numberFn, { retry: { attempts: 1 } });
      expect(await resilientNumber()).toBe(42);

      // Array return
      const arrayFn = async (): Promise<number[]> => [1, 2, 3];
      const resilientArray = withResilience(arrayFn, { retry: { attempts: 1 } });
      expect(await resilientArray()).toEqual([1, 2, 3]);

      // Void return
      const voidFn = async (): Promise<void> => {};
      const resilientVoid = withResilience(voidFn, { retry: { attempts: 1 } });
      expect(await resilientVoid()).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    it('should export correct default values', () => {
      expect(RETRY_DEFAULTS.attempts).toBe(3);
      expect(RETRY_DEFAULTS.delay).toBe(200);
      expect(RETRY_DEFAULTS.maxDelay).toBe(10000);
      expect(RETRY_DEFAULTS.backoff).toBe('exponential');
      expect(RETRY_DEFAULTS.jitter).toBe(true);

      expect(BULKHEAD_DEFAULTS.maxConcurrent).toBe(10);
      expect(BULKHEAD_DEFAULTS.maxQueue).toBe(100);

      expect(TIMEOUT_DEFAULT).toBe(30000);
    });
  });

  describe('Error Classes', () => {
    it('ResilienceError should be instanceof Error', () => {
      const error = new ResilienceError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ResilienceError);
    });

    it('RetryExhaustedError should extend ResilienceError', () => {
      const cause = new Error('Original');
      const error = new RetryExhaustedError(3, cause);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ResilienceError);
      expect(error).toBeInstanceOf(RetryExhaustedError);
      expect(error.attempts).toBe(3);
      expect(error.lastError).toBe(cause);
    });

    it('TimeoutError should extend ResilienceError', () => {
      const error = new TimeoutError(5000);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ResilienceError);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.duration).toBe(5000);
    });

    it('BulkheadRejectedError should extend ResilienceError', () => {
      const error = new BulkheadRejectedError(50, 100);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ResilienceError);
      expect(error).toBeInstanceOf(BulkheadRejectedError);
      expect(error.queueSize).toBe(50);
      expect(error.maxQueue).toBe(100);
    });
  });

  describe('No Retry Configuration', () => {
    it('should work without retry configuration', async () => {
      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'no-retry',
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
    });

    it('should throw on first error without retry configuration', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resilientFn = withResilience(mockFn, {
        name: 'no-retry',
      });

      await expect(resilientFn()).rejects.toThrow('Fail');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});

// ============================================
// Helper Functions
// ============================================

function createHttpError(status: number): Error {
  const error = new Error(`HTTP Error ${status}`);
  (error as any).status = status;
  return error;
}

function createMockLogger() {
  return {
    name: 'test-logger',
    level: 'debug' as const,
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
}
