// ============================================
// Main Resilience Implementation
// ============================================

import type { Logger } from '@repo/logger';
import type { ResilienceOptions } from './types';
import { RETRY_DEFAULTS, BULKHEAD_DEFAULTS, TIMEOUT_DEFAULT } from './types';
import { RetryExhaustedError, TimeoutError, BulkheadRejectedError } from './errors';
import { isRetryableError } from './defaults';
import {
  createRetryPolicy,
  createBulkheadPolicy,
  createTimeoutPolicy,
  composePolicies,
  CockatielBulkheadRejectedError,
  CockatielTimeoutError,
} from './policies';
import type { IPolicy } from 'cockatiel';

// ============================================
// Main API
// ============================================

/**
 * Wrap an async function with resilience policies.
 *
 * @example
 * const resilientFetch = withResilience(fetchUser, {
 *   name: 'fetchUser',
 *   retry: { attempts: 3, backoff: 'exponential' },
 *   timeout: 5000,
 * });
 *
 * const user = await resilientFetch('user-123');
 */
export const withResilience = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ResilienceOptions<TReturn>
): ((...args: TArgs) => Promise<TReturn>) => {
  const { name, retry, bulkhead, timeout, fallback, logger, metrics } = options;

  // Build policies array (order matters: timeout -> bulkhead -> retry)
  const policies: IPolicy[] = [];

  // Create timeout policy first (outermost)
  if (timeout !== undefined) {
    const timeoutPolicy = createTimeoutPolicy({
      timeout,
      logger,
      metrics,
      name,
    });
    policies.push(timeoutPolicy);
  }

  // Create bulkhead policy second
  if (bulkhead) {
    const bulkheadPolicy = createBulkheadPolicy({
      maxConcurrent: bulkhead.maxConcurrent ?? BULKHEAD_DEFAULTS.maxConcurrent,
      maxQueue: bulkhead.maxQueue ?? BULKHEAD_DEFAULTS.maxQueue,
      logger,
      metrics,
      name,
    });
    policies.push(bulkheadPolicy);
  }

  // Create retry policy last (innermost)
  // Only if retry options are provided
  if (retry) {
    const retryPolicy = createRetryPolicy({
      attempts: retry.attempts ?? RETRY_DEFAULTS.attempts,
      delay: retry.delay ?? RETRY_DEFAULTS.delay,
      maxDelay: retry.maxDelay ?? RETRY_DEFAULTS.maxDelay,
      backoff: retry.backoff ?? RETRY_DEFAULTS.backoff,
      jitter: retry.jitter ?? RETRY_DEFAULTS.jitter,
      shouldRetry: retry.shouldRetry ?? isRetryableError,
      logger,
      metrics,
      name,
    });
    policies.push(retryPolicy);
  }

  // Compose all policies
  const composedPolicy = composePolicies(policies);

  // Return the wrapped function
  return async (...args: TArgs): Promise<TReturn> => {
    const startTime = Date.now();
    let attemptCount = 0;

    const executeWithTracking = async (): Promise<TReturn> => {
      attemptCount++;
      return fn(...args);
    };

    try {
      const result = await executeWithFallback(
        () => composedPolicy.execute(executeWithTracking),
        fallback,
        logger,
        name,
        {
          timeout: timeout ?? TIMEOUT_DEFAULT,
          maxQueue: bulkhead?.maxQueue ?? BULKHEAD_DEFAULTS.maxQueue,
        }
      );

      // Success metrics
      const duration = Date.now() - startTime;
      metrics?.onSuccess?.({
        attempts: attemptCount,
        duration,
        name,
      });

      logger?.info(`Operation completed successfully`, {
        operation: name,
        duration,
        attempts: attemptCount,
      });

      return result;
    } catch (error) {
      // Transform and handle errors
      const transformedError = transformCockatielError(error, {
        timeout: timeout ?? TIMEOUT_DEFAULT,
        maxQueue: bulkhead?.maxQueue ?? BULKHEAD_DEFAULTS.maxQueue,
        attempts: retry?.attempts ?? RETRY_DEFAULTS.attempts,
      });

      // Failure metrics
      const duration = Date.now() - startTime;
      metrics?.onFailure?.({
        attempts: attemptCount,
        duration,
        error: transformedError,
        name,
      });

      logger?.error(`Operation failed`, {
        operation: name,
        duration,
        attempts: attemptCount,
        error: transformedError.message,
      });

      throw transformedError;
    }
  };
};

// ============================================
// Fallback Execution
// ============================================

/**
 * Apply fallback to a function execution.
 */
const executeWithFallback = async <TReturn>(
  execute: () => Promise<TReturn>,
  fallback: TReturn | ((error: Error) => TReturn | Promise<TReturn>) | undefined,
  logger?: Logger,
  name?: string,
  errorConfig?: { timeout: number; maxQueue: number }
): Promise<TReturn> => {
  try {
    return await execute();
  } catch (error) {
    // Transform cockatiel errors before applying fallback
    const transformedError = transformCockatielError(error, {
      ...errorConfig,
      attempts: 0, // Not relevant for fallback
    });

    // If no fallback provided, rethrow
    if (fallback === undefined) {
      throw transformedError;
    }

    // Log fallback usage
    logger?.warn(`Falling back after error`, {
      operation: name,
      error: transformedError.message,
    });

    // Apply fallback
    if (typeof fallback === 'function') {
      return (fallback as (error: Error) => TReturn | Promise<TReturn>)(transformedError);
    }

    return fallback;
  }
};

// ============================================
// Error Transformation
// ============================================

/**
 * Transform cockatiel errors to our custom error types.
 */
const transformCockatielError = (
  error: unknown,
  config: { timeout?: number; maxQueue?: number; attempts?: number }
): Error => {
  if (error instanceof CockatielBulkheadRejectedError) {
    return new BulkheadRejectedError(config.maxQueue ?? 0, config.maxQueue ?? 0);
  }
  if (error instanceof CockatielTimeoutError) {
    return new TimeoutError(config.timeout ?? 0);
  }
  // Check if all retries were exhausted
  if (error instanceof Error && error.message?.includes('retry')) {
    return new RetryExhaustedError(config.attempts ?? 0, error);
  }
  return error as Error;
};
