// ============================================
// Custom Error Classes
// ============================================

/**
 * Base error for all resilience-related errors.
 * Provides a common ancestor for catching resilience failures.
 */
export class ResilienceError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ResilienceError';
    this.cause = cause;
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when max retry attempts are exhausted.
 * Contains information about the number of attempts and the last error.
 */
export class RetryExhaustedError extends ResilienceError {
  /** Total attempts made before giving up */
  readonly attempts: number;
  /** The last error that occurred */
  readonly lastError: Error;

  constructor(attempts: number, lastError: Error) {
    super(`Retry exhausted after ${attempts} attempts: ${lastError.message}`, lastError);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when an operation times out.
 * Contains the configured timeout duration.
 */
export class TimeoutError extends ResilienceError {
  /** Configured timeout duration in milliseconds */
  readonly duration: number;

  constructor(duration: number) {
    super(`Operation timed out after ${duration}ms`);
    this.name = 'TimeoutError';
    this.duration = duration;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when bulkhead queue is full.
 * Contains information about the queue state when rejection occurred.
 */
export class BulkheadRejectedError extends ResilienceError {
  /** Current queue size when rejection occurred */
  readonly queueSize: number;
  /** Maximum queue size configured */
  readonly maxQueue: number;

  constructor(queueSize: number, maxQueue: number) {
    super(`Bulkhead queue full: ${queueSize}/${maxQueue} requests queued`);
    this.name = 'BulkheadRejectedError';
    this.queueSize = queueSize;
    this.maxQueue = maxQueue;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
