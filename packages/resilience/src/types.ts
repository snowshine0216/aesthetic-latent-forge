// ============================================
// Types
// ============================================

import type { Logger } from '@repo/logger';

// ============================================
// Metric Event Types
// ============================================

export interface RetryEvent {
  /** Current attempt number (1-indexed) */
  attempt: number;
  /** Maximum attempts configured */
  maxAttempts: number;
  /** The error that triggered the retry */
  error: Error;
  /** Delay before next retry in ms */
  delay: number;
  /** Optional operation name */
  name?: string;
}

export interface SuccessEvent {
  /** Total attempts made (including the successful one) */
  attempts: number;
  /** Total duration in ms */
  duration: number;
  /** Optional operation name */
  name?: string;
}

export interface FailureEvent {
  /** Total attempts made */
  attempts: number;
  /** Total duration in ms */
  duration: number;
  /** The final error */
  error: Error;
  /** Optional operation name */
  name?: string;
}

export interface BulkheadEvent {
  /** Current queue size when rejected */
  queueSize: number;
  /** Maximum queue size configured */
  maxQueue: number;
  /** Optional operation name */
  name?: string;
}

export interface TimeoutEvent {
  /** Configured timeout duration in ms */
  duration: number;
  /** Optional operation name */
  name?: string;
}

// ============================================
// Metrics Interface
// ============================================

export interface ResilienceMetrics {
  /** Called on each retry attempt */
  onRetry?: (event: RetryEvent) => void;
  /** Called when operation succeeds */
  onSuccess?: (event: SuccessEvent) => void;
  /** Called when operation fails after all retries */
  onFailure?: (event: FailureEvent) => void;
  /** Called when bulkhead rejects a request */
  onBulkheadRejected?: (event: BulkheadEvent) => void;
  /** Called when operation times out */
  onTimeout?: (event: TimeoutEvent) => void;
}

// ============================================
// Configuration Types
// ============================================

export interface RetryOptions {
  /** Maximum retry attempts. Default: 3 */
  attempts?: number;
  /** Base delay in ms. Default: 200 */
  delay?: number;
  /** Maximum delay cap in ms. Default: 10000 */
  maxDelay?: number;
  /** Backoff strategy. Default: 'exponential' */
  backoff?: 'exponential' | 'fixed';
  /** Add randomness to delays. Default: true */
  jitter?: boolean;
  /** Custom error filter. Return true to retry. */
  shouldRetry?: (error: Error) => boolean;
}

export interface BulkheadOptions {
  /** Maximum concurrent executions. Default: 10 */
  maxConcurrent?: number;
  /** Maximum queued requests. Default: 100 */
  maxQueue?: number;
}

// ============================================
// Main Options Interface
// ============================================

export interface ResilienceOptions<TReturn> {
  /** Optional name for logging and metrics */
  name?: string;

  /** Retry configuration */
  retry?: RetryOptions;

  /** Bulkhead configuration */
  bulkhead?: BulkheadOptions;

  /** Timeout in milliseconds. Default: 30000 */
  timeout?: number;

  /** Fallback value or function when all retries fail */
  fallback?: TReturn | ((error: Error) => TReturn | Promise<TReturn>);

  /** Logger instance for observability */
  logger?: Logger;

  /** Metrics callbacks */
  metrics?: ResilienceMetrics;
}

// ============================================
// Default Configuration Values
// ============================================

export const RETRY_DEFAULTS = {
  attempts: 3,
  delay: 200,
  maxDelay: 10000,
  backoff: 'exponential' as const,
  jitter: true,
};

export const BULKHEAD_DEFAULTS = {
  maxConcurrent: 10,
  maxQueue: 100,
};

export const TIMEOUT_DEFAULT = 30000;
