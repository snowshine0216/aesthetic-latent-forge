# TDD Implementation Plan: @repo/resilience Package

This document outlines the design and implementation plan for a shared resilience package using `cockatiel`. It provides patterns like Retry (with exponential backoff) and Bulkhead to make our Next.js applications more robust against transient failures.

## 1. Requirements

### Functional
- **Retry Policy**: Automatically retry failed operations with configurable strategies.
- **Exponential Backoff**: Support increasing wait times between retries.
- **Jitter**: Add randomness to retries to prevent "thundering herd" issues.
- **Error Filtering**: Configure which errors should trigger retries (e.g., skip 400, 401, 403).
- **Bulkhead**: Limit concurrent executions to protect rate-limited APIs.
- **Timeout**: Cancel operations that take too long.
- **Fallback**: Provide a default value or alternative action when all policies fail.
- **Metrics**: Track retry counts, success/failure rates, and latencies.

### Technical
- **Cockatiel Integration**: Use the `cockatiel` library as the underlying engine.
- **Functional API**: Single `withResilience(fn, options)` higher-order function.
- **TypeScript First**: Full type safety for the wrapped function's arguments and return type.
- **Logger Integration**: Optional integration with `@repo/logger` for observability.
- **Custom Errors**: Export typed error classes for specific failure scenarios.
- **Monorepo Ready**: Standardized configuration following the `@repo` pattern.
- **Tree-shakeable**: Only include what is used.

### Out of Scope (Phase 2)
- **Circuit Breaker**: Will be added in a future iteration when needed.
- **Distributed State**: Redis-backed state sharing across lambdas.

## 2. Resilience Policies

### Retry Policy
Used for transient errors (network blips, 503s, 429s).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `attempts` | `number` | `3` | Maximum retry attempts |
| `delay` | `number` | `200` | Base delay in milliseconds |
| `maxDelay` | `number` | `10000` | Maximum delay cap in milliseconds |
| `backoff` | `'exponential' \| 'fixed'` | `'exponential'` | Backoff strategy |
| `jitter` | `boolean` | `true` | Add randomness to delays |
| `shouldRetry` | `(error: Error) => boolean` | See below | Error filter function |

**Default Error Filter:**
By default, the following HTTP status codes will **NOT** trigger a retry:
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `422` Unprocessable Entity

Only transient errors (5xx, network errors, timeouts) are retried by default.

### Bulkhead Policy
Used to limit concurrent executions and protect rate-limited APIs.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxConcurrent` | `number` | `10` | Maximum concurrent executions |
| `maxQueue` | `number` | `100` | Maximum queued requests |

### Timeout Policy
Used to cancel operations that take too long.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `30000` | Timeout in milliseconds |

## 3. Custom Error Types

```typescript
/**
 * Base error for all resilience-related errors
 */
export class ResilienceError extends Error {
  readonly cause?: Error;
}

/**
 * Thrown when max retry attempts are exhausted
 */
export class RetryExhaustedError extends ResilienceError {
  readonly attempts: number;
  readonly lastError: Error;
}

/**
 * Thrown when an operation times out
 */
export class TimeoutError extends ResilienceError {
  readonly duration: number;
}

/**
 * Thrown when bulkhead queue is full
 */
export class BulkheadRejectedError extends ResilienceError {
  readonly queueSize: number;
  readonly maxQueue: number;
}
```

## 4. Metrics

The package provides optional metrics collection via a callback interface.

```typescript
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

export interface RetryEvent {
  attempt: number;
  maxAttempts: number;
  error: Error;
  delay: number;
  name?: string;
}

export interface SuccessEvent {
  attempts: number;
  duration: number;
  name?: string;
}

export interface FailureEvent {
  attempts: number;
  duration: number;
  error: Error;
  name?: string;
}

export interface BulkheadEvent {
  queueSize: number;
  maxQueue: number;
  name?: string;
}

export interface TimeoutEvent {
  duration: number;
  name?: string;
}
```

## 5. Test Cases (TDD)

Tests will be located in `packages/resilience/src/__tests__/resilience.test.ts`.

### Retry Policy
- [ ] **Basic Retry**: Should retry a failing function up to the specified limit.
- [ ] **Success after Retry**: Should return the result if a subsequent retry succeeds.
- [ ] **Exponential Backoff**: Should wait increasingly longer between attempts.
- [ ] **Fixed Backoff**: Should wait the same duration between attempts when using fixed strategy.
- [ ] **Max Attempts**: Should throw `RetryExhaustedError` after reaching max attempts.
- [ ] **Jitter**: Delays should have randomness when jitter is enabled.
- [ ] **No Jitter**: Delays should be consistent when jitter is disabled.

### Error Filtering
- [ ] **Skip 400 errors**: Should not retry when response status is 400.
- [ ] **Skip 401 errors**: Should not retry when response status is 401.
- [ ] **Skip 403 errors**: Should not retry when response status is 403.
- [ ] **Skip 404 errors**: Should not retry when response status is 404.
- [ ] **Retry 500 errors**: Should retry when response status is 500.
- [ ] **Retry 503 errors**: Should retry when response status is 503.
- [ ] **Retry network errors**: Should retry on `ECONNRESET`, `ETIMEDOUT`.
- [ ] **Custom filter**: Should respect custom `shouldRetry` function.

### Bulkhead Policy
- [ ] **Limit concurrent**: Should limit concurrent executions to `maxConcurrent`.
- [ ] **Queue overflow**: Should throw `BulkheadRejectedError` when queue is full.
- [ ] **Process queue**: Should process queued requests when slots become available.

### Timeout Policy
- [ ] **Timeout exceeded**: Should throw `TimeoutError` when operation exceeds timeout.
- [ ] **Complete before timeout**: Should return result if operation completes in time.

### Fallback
- [ ] **Return fallback value**: Should return fallback value when all retries fail.
- [ ] **Fallback function**: Should call fallback function with the error.
- [ ] **No fallback**: Should throw error when no fallback is provided.

### Metrics
- [ ] **onRetry callback**: Should call onRetry with correct event data on each retry.
- [ ] **onSuccess callback**: Should call onSuccess with duration and attempt count.
- [ ] **onFailure callback**: Should call onFailure with error and attempt count.
- [ ] **onBulkheadRejected callback**: Should call when request is rejected.
- [ ] **onTimeout callback**: Should call when operation times out.

### Logger Integration
- [ ] **Log retries**: Should log retry attempts when logger is provided.
- [ ] **Log success**: Should log successful completion when logger is provided.
- [ ] **Log failure**: Should log final failure when logger is provided.
- [ ] **No logger**: Should not throw when logger is not provided.

### Type Safety
- [ ] **Preserve signature**: Wrapped function should have same type signature.
- [ ] **Generic types**: Should work with various return types.
- [ ] **Async only**: Should only accept async functions.

## 6. Implementation Details

### File Structure
```
packages/resilience/
├── docs/
│   └── RESILIENCE_PACKAGE_PLAN.md
├── src/
│   ├── index.ts           # Main exports
│   ├── resilience.ts      # withResilience implementation
│   ├── policies.ts        # Policy factory functions
│   ├── errors.ts          # Custom error classes
│   ├── types.ts           # TypeScript interfaces
│   ├── defaults.ts        # Default values and error filters
│   └── __tests__/
│       ├── resilience.test.ts
│       ├── retry.test.ts
│       ├── bulkhead.test.ts
│       └── timeout.test.ts
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

### Interface Definition

```typescript
import type { Logger } from '@repo/logger';

// ============================================
// Main Options Interface
// ============================================

export interface ResilienceOptions<TReturn> {
  /** Optional name for logging and metrics */
  name?: string;
  
  /** Retry configuration */
  retry?: {
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
  };
  
  /** Bulkhead configuration */
  bulkhead?: {
    /** Maximum concurrent executions. Default: 10 */
    maxConcurrent?: number;
    /** Maximum queued requests. Default: 100 */
    maxQueue?: number;
  };
  
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
export function withResilience<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ResilienceOptions<TReturn>
): (...args: TArgs) => Promise<TReturn>;
```

### Default Error Filter

```typescript
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

/**
 * Determine if an error is retryable.
 * By default, only transient errors are retried.
 */
export function isRetryableError(error: unknown): boolean {
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
}

/**
 * Check if error is an HTTP error with status code
 */
function isHttpError(error: unknown): boolean {
  if (error instanceof Error) {
    return 'status' in error || 'statusCode' in error || 'response' in error;
  }
  return false;
}

/**
 * Extract status code from various error formats
 */
function getStatusCode(error: unknown): number | undefined {
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
}

/**
 * Check if error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const networkErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENETUNREACH'];
    const code = (error as NodeJS.ErrnoException).code;
    if (code && networkErrorCodes.includes(code)) {
      return true;
    }
    // Check for fetch network errors
    if (error.message.includes('fetch failed') || error.message.includes('network')) {
      return true;
    }
  }
  return false;
}
```

### Stub Functions

```typescript
import type { Logger } from '@repo/logger';
import type { ResilienceOptions, ResilienceMetrics } from './types';
import { RetryExhaustedError, TimeoutError, BulkheadRejectedError } from './errors';
import { isRetryableError } from './defaults';

/**
 * Wrap an async function with resilience policies.
 */
export function withResilience<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ResilienceOptions<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  // TODO: Create policies from options
  // TODO: Compose policies (timeout -> bulkhead -> retry)
  // TODO: Return wrapped function
  throw new Error('Not implemented');
}

/**
 * Create a retry policy with the given configuration.
 */
function createRetryPolicy(options: {
  attempts: number;
  delay: number;
  maxDelay: number;
  backoff: 'exponential' | 'fixed';
  jitter: boolean;
  shouldRetry: (error: Error) => boolean;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}): unknown {
  // TODO: Use cockatiel's retry policy
  // TODO: Configure backoff generator
  // TODO: Wire up onRetry callback
  throw new Error('Not implemented');
}

/**
 * Create a bulkhead policy with the given configuration.
 */
function createBulkheadPolicy(options: {
  maxConcurrent: number;
  maxQueue: number;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}): unknown {
  // TODO: Use cockatiel's bulkhead policy
  // TODO: Wire up onReject callback
  throw new Error('Not implemented');
}

/**
 * Create a timeout policy with the given configuration.
 */
function createTimeoutPolicy(options: {
  timeout: number;
  logger?: Logger;
  metrics?: ResilienceMetrics;
  name?: string;
}): unknown {
  // TODO: Use cockatiel's timeout policy
  // TODO: Wire up onTimeout callback
  throw new Error('Not implemented');
}

/**
 * Apply fallback to a function execution.
 */
async function executeWithFallback<TReturn>(
  execute: () => Promise<TReturn>,
  fallback: TReturn | ((error: Error) => TReturn | Promise<TReturn>) | undefined,
  logger?: Logger,
  name?: string
): Promise<TReturn> {
  // TODO: Execute function
  // TODO: On error, apply fallback if provided
  // TODO: Log fallback usage
  throw new Error('Not implemented');
}
```

## 7. Usage Examples

### Basic Retry with Error Filtering

```typescript
import { withResilience } from '@repo/resilience';

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

// Uses default error filter: won't retry 400, 401, 403, 404
const resilientFetchUser = withResilience(fetchUser, {
  name: 'fetchUser',
  retry: { attempts: 3, backoff: 'exponential' },
});

const user = await resilientFetchUser('123');
```

### Custom Error Filter

```typescript
import { withResilience } from '@repo/resilience';

const resilientCall = withResilience(myApiCall, {
  retry: {
    attempts: 5,
    shouldRetry: (error) => {
      // Only retry on rate limit errors
      const status = (error as any).status;
      return status === 429;
    },
  },
});
```

### With Bulkhead Protection

```typescript
import { withResilience } from '@repo/resilience';

// Protect a rate-limited API
const resilientApi = withResilience(callExternalApi, {
  name: 'externalApi',
  bulkhead: {
    maxConcurrent: 5,  // Only 5 concurrent requests
    maxQueue: 50,      // Queue up to 50 more
  },
  retry: { attempts: 3 },
  timeout: 10000,
});
```

### With Fallback

```typescript
import { withResilience } from '@repo/resilience';

const resilientFetch = withResilience(fetchUserProfile, {
  retry: { attempts: 3 },
  fallback: { name: 'Guest', avatar: '/default-avatar.png' },
});

// Or with a function
const resilientFetchWithFn = withResilience(fetchUserProfile, {
  retry: { attempts: 3 },
  fallback: async (error) => {
    // Try cache as fallback
    return getCachedProfile() ?? { name: 'Guest' };
  },
});
```

### With Logger and Metrics

```typescript
import { withResilience } from '@repo/resilience';
import { createLogger } from '@repo/logger';

const logger = createLogger('API');

const resilientFetch = withResilience(fetchData, {
  name: 'fetchData',
  logger,
  retry: { attempts: 3 },
  metrics: {
    onRetry: ({ attempt, maxAttempts, error, delay }) => {
      console.log(`Retry ${attempt}/${maxAttempts} after ${delay}ms: ${error.message}`);
    },
    onSuccess: ({ attempts, duration }) => {
      console.log(`Success after ${attempts} attempts in ${duration}ms`);
    },
    onFailure: ({ attempts, error }) => {
      console.error(`Failed after ${attempts} attempts: ${error.message}`);
    },
  },
});
```

### Error Handling

```typescript
import { 
  withResilience, 
  RetryExhaustedError, 
  TimeoutError, 
  BulkheadRejectedError 
} from '@repo/resilience';

try {
  await resilientFetch('123');
} catch (error) {
  if (error instanceof RetryExhaustedError) {
    console.error(`All ${error.attempts} retries failed:`, error.lastError);
  } else if (error instanceof TimeoutError) {
    console.error(`Operation timed out after ${error.duration}ms`);
  } else if (error instanceof BulkheadRejectedError) {
    console.error(`Queue full (${error.queueSize}/${error.maxQueue})`);
  }
}
```

## 8. Execution Plan

| Phase | Task | Output |
|-------|------|--------|
| 1 | Create package structure and `package.json` | Package skeleton |
| 2 | Install dependencies (`cockatiel`) | Working environment |
| 3 | Define TypeScript interfaces in `types.ts` | Type definitions |
| 4 | Implement custom errors in `errors.ts` | Error classes |
| 5 | Implement default error filter in `defaults.ts` | Error filtering logic |
| 6 | Write retry test cases | Failing tests (Red) |
| 7 | Implement retry policy | Retry tests passing (Green) |
| 8 | Write error filter test cases | Failing tests (Red) |
| 9 | Implement error filtering integration | Filter tests passing (Green) |
| 10 | Write bulkhead test cases | Failing tests (Red) |
| 11 | Implement bulkhead policy | Bulkhead tests passing (Green) |
| 12 | Write timeout test cases | Failing tests (Red) |
| 13 | Implement timeout policy | Timeout tests passing (Green) |
| 14 | Write fallback test cases | Failing tests (Red) |
| 15 | Implement fallback mechanism | Fallback tests passing (Green) |
| 16 | Write metrics test cases | Failing tests (Red) |
| 17 | Implement metrics callbacks | Metrics tests passing (Green) |
| 18 | Integrate `@repo/logger` | Logger integration working |
| 19 | Add documentation and examples | Documentation complete |

## 9. Package Configuration

### package.json

```json
{
  "name": "@repo/resilience",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "cockatiel": "^3.2.1"
  },
  "peerDependencies": {
    "@repo/logger": "workspace:*"
  },
  "peerDependenciesMeta": {
    "@repo/logger": {
      "optional": true
    }
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@repo/logger": "workspace:*",
    "eslint": "^9.17.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

### tsconfig.json

```json
{
  "extends": "@repo/config/tsconfig/base",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 10. Design Decisions

### Why `withResilience` over `createPolicy`?

We chose a single `withResilience(fn, options)` API because:
1. **Functional style** — Aligns with the project's preference for functional programming.
2. **Simpler API** — One function to learn, less cognitive overhead.
3. **Type-safe** — Automatically preserves the wrapped function's type signature.
4. **Composable** — Easy to wrap multiple functions with different configurations.

### Why Cockatiel?

- **Lightweight**: Small bundle size (~5KB), perfect for Next.js/Vercel.
- **Type-safe**: Excellent TypeScript support out of the box.
- **Composable**: Easy to mix and match policies internally.
- **Maintained**: Active development and good documentation.

### Serverless Compatibility

- In Next.js (Vercel/Lambda), global memory is shared only within a single warm instance.
- **Bulkhead state** is per-instance, which is still useful for protecting against concurrent bursts.
- Phase 2 may add distributed state via Redis if needed.

### Error Filtering Philosophy

By default, we follow the principle that **client errors (4xx) indicate bugs in the request**, not transient failures. Retrying a `400 Bad Request` will always fail. Only **server errors (5xx) and network errors** are retried by default.

### Logger as Peer Dependency

The `@repo/logger` integration is optional to avoid forcing the dependency on consumers who don't need logging. It's a peer dependency that will use the existing logger if available.

## 11. Future Enhancements (Phase 2)

- [ ] **Circuit Breaker**: Add circuit breaker pattern for persistent failures.
- [ ] **Distributed State**: Redis-backed state sharing for circuit breakers.
- [ ] **Rate Limiting**: Built-in rate limiter integration.
- [ ] **OpenTelemetry**: Tracing integration for observability.
- [ ] **Retry Strategies**: More backoff strategies (linear, fibonacci).
