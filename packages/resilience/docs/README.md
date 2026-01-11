# @repo/resilience

A resilience and fault-handling library for the monorepo using [cockatiel](https://github.com/connor4312/cockatiel). Provides patterns like Retry (with exponential backoff), Bulkhead, Timeout, and Fallback to make applications robust against transient failures.

## Installation

The package is included in the monorepo. To use it in your app:

```json
{
  "dependencies": {
    "@repo/resilience": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

## Quick Start

```typescript
import { withResilience } from '@repo/resilience'

// Wrap any async function with resilience policies
const resilientFetch = withResilience(fetchUser, {
  name: 'fetchUser',
  retry: { attempts: 3, backoff: 'exponential' },
  timeout: 5000,
})

const user = await resilientFetch('123')
```

## API Reference

### `withResilience(fn, options)`

Wraps an async function with resilience policies. Returns a function with the same signature.

```typescript
function withResilience<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ResilienceOptions<TReturn>
): (...args: TArgs) => Promise<TReturn>
```

## Configuration Options

### Retry Policy

Automatically retry failed operations with configurable strategies.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `attempts` | `number` | `3` | Maximum retry attempts |
| `delay` | `number` | `200` | Base delay in milliseconds |
| `maxDelay` | `number` | `10000` | Maximum delay cap in milliseconds |
| `backoff` | `'exponential' \| 'fixed'` | `'exponential'` | Backoff strategy |
| `jitter` | `boolean` | `true` | Add randomness to delays |
| `shouldRetry` | `(error: Error) => boolean` | See below | Error filter function |

**Default Error Filter:**
- `400`, `401`, `403`, `404`, `422` → NOT retried (client errors)
- `5xx` errors → Retried (server errors)
- Network errors (`ECONNRESET`, `ETIMEDOUT`, etc.) → Retried

```typescript
const resilientFn = withResilience(myFn, {
  retry: {
    attempts: 5,
    delay: 100,
    backoff: 'exponential',
    jitter: true,
  },
})
```

### Bulkhead Policy

Limit concurrent executions to protect rate-limited APIs.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxConcurrent` | `number` | `10` | Maximum concurrent executions |
| `maxQueue` | `number` | `100` | Maximum queued requests |

```typescript
const resilientFn = withResilience(myFn, {
  bulkhead: {
    maxConcurrent: 5,
    maxQueue: 50,
  },
})
```

### Timeout Policy

Cancel operations that take too long.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `30000` | Timeout in milliseconds |

```typescript
const resilientFn = withResilience(myFn, {
  timeout: 5000, // 5 seconds
})
```

### Fallback

Provide a default value or alternative action when all policies fail.

```typescript
// Static fallback value
const resilientFn = withResilience(fetchUserProfile, {
  retry: { attempts: 3 },
  fallback: { name: 'Guest', avatar: '/default-avatar.png' },
})

// Fallback function (can access the error)
const resilientFn = withResilience(fetchUserProfile, {
  retry: { attempts: 3 },
  fallback: async (error) => {
    console.log('Primary failed, trying cache:', error.message)
    return getCachedProfile() ?? { name: 'Guest' }
  },
})
```

### Metrics

Track retry counts, success/failure rates, and latencies via callbacks.

```typescript
const resilientFn = withResilience(myFn, {
  name: 'myOperation',
  retry: { attempts: 3 },
  metrics: {
    onRetry: ({ attempt, maxAttempts, error, delay }) => {
      console.log(`Retry ${attempt}/${maxAttempts} after ${delay}ms`)
    },
    onSuccess: ({ attempts, duration }) => {
      console.log(`Success after ${attempts} attempts in ${duration}ms`)
    },
    onFailure: ({ attempts, error, duration }) => {
      console.error(`Failed after ${attempts} attempts: ${error.message}`)
    },
    onBulkheadRejected: ({ queueSize, maxQueue }) => {
      console.warn(`Queue full: ${queueSize}/${maxQueue}`)
    },
    onTimeout: ({ duration }) => {
      console.warn(`Timed out after ${duration}ms`)
    },
  },
})
```

### Logger Integration

Integrate with `@repo/logger` for automatic logging of retry attempts, successes, and failures.

```typescript
import { createLogger } from '@repo/logger'

const logger = createLogger('API')

const resilientFn = withResilience(fetchData, {
  name: 'fetchData',
  logger,
  retry: { attempts: 3 },
})
```

## Error Handling

The package exports typed error classes for specific failure scenarios:

```typescript
import {
  withResilience,
  RetryExhaustedError,
  TimeoutError,
  BulkheadRejectedError,
} from '@repo/resilience'

try {
  await resilientFn('123')
} catch (error) {
  if (error instanceof RetryExhaustedError) {
    console.error(`All ${error.attempts} retries failed:`, error.lastError)
  } else if (error instanceof TimeoutError) {
    console.error(`Timed out after ${error.duration}ms`)
  } else if (error instanceof BulkheadRejectedError) {
    console.error(`Queue full: ${error.queueSize}/${error.maxQueue}`)
  }
}
```

## Custom Error Filter

Override the default retry behavior with a custom filter:

```typescript
const resilientFn = withResilience(myApiCall, {
  retry: {
    attempts: 5,
    shouldRetry: (error) => {
      // Only retry on rate limit errors
      const status = (error as any).status
      return status === 429
    },
  },
})
```

## Complete Example

```typescript
import { withResilience } from '@repo/resilience'
import { createLogger } from '@repo/logger'

const logger = createLogger('UserAPI')

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) {
    const error = new Error('Failed to fetch')
    ;(error as any).status = res.status
    throw error
  }
  return res.json()
}

// Create a resilient version with all policies
const resilientFetchUser = withResilience(fetchUser, {
  name: 'fetchUser',
  logger,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 200,
    backoff: 'exponential',
    jitter: true,
  },
  
  // Limit concurrent requests
  bulkhead: {
    maxConcurrent: 5,
    maxQueue: 50,
  },
  
  // Cancel after 10 seconds
  timeout: 10000,
  
  // Fallback if all else fails
  fallback: { id: 'guest', name: 'Guest User' },
  
  // Metrics for monitoring
  metrics: {
    onSuccess: ({ duration }) => {
      console.log(`User fetched in ${duration}ms`)
    },
  },
})

// Use it like the original function
const user = await resilientFetchUser('user-123')
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Package Structure

```
packages/resilience/
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
├── docs/
│   ├── README.md          # This file
│   └── RESILIENCE_PACKAGE_PLAN.md  # Design document
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Exports

```typescript
// Main API
export { withResilience } from '@repo/resilience'

// Error Classes
export {
  ResilienceError,
  RetryExhaustedError,
  TimeoutError,
  BulkheadRejectedError,
} from '@repo/resilience'

// Default Error Filter (for customization)
export { isRetryableError } from '@repo/resilience'

// Types
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
} from '@repo/resilience'

// Default Configuration Values
export {
  RETRY_DEFAULTS,
  BULKHEAD_DEFAULTS,
  TIMEOUT_DEFAULT,
} from '@repo/resilience'
```

## License

MIT
