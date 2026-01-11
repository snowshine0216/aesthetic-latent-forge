// ============================================
// Main Exports
// ============================================

// Main API
export { withResilience } from './resilience';

// Error Classes
export {
  ResilienceError,
  RetryExhaustedError,
  TimeoutError,
  BulkheadRejectedError,
} from './errors';

// Default Error Filter
export { isRetryableError } from './defaults';

// Type Exports
export type {
  ResilienceOptions,
  ResilienceMetrics,
  RetryOptions,
  BulkheadOptions,
  RetryEvent,
  SuccessEvent,
  FailureEvent,
  BulkheadEvent,
  TimeoutEvent,
} from './types';

// Default Configuration Values
export {
  RETRY_DEFAULTS,
  BULKHEAD_DEFAULTS,
  TIMEOUT_DEFAULT,
} from './types';
