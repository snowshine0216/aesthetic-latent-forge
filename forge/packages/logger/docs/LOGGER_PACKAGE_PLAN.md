# TDD Implementation Plan: @repo/logger Package

This document outlines the design and implementation plan for a shared logging package that provides monorepo-wide consistent logging across all apps and packages.

## 1. Requirements

### Functional
- `createLogger(name, options?)`: Create a named logger instance.
- `logger.debug(message, meta?)`: Log debug-level messages.
- `logger.info(message, meta?)`: Log info-level messages.
- `logger.warn(message, meta?)`: Log warning-level messages.
- `logger.error(message, meta?)`: Log error-level messages.
- `logger.child(bindings)`: Create a child logger with additional context.
- `setGlobalLogLevel(level)`: Configure minimum log level globally.

### Technical
- **Zero external dependencies** by default (console-based).
- Optional `pino` integration for production structured logging.
- Environment-aware: auto-detect `NODE_ENV` for log level defaults.
- Vercel-compatible: structured JSON output in production.
- Tree-shakeable ESM exports.
- TypeScript-first with full type safety.

## 2. Log Levels

| Level | Value | Use Case |
|-------|-------|----------|
| `debug` | 0 | Detailed debugging info (dev only) |
| `info` | 1 | General operational messages |
| `warn` | 2 | Warning conditions |
| `error` | 3 | Error conditions |
| `silent` | 4 | No logging |

**Default Levels by Environment:**
- `development`: `debug`
- `production`: `info`
- `test`: `silent`

## 3. Test Cases (TDD)

Tests will be located in `packages/logger/src/__tests__/logger.test.ts`.

### Logger Creation
- [x] **Named logger**: `createLogger('MyService')` should create a logger with the given name.
- [x] **Default options**: Logger without options should use environment-based defaults.
- [x] **Custom level**: `createLogger('App', { level: 'warn' })` should only log warn and error.
- [x] **Custom prefix**: Logger name should appear in log output.

### Log Level Filtering
- [x] **Debug level**: When level is `debug`, all messages should be logged.
- [x] **Info level**: When level is `info`, debug messages should be filtered out.
- [x] **Warn level**: When level is `warn`, only warn and error should be logged.
- [x] **Error level**: When level is `error`, only error messages should be logged.
- [x] **Silent level**: When level is `silent`, no messages should be logged.

### Log Output Format
- [x] **Console mode**: In development, output should be human-readable.
- [x] **JSON mode**: In production, output should be structured JSON.
- [x] **Metadata included**: Additional meta object should be included in output.
- [x] **Timestamp included**: Each log entry should include a timestamp.

### Child Loggers
- [x] **Inherit parent level**: Child logger should inherit parent's log level.
- [x] **Merge bindings**: Child logger should include parent's bindings plus its own.
- [x] **Independent**: Changes to child should not affect parent.

### Global Configuration
- [x] **setGlobalLogLevel**: Should update default level for new loggers.
- [x] **Existing loggers unaffected**: Already-created loggers should not change.

### Edge Cases
- [x] **Circular references**: Meta with circular references should not throw.
- [x] **Undefined meta**: Calling `logger.info('msg', undefined)` should work.
- [x] **Empty message**: Empty string message should be logged.
- [x] **Non-string message**: Should stringify non-string first argument.

### Integration
- [x] **Export from package**: `import { createLogger } from '@repo/logger'` should work.
- [x] **Logger interface export**: `import type { Logger } from '@repo/logger'` should work.

## 4. Implementation Details

### File Structure
```
packages/logger/
├── docs/
│   └── LOGGER_PACKAGE_PLAN.md
├── src/
│   ├── index.ts           # Main exports
│   ├── logger.ts          # Logger implementation
│   ├── types.ts           # TypeScript interfaces
│   ├── console-transport.ts   # Console output handler
│   ├── json-transport.ts      # JSON output handler (production)
│   └── __tests__/
│       └── logger.test.ts
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

### Interface Definition

```typescript
// ============================================
// Types
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LogMeta = Record<string, unknown>;

export interface LoggerOptions {
  /** Minimum log level. Default: based on NODE_ENV */
  level?: LogLevel;
  /** Output format: 'console' for human-readable, 'json' for structured */
  format?: 'console' | 'json';
  /** Include timestamp in output. Default: true */
  timestamp?: boolean;
  /** Additional context to include in all log entries */
  bindings?: LogMeta;
}

export interface Logger {
  readonly name: string;
  readonly level: LogLevel;
  
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  
  /** Create a child logger with additional context */
  child(bindings: LogMeta): Logger;
}

// ============================================
// Level Utilities
// ============================================

export const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LOG_LEVEL_VALUES[messageLevel] >= LOG_LEVEL_VALUES[currentLevel];
}

export function getDefaultLevel(): LogLevel {
  const env = process.env.NODE_ENV;
  if (env === 'production') return 'info';
  if (env === 'test') return 'silent';
  return 'debug';
}

export function getDefaultFormat(): 'console' | 'json' {
  return process.env.NODE_ENV === 'production' ? 'json' : 'console';
}
```

### Stub Functions

```typescript
import type { Logger, LoggerOptions, LogMeta, LogLevel } from './types';

let globalDefaultLevel: LogLevel | undefined;

/**
 * Set the default log level for newly created loggers
 */
export function setGlobalLogLevel(level: LogLevel): void {
  globalDefaultLevel = level;
}

/**
 * Get the current global default level
 */
export function getGlobalLogLevel(): LogLevel {
  return globalDefaultLevel ?? getDefaultLevel();
}

/**
 * Create a named logger instance
 */
export function createLogger(name: string, options: LoggerOptions = {}): Logger {
  const level = options.level ?? getGlobalLogLevel();
  const format = options.format ?? getDefaultFormat();
  const bindings = options.bindings ?? {};
  
  // TODO: Create transport based on format
  // TODO: Return Logger implementation
  throw new Error('Not implemented');
}

/**
 * Console transport - human-readable output
 */
function consoleTransport(
  level: LogLevel,
  name: string,
  message: string,
  meta: LogMeta,
  timestamp: boolean
): void {
  // TODO: Format message with colors and readable structure
  // TODO: Output via console[level]
}

/**
 * JSON transport - structured output for production
 */
function jsonTransport(
  level: LogLevel,
  name: string,
  message: string,
  meta: LogMeta,
  timestamp: boolean
): void {
  // TODO: Create JSON object with all fields
  // TODO: Handle circular references safely
  // TODO: Output via console[level]
}

/**
 * Safely stringify objects, handling circular references
 */
function safeStringify(obj: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}
```

## 5. Usage Examples

### Basic Usage

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('PromptEnhancer');

logger.info('Application started');
logger.debug('Processing request', { requestId: 'abc123' });
logger.warn('Rate limit approaching', { current: 95, limit: 100 });
logger.error('Failed to process', { error: new Error('Connection timeout') });
```

### With Options

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('CacheService', {
  level: 'info',
  format: 'json',
  bindings: { service: 'cache', version: '1.0.0' },
});

logger.info('Cache hit', { key: 'user:123', ttl: 3600 });
// Output: {"level":"info","name":"CacheService","service":"cache","version":"1.0.0","message":"Cache hit","key":"user:123","ttl":3600,"timestamp":"2026-01-10T08:53:38.000Z"}
```

### Child Loggers

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('API');
const requestLogger = logger.child({ requestId: 'req-123', userId: 'user-456' });

requestLogger.info('Request received');
// All logs from requestLogger include requestId and userId
```

### Integration with Cache Service

```typescript
import { createLogger } from '@repo/logger';
import { createCacheService } from '@repo/supabase';

const cacheLogger = createLogger('Cache', { level: 'debug' });

const cache = createCacheService({
  logger: cacheLogger,
  enableMetrics: true,
});
```

## 6. Execution Plan

| Phase | Task | Output |
|-------|------|--------|
| 1 | Create package structure with `package.json`, `tsconfig.json` | Package skeleton |
| 2 | Define TypeScript types in `types.ts` | Type definitions |
| 3 | Write test cases in `logger.test.ts` | All tests failing (Red) |
| 4 | Implement `shouldLog` and level utilities | Level tests passing |
| 5 | Implement console transport | Console output tests passing |
| 6 | Implement JSON transport | JSON output tests passing |
| 7 | Implement `createLogger` function | Logger creation tests passing |
| 8 | Implement child logger functionality | Child logger tests passing |
| 9 | Implement global level configuration | Global config tests passing |
| 10 | Export from package | Package exports working |
| 11 | Add `@repo/logger` dependency to `@repo/supabase` | Integration ready |

## 7. Package Configuration

### package.json

```json
{
  "name": "@repo/logger",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
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

## 8. Design Decisions

### Why Console-Based (No Dependencies)?

1. **Zero bundle size impact** — No additional dependencies to install.
2. **Vercel compatibility** — Vercel captures all `console.*` output.
3. **Simplicity** — Easy to understand and debug.
4. **Flexibility** — The interface allows swapping to `pino` later if needed.

### Why Not Use pino Directly?

While `pino` is excellent for production logging, we chose a console-based approach because:
- Avoids adding dependencies to every package in the monorepo
- Works seamlessly in both browser and Node.js contexts
- Vercel's log ingestion works well with structured console output

If you need production-grade features (log aggregation, external transports), you can:
1. Create a `pino` adapter that implements the `Logger` interface
2. Or switch the internal implementation to use `pino` (the interface remains the same)

### Format Auto-Detection

- **Development (`NODE_ENV !== 'production'`)**: Human-readable colored output
- **Production (`NODE_ENV === 'production'`)**: Structured JSON for log aggregation
- **Test (`NODE_ENV === 'test'`)**: Silent by default to avoid test output noise

## 9. Open Questions

- [x] ~~Should we use pino or console-based implementation?~~ **Console-based** for zero dependencies, with interface compatible with pino.
- [ ] Should we add log rotation for file-based logging? (Not applicable for Vercel)
- [ ] Should we add request context tracking (AsyncLocalStorage)?
