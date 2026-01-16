// ============================================
// Default Error Filter
// ============================================

/** HTTP status codes that should NOT trigger a retry */
const NON_RETRYABLE_STATUS_CODES = new Set([
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  422, // Unprocessable Entity
]);

/** Network error codes that should trigger a retry */
const NETWORK_ERROR_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENETUNREACH'];

/**
 * Check if error is an HTTP error with status code.
 */
const isHttpError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return 'status' in error || 'statusCode' in error || 'response' in error;
  }
  return false;
};

/**
 * Extract status code from various error formats.
 * Supports direct status, statusCode, and nested response.status patterns.
 */
const getStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    // Direct status property
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    // statusCode property
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
    // Nested response.status (fetch-like)
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as Record<string, unknown>;
      if ('status' in response && typeof response.status === 'number') {
        return response.status;
      }
    }
  }
  return undefined;
};

/**
 * Check if error is a network error.
 */
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && NETWORK_ERROR_CODES.includes(code)) {
      return true;
    }
    // Check for fetch network errors
    const message = error.message.toLowerCase();
    if (message.includes('fetch failed') || message.includes('network')) {
      return true;
    }
  }
  return false;
};

/**
 * Determine if an error is retryable.
 * By default, only transient errors are retried:
 * - Server errors (5xx)
 * - Network errors (ECONNRESET, ETIMEDOUT, etc.)
 * 
 * Client errors (4xx) are NOT retried as they indicate bugs in the request.
 */
export const isRetryableError = (error: unknown): boolean => {
  // Check for HTTP response errors
  if (isHttpError(error)) {
    const status = getStatusCode(error);
    if (status !== undefined && NON_RETRYABLE_STATUS_CODES.has(status)) {
      return false; // Don't retry client errors
    }
    // Retry server errors (5xx)
    if (status !== undefined && status >= 500) {
      return true;
    }
  }

  // Retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Don't retry unknown errors by default
  return false;
};

/**
 * Export helper functions for testing purposes.
 */
export const __testing__ = {
  isHttpError,
  getStatusCode,
  isNetworkError,
  NON_RETRYABLE_STATUS_CODES,
  NETWORK_ERROR_CODES,
};
