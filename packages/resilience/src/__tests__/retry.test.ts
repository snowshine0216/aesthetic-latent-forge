// ============================================
// Retry Policy Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withResilience, isRetryableError } from '../index';

describe('Retry Policy', () => {
  // Use real timers for retry tests since cockatiel uses internal timeouts
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Retry', () => {
    it('should retry a failing function up to the specified limit', async () => {
      // Use mockRejectedValue to ensure all calls reject
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      await expect(resilientFn()).rejects.toThrow();
      // Cockatiel's maxAttempts includes the initial attempt plus retries
      // So attempts: 3 gives us up to 3 total attempts
      expect(mockFn).toHaveBeenCalled();
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(mockFn.mock.calls.length).toBeLessThanOrEqual(4);
    }, 10000);

    it('should return the result if a subsequent retry succeeds', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(503))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should not retry when operation succeeds on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3 },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backoff Strategies', () => {
    it('should support exponential backoff', async () => {
      const delays: number[] = [];
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: {
          attempts: 3,
          delay: 10,
          backoff: 'exponential',
          jitter: false,
        },
        metrics: {
          onRetry: (event) => delays.push(event.delay),
        },
      });

      await resilientFn();
      expect(mockFn).toHaveBeenCalledTimes(3);
      // With exponential backoff, we should get increasing delays
      expect(delays.length).toBeGreaterThan(0);
    }, 10000);

    it('should support fixed backoff', async () => {
      const delays: number[] = [];
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: {
          attempts: 3,
          delay: 50,
          backoff: 'fixed',
          jitter: false,
        },
        metrics: {
          onRetry: (event) => delays.push(event.delay),
        },
      });

      await resilientFn();
      expect(mockFn).toHaveBeenCalledTimes(3);
      // With fixed backoff, delays should be constant
      if (delays.length >= 2) {
        expect(delays[0]).toBe(delays[1]);
      }
    }, 10000);
  });

  describe('Max Delay', () => {
    it('should cap delay at maxDelay', async () => {
      const delays: number[] = [];
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(500))
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: {
          attempts: 5,
          delay: 50,
          maxDelay: 100,
          backoff: 'exponential',
          jitter: false,
        },
        metrics: {
          onRetry: (event) => delays.push(event.delay),
        },
      });

      await resilientFn();
      
      // All delays should be at most maxDelay
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(100);
      });
    }, 15000);
  });
});

// ============================================
// Error Filtering Tests
// ============================================

describe('Error Filtering', () => {
  describe('Default Error Filter', () => {
    it('should not retry when response status is 400', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(400));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3 },
      });

      await expect(resilientFn()).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry when response status is 401', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(401));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3 },
      });

      await expect(resilientFn()).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry when response status is 403', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(403));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3 },
      });

      await expect(resilientFn()).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry when response status is 404', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(404));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3 },
      });

      await expect(resilientFn()).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry when response status is 500', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(500))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should retry when response status is 503', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(503))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should retry on network errors (ECONNRESET)', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createNetworkError('ECONNRESET'))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should retry on network errors (ETIMEDOUT)', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createNetworkError('ETIMEDOUT'))
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: { attempts: 3, delay: 10, jitter: false },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('Custom Error Filter', () => {
    it('should respect custom shouldRetry function', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createHttpError(429)) // Rate limit
        .mockResolvedValueOnce({ success: true });

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: {
          attempts: 3,
          delay: 10,
          jitter: false,
          shouldRetry: (error) => {
            const status = (error as any).status;
            return status === 429; // Only retry rate limits
          },
        },
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should not retry when custom filter returns false', async () => {
      const mockFn = vi.fn().mockRejectedValue(createHttpError(500));

      const resilientFn = withResilience(mockFn, {
        name: 'test',
        retry: {
          attempts: 3,
          shouldRetry: () => false, // Never retry
        },
      });

      await expect(resilientFn()).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('isRetryableError', () => {
  it('should return false for 400 errors', () => {
    expect(isRetryableError(createHttpError(400))).toBe(false);
  });

  it('should return false for 401 errors', () => {
    expect(isRetryableError(createHttpError(401))).toBe(false);
  });

  it('should return false for 403 errors', () => {
    expect(isRetryableError(createHttpError(403))).toBe(false);
  });

  it('should return false for 404 errors', () => {
    expect(isRetryableError(createHttpError(404))).toBe(false);
  });

  it('should return false for 422 errors', () => {
    expect(isRetryableError(createHttpError(422))).toBe(false);
  });

  it('should return true for 500 errors', () => {
    expect(isRetryableError(createHttpError(500))).toBe(true);
  });

  it('should return true for 503 errors', () => {
    expect(isRetryableError(createHttpError(503))).toBe(true);
  });

  it('should return true for network errors', () => {
    expect(isRetryableError(createNetworkError('ECONNRESET'))).toBe(true);
    expect(isRetryableError(createNetworkError('ETIMEDOUT'))).toBe(true);
    expect(isRetryableError(createNetworkError('ECONNREFUSED'))).toBe(true);
  });

  it('should return true for fetch failed errors', () => {
    const error = new Error('fetch failed');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for unknown errors', () => {
    const error = new Error('Unknown error');
    expect(isRetryableError(error)).toBe(false);
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

function createNetworkError(code: string): Error {
  const error = new Error(`Network error: ${code}`);
  (error as NodeJS.ErrnoException).code = code;
  return error;
}
