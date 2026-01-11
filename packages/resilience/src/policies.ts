// ============================================
// Policy Factory Functions
// ============================================

import {
  ExponentialBackoff,
  ConstantBackoff,
  BulkheadPolicy,
  TimeoutPolicy,
  handleWhen,
  bulkhead,
  timeout,
  retry,
  IPolicy,
  BulkheadRejectedError as CockatielBulkheadRejectedError,
  TaskCancelledError as CockatielTimeoutError,
  RetryPolicy,
  wrap,
  TimeoutStrategy,
  noJitterGenerator,
} from 'cockatiel';
import type { Logger } from '@repo/logger';
import type { ResilienceMetrics } from './types';
import { BulkheadRejectedError, TimeoutError } from './errors';

// ============================================
// Retry Policy Configuration
// ============================================

export interface RetryPolicyConfig {
  attempts: number;
  delay: number;
  maxDelay: number;
  backoff: 'exponential' | 'fixed';
  jitter: boolean;
  shouldRetry: (error: Error) => boolean;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}

/**
 * Create a retry policy with the given configuration.
 * Uses cockatiel's retry policy with configurable backoff.
 * Uses handleWhen to properly filter which errors should trigger retries.
 */
export const createRetryPolicy = (config: RetryPolicyConfig): RetryPolicy => {
  const {
    attempts,
    delay,
    maxDelay,
    backoff,
    jitter,
    shouldRetry,
    logger,
    metrics,
    name,
  } = config;

  // Create backoff generator
  const backoffGenerator =
    backoff === 'exponential'
      ? new ExponentialBackoff({
          initialDelay: delay,
          maxDelay,
          // Use decorrelated jitter by default, or no jitter if disabled
          generator: jitter ? undefined : noJitterGenerator,
        })
      : new ConstantBackoff(delay);

  // Create error handler that respects shouldRetry filter
  // handleWhen only retries errors that pass the filter
  const errorHandler = handleWhen((error) => shouldRetry(error as Error));

  // Create the retry policy with proper error filtering
  const retryPolicy = retry(errorHandler, {
    maxAttempts: attempts,
    backoff: backoffGenerator,
  });

  // Wire up callbacks
  retryPolicy.onRetry((data) => {
    // Data has structure { error?: Error, value?: T, delay: number, attempt: number }
    const error = 'error' in data ? (data.error as Error) : new Error('Unknown retry reason');
    const event = {
      attempt: data.attempt,
      maxAttempts: attempts,
      error,
      delay: data.delay,
      name,
    };

    // Log retry attempt
    logger?.warn(`Retry attempt ${data.attempt}/${attempts}`, {
      error: error?.message,
      delay: data.delay,
      operation: name,
    });

    // Call metrics callback
    metrics?.onRetry?.(event);
  });

  retryPolicy.onFailure((data) => {
    // This is called when the operation fails (before retries or after exhaustion)
    const error = 'error' in data.reason ? (data.reason.error as Error) : undefined;
    logger?.debug(`Operation failed`, {
      error: error?.message,
      operation: name,
    });
  });

  retryPolicy.onSuccess(() => {
    logger?.debug(`Operation succeeded`, {
      operation: name,
    });
  });

  return retryPolicy;
};

// ============================================
// Bulkhead Policy Configuration
// ============================================

export interface BulkheadPolicyConfig {
  maxConcurrent: number;
  maxQueue: number;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}

/**
 * Create a bulkhead policy with the given configuration.
 * Limits concurrent executions to protect rate-limited APIs.
 */
export const createBulkheadPolicy = (
  config: BulkheadPolicyConfig
): BulkheadPolicy => {
  const { maxConcurrent, maxQueue, logger, metrics, name } = config;

  const bulkheadPolicy = bulkhead(maxConcurrent, maxQueue);

  // Wire up rejection callback
  bulkheadPolicy.onReject(() => {
    const event = {
      queueSize: maxQueue,
      maxQueue,
      name,
    };

    logger?.warn(`Bulkhead rejected request - queue full`, {
      queueSize: maxQueue,
      maxQueue,
      operation: name,
    });

    metrics?.onBulkheadRejected?.(event);
  });

  return bulkheadPolicy;
};

// ============================================
// Timeout Policy Configuration
// ============================================

export interface TimeoutPolicyConfig {
  timeout: number;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}

/**
 * Create a timeout policy with the given configuration.
 * Cancels operations that take too long.
 */
export const createTimeoutPolicy = (
  config: TimeoutPolicyConfig
): TimeoutPolicy => {
  const { timeout: timeoutMs, logger, metrics, name } = config;

  // Use aggressive timeout strategy to cancel immediately
  const timeoutPolicy = timeout(timeoutMs, TimeoutStrategy.Aggressive);

  // Wire up timeout callback
  timeoutPolicy.onTimeout(() => {
    const event = {
      duration: timeoutMs,
      name,
    };

    logger?.warn(`Operation timed out`, {
      timeout: timeoutMs,
      operation: name,
    });

    metrics?.onTimeout?.(event);
  });

  return timeoutPolicy;
};

// ============================================
// Error Transformation
// ============================================

/**
 * Transform cockatiel errors to our custom error types.
 */
export const transformError = (
  error: unknown,
  config: { timeout?: number; maxQueue?: number }
): Error => {
  if (error instanceof CockatielBulkheadRejectedError) {
    return new BulkheadRejectedError(config.maxQueue ?? 0, config.maxQueue ?? 0);
  }
  if (error instanceof CockatielTimeoutError) {
    return new TimeoutError(config.timeout ?? 0);
  }
  return error as Error;
};

// ============================================
// Policy Composition
// ============================================

/**
 * Compose multiple policies into a single execution pipeline.
 * Order: timeout -> bulkhead -> retry
 */
export const composePolicies = (policies: IPolicy[]): IPolicy => {
  if (policies.length === 0) {
    // No policies, just execute directly
    return {
      execute: async <T>(fn: () => Promise<T>): Promise<T> => fn(),
    } as IPolicy;
  }

  if (policies.length === 1) {
    return policies[0];
  }

  return wrap(...(policies as [IPolicy, IPolicy, ...IPolicy[]]));
};

// Re-export cockatiel types we use
export { CockatielBulkheadRejectedError, CockatielTimeoutError };
