# @repo/logger

A zero-dependency, environment-aware logging package for the monorepo. Provides structured, consistent logging across all apps and packages with TypeScript-first design.

## Features

- **Zero Dependencies** — Console-based implementation with no external packages
- **Environment-Aware** — Automatic log level and format detection based on `NODE_ENV`
- **Structured Logging** — JSON output in production for log aggregation (Vercel-compatible)
- **Human-Readable** — Colored console output in development
- **Child Loggers** — Create context-aware loggers with inherited configuration
- **TypeScript-First** — Full type safety with exported types
- **Tree-Shakeable** — ESM exports for optimal bundle size

## Installation

The package is already part of the monorepo. Add it as a dependency to your app or package:

```json
{
  "dependencies": {
    "@repo/logger": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

## Quick Start

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('MyService');

logger.info('Application started');
logger.debug('Processing request', { requestId: 'abc123' });
logger.warn('Rate limit approaching', { current: 95, limit: 100 });
logger.error('Failed to process', { error: 'Connection timeout' });
```

## API Reference

### `createLogger(name, options?)`

Creates a named logger instance.

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('ServiceName', {
  level: 'info',        // Minimum log level (default: based on NODE_ENV)
  format: 'json',       // Output format: 'console' | 'json' (default: based on NODE_ENV)
  timestamp: true,      // Include timestamp (default: true)
  bindings: {           // Additional context for all log entries
    service: 'api',
    version: '1.0.0'
  }
});
```

### Log Levels

| Level | Value | Description |
|-------|-------|-------------|
| `debug` | 0 | Detailed debugging info (dev only) |
| `info` | 1 | General operational messages |
| `warn` | 2 | Warning conditions |
| `error` | 3 | Error conditions |
| `silent` | 4 | No logging |

**Default Levels by Environment:**
- `development` → `debug`
- `production` → `info`
- `test` → `silent`

### `logger.child(bindings)`

Creates a child logger with additional context. Child loggers inherit the parent's level and format.

```typescript
const logger = createLogger('API');
const requestLogger = logger.child({ 
  requestId: 'req-123', 
  userId: 'user-456' 
});

requestLogger.info('Request received');
// All logs include requestId and userId

const handlerLogger = requestLogger.child({ handler: 'createUser' });
handlerLogger.info('Handler executed');
// Includes requestId, userId, and handler
```

### `setGlobalLogLevel(level)`

Sets the default log level for newly created loggers.

```typescript
import { setGlobalLogLevel, createLogger } from '@repo/logger';

setGlobalLogLevel('error');

// New loggers will use 'error' level by default
const logger = createLogger('App');
console.log(logger.level); // 'error'
```

> **Note:** This does not affect already-created loggers.

### `getGlobalLogLevel()`

Returns the current global default log level.

```typescript
import { getGlobalLogLevel } from '@repo/logger';

console.log(getGlobalLogLevel()); // 'debug' (in development)
```

## Output Formats

### Console Format (Development)

Human-readable colored output:

```
2026-01-10T09:05:28.000Z [INFO] (MyService) Application started requestId=abc123
```

### JSON Format (Production)

Structured JSON for log aggregation:

```json
{"level":"info","name":"MyService","message":"Application started","requestId":"abc123","timestamp":"2026-01-10T09:05:28.000Z"}
```

## Usage Examples

### Basic Logging

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('UserService');

// Simple message
logger.info('User created');

// With metadata
logger.info('User created', { userId: '123', email: 'user@example.com' });

// Warning
logger.warn('Password strength weak', { userId: '123', score: 2 });

// Error
logger.error('Failed to create user', { error: 'Email already exists' });
```

### Service Integration

```typescript
import { createLogger } from '@repo/logger';

// Create a service-specific logger
const cacheLogger = createLogger('CacheService', {
  level: 'debug',
  bindings: { service: 'cache', version: '1.0.0' }
});

// Use in service functions
export const cacheGet = (key: string) => {
  cacheLogger.debug('Cache lookup', { key });
  // ... cache logic
  cacheLogger.info('Cache hit', { key, ttl: 3600 });
};
```

### Request Context Tracking

```typescript
import { createLogger } from '@repo/logger';

const apiLogger = createLogger('API');

export const handleRequest = (req: Request) => {
  // Create request-scoped logger
  const reqLogger = apiLogger.child({
    requestId: req.headers.get('x-request-id'),
    method: req.method,
    path: new URL(req.url).pathname
  });

  reqLogger.info('Request received');
  
  try {
    // ... handle request
    reqLogger.info('Request completed', { status: 200 });
  } catch (error) {
    reqLogger.error('Request failed', { error: String(error) });
  }
};
```

## Testing

### Run Tests

```bash
# Run all logger tests
pnpm test --filter @repo/logger

# Watch mode
pnpm test:watch --filter @repo/logger
```

### Type Check

```bash
pnpm type-check --filter @repo/logger
```

### Lint

```bash
pnpm lint --filter @repo/logger
```

## Testing in Your Code

When testing code that uses the logger, the default level in `test` environment is `silent`, so logs won't pollute test output.

To test logging behavior explicitly:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { createLogger } from '@repo/logger';

describe('MyService', () => {
  it('should log on error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('Test', { level: 'error' });

    logger.error('Something went wrong');

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
```

## Type Exports

```typescript
import type { Logger, LoggerOptions, LogLevel, LogMeta } from '@repo/logger';

// Use types for function parameters
const processWithLogger = (logger: Logger) => {
  logger.info('Processing...');
};

// Define log level options
const config: { level: LogLevel } = { level: 'warn' };
```

## Design Decisions

### Why Console-Based (No Dependencies)?

1. **Zero bundle size impact** — No additional dependencies to install
2. **Vercel compatibility** — Vercel captures all `console.*` output
3. **Simplicity** — Easy to understand and debug
4. **Flexibility** — Interface allows swapping to `pino` later if needed

### Format Auto-Detection

The logger automatically selects the appropriate format:
- **Development** (`NODE_ENV !== 'production'`): Colored console output
- **Production** (`NODE_ENV === 'production'`): Structured JSON for log aggregation
- **Test** (`NODE_ENV === 'test'`): Silent by default

## Advanced Usage

### Custom Transport (Future)

The logger is designed with a transport interface that allows future extension:

```typescript
import type { TransportFn } from '@repo/logger';

// You can create custom transports that implement TransportFn
```

### Safe JSON Stringify

The package exports a utility for safely stringifying objects with circular references:

```typescript
import { safeStringify } from '@repo/logger';

const circular: Record<string, unknown> = { name: 'test' };
circular.self = circular;

console.log(safeStringify(circular));
// {"name":"test","self":"[Circular]"}
```

## Related Packages

- **@repo/supabase** — Use with cache service for debugging
- **@repo/resilience** — Use with retry/circuit breaker for error logging
