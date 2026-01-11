// ============================================
// Timeout Policy Tests
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { withResilience, TimeoutError } from '../index';

describe('Timeout Policy', () => {
  describe('Timeout Exceeded', () => {
    it('should throw TimeoutError when operation exceeds timeout', async () => {
      const slowFn = async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'done';
      };

      const resilientFn = withResilience(slowFn, {
        name: 'test',
        timeout: 100,
      });

      await expect(resilientFn()).rejects.toThrow(TimeoutError);
    }, 5000);

    it('should include timeout duration in TimeoutError', async () => {
      const slowFn = async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'done';
      };

      const resilientFn = withResilience(slowFn, {
        name: 'test',
        timeout: 100,
      });

      try {
        await resilientFn();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TimeoutError);
        if (error instanceof TimeoutError) {
          expect(error.duration).toBe(100);
        }
      }
    }, 5000);
  });

  describe('Complete Before Timeout', () => {
    it('should return result if operation completes in time', async () => {
      const quickFn = async (): Promise<{ success: boolean }> => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { success: true };
      };

      const resilientFn = withResilience(quickFn, {
        name: 'test',
        timeout: 1000,
      });

      const result = await resilientFn();
      expect(result).toEqual({ success: true });
    });

    it('should work without throwing when operation completes quickly', async () => {
      const boundaryFn = async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      };

      const resilientFn = withResilience(boundaryFn, {
        name: 'test',
        timeout: 500,
      });

      const result = await resilientFn();
      expect(result).toBe('success');
    });
  });

  describe('Metrics Callback', () => {
    it('should call onTimeout when operation times out', async () => {
      const onTimeout = vi.fn();

      const slowFn = async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'done';
      };

      const resilientFn = withResilience(slowFn, {
        name: 'test-timeout',
        timeout: 50,
        metrics: {
          onTimeout,
        },
      });

      try {
        await resilientFn();
      } catch {
        // Expected
      }

      expect(onTimeout).toHaveBeenCalled();
      expect(onTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 50,
          name: 'test-timeout',
        })
      );
    }, 5000);

    it('should not call onTimeout when operation completes in time', async () => {
      const onTimeout = vi.fn();

      const quickFn = async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      };

      const resilientFn = withResilience(quickFn, {
        name: 'test',
        timeout: 1000,
        metrics: {
          onTimeout,
        },
      });

      await resilientFn();

      expect(onTimeout).not.toHaveBeenCalled();
    });
  });
});
