// ============================================
// Bulkhead Policy Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withResilience, BulkheadRejectedError } from '../index';

describe('Bulkhead Policy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Concurrent Execution Limiting', () => {
    it('should limit concurrent executions to maxConcurrent', async () => {
      vi.useRealTimers(); // Use real timers for concurrency tests
      
      let concurrentCount = 0;
      let maxConcurrentObserved = 0;

      const slowFn = async (): Promise<string> => {
        concurrentCount++;
        maxConcurrentObserved = Math.max(maxConcurrentObserved, concurrentCount);
        await new Promise(resolve => setTimeout(resolve, 50));
        concurrentCount--;
        return 'done';
      };

      const resilientFn = withResilience(slowFn, {
        name: 'test',
        bulkhead: {
          maxConcurrent: 2,
          maxQueue: 10,
        },
      });

      // Start 5 concurrent calls
      const promises = Array(5).fill(null).map(() => resilientFn());
      
      await Promise.all(promises);

      // Only 2 should have executed concurrently at most
      expect(maxConcurrentObserved).toBeLessThanOrEqual(2);
    });

    it('should queue requests when maxConcurrent is reached', async () => {
      vi.useRealTimers();
      
      const callOrder: number[] = [];
      let callId = 0;

      const slowFn = async (): Promise<number> => {
        const id = ++callId;
        await new Promise(resolve => setTimeout(resolve, 20));
        callOrder.push(id);
        return id;
      };

      const resilientFn = withResilience(slowFn, {
        name: 'test',
        bulkhead: {
          maxConcurrent: 1,
          maxQueue: 5,
        },
      });

      // Start multiple calls
      const promises = Array(3).fill(null).map(() => resilientFn());
      
      await Promise.all(promises);

      // All calls should complete
      expect(callOrder.length).toBe(3);
    });
  });

  describe('Queue Overflow', () => {
    it('should throw BulkheadRejectedError when queue is full', async () => {
      vi.useRealTimers();
      
      const neverResolve = async (): Promise<never> => {
        return new Promise(() => {
          // Never resolves
        });
      };

      const resilientFn = withResilience(neverResolve, {
        name: 'test',
        bulkhead: {
          maxConcurrent: 1,
          maxQueue: 2,
        },
      });

      // Start filling the bulkhead
      const backgroundPromises = [
        resilientFn(), // Executing
        resilientFn(), // Queued 1
        resilientFn(), // Queued 2
      ];

      // Small delay to let them queue up
      await new Promise(resolve => setTimeout(resolve, 10));

      // This should be rejected - queue is full
      await expect(resilientFn()).rejects.toThrow(BulkheadRejectedError);

      // Clean up - these will hang forever, so we don't wait for them
    });

    it('should include queue information in BulkheadRejectedError', async () => {
      vi.useRealTimers();
      
      const neverResolve = async (): Promise<never> => {
        return new Promise(() => {});
      };

      const resilientFn = withResilience(neverResolve, {
        name: 'test',
        bulkhead: {
          maxConcurrent: 1,
          maxQueue: 1,
        },
      });

      // Fill up the bulkhead
      resilientFn(); // Executing
      resilientFn(); // Queued

      await new Promise(resolve => setTimeout(resolve, 10));

      try {
        await resilientFn();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BulkheadRejectedError);
        if (error instanceof BulkheadRejectedError) {
          expect(error.maxQueue).toBe(1);
        }
      }
    });
  });

  describe('Queue Processing', () => {
    it('should process queued requests when slots become available', async () => {
      vi.useRealTimers();
      
      const results: string[] = [];

      const quickFn = async (id: string): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push(id);
        return id;
      };

      const resilientFn = withResilience(quickFn, {
        name: 'test',
        bulkhead: {
          maxConcurrent: 1,
          maxQueue: 5,
        },
      });

      // Queue up several calls
      const promises = [
        resilientFn('a'),
        resilientFn('b'),
        resilientFn('c'),
      ];

      await Promise.all(promises);

      // All should have been processed
      expect(results.length).toBe(3);
      expect(results).toContain('a');
      expect(results).toContain('b');
      expect(results).toContain('c');
    });
  });

  describe('Metrics Callback', () => {
    it('should call onBulkheadRejected when request is rejected', async () => {
      vi.useRealTimers();
      
      const onBulkheadRejected = vi.fn();

      const neverResolve = async (): Promise<never> => {
        return new Promise(() => {});
      };

      const resilientFn = withResilience(neverResolve, {
        name: 'test-bulkhead',
        bulkhead: {
          maxConcurrent: 1,
          maxQueue: 0, // No queue, reject immediately
        },
        metrics: {
          onBulkheadRejected,
        },
      });

      // First call executes
      resilientFn();

      await new Promise(resolve => setTimeout(resolve, 10));

      // Second call should be rejected
      try {
        await resilientFn();
      } catch {
        // Expected
      }

      expect(onBulkheadRejected).toHaveBeenCalled();
      expect(onBulkheadRejected).toHaveBeenCalledWith(
        expect.objectContaining({
          maxQueue: 0,
          name: 'test-bulkhead',
        })
      );
    });
  });
});
