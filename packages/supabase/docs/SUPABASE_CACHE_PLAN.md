# TDD Implementation Plan: Supabase DB Cache

This document outlines the design and implementation plan for a shared caching solution using Supabase PostgreSQL as the storage backend. This avoids the need for a separate Redis server while providing cross-app cache consistency in our monorepo.

## 1. Requirements

### Functional
- `set(key, value, ttlSeconds)`: Store a JSON-serializable value with an expiration.
- `get(key)`: Retrieve a value if it hasn't expired.
- `getOrSet(key, factory, ttlSeconds)`: Cache-aside pattern — return cached value or compute and store if missing.
- `delete(key)`: Manually remove a cache entry.
- `clearExpired()`: Utility function to purge stale data.
- `getStats()`: Retrieve cache metrics (hit/miss counts, hit ratio, entry count).

### Technical
- Use the existing `@repo/supabase` client utilities.
- Table-based storage in the `public` schema.
- Support for complex types via PostgreSQL `jsonb`.
- Thread-safe and serverless-friendly.
- Key namespacing for multi-app support.
- **Configurable cache size limits** (max entry count per namespace or global).
- **Metrics tracking** for cache hit/miss ratios with optional logging.

## 2. Database Schema

The cache will be stored in a dedicated table.

**Migration File**: `packages/supabase/migrations/001_create_cache_table.sql`

```sql
-- Create cache table
CREATE TABLE IF NOT EXISTS public.cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for expiration cleanup
CREATE INDEX idx_cache_expires_at ON public.cache (expires_at);

-- Enable Row Level Security
ALTER TABLE public.cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow full access for service_role (server-side operations)
-- This ensures the cache is only accessible via service_role key, not anon key
CREATE POLICY "Service role full access" ON public.cache
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Optional: Add a comment for documentation
COMMENT ON TABLE public.cache IS 'Application cache table for cross-app cache consistency';
```

## 3. Key Namespacing Strategy

To avoid key collisions in a multi-app monorepo, all cache keys should follow a namespacing convention:

```
{app}:{namespace}:{identifier}
```

**Examples**:
- `prompt-enhancer:model:gpt-4-turbo` — Cache for model metadata
- `prompt-enhancer:enhancement:abc123` — Cache for a specific enhancement result
- `llm-service:config:defaults` — Cache for LLM service configuration

**Recommendation**: Create a key builder utility:

```typescript
export function buildCacheKey(app: string, namespace: string, identifier: string): string {
  return `${app}:${namespace}:${identifier}`;
}
```

## 4. Test Cases (TDD)

Tests will be located in `packages/supabase/src/__tests__/cache.test.ts`.

### Happy Path
- [ ] **Success Store**: Calling `set` should insert a record into the `cache` table.
- [ ] **Success Retrieve**: Calling `get` for a non-expired key should return the original JSON value.
- [ ] **Expiration**: Calling `get` for a key where `now() > expires_at` should return `null`.
- [ ] **Overwrite**: Calling `set` for an existing key should update the value and reset the `expires_at`.
- [ ] **Delete**: Calling `delete` should remove the key from the cache table.
- [ ] **Clear Expired**: Calling `clearExpired` should remove all rows where `expires_at < now()`.

### Negative/Edge Path
- [ ] **Non-existent key**: `get` should return `null` for keys not in the DB.
- [ ] **Delete non-existent key**: `delete` should not throw for keys not in the DB.
- [ ] **Invalid JSON**: The client should handle serialization safely (reject non-serializable values).
- [ ] **Special characters in key**: Keys with spaces, unicode, or SQL-like patterns should work correctly.
- [ ] **Large value**: Store a reasonably large JSON object (e.g., 1MB) to verify `jsonb` handling.

### TTL Validation
- [ ] **TTL of 0**: Should be rejected or immediately expire (define expected behavior).
- [ ] **Negative TTL**: Should throw a validation error.
- [ ] **Very large TTL**: Should be capped or documented (e.g., max 1 year = 31536000 seconds).

### Error Handling
- [ ] **Database connection failure**: `get` and `set` should throw descriptive errors when Supabase is unreachable.
- [ ] **Concurrent writes**: Multiple simultaneous `set` calls for the same key should not corrupt data (upsert behavior).

### getOrSet (Cache-Aside Pattern)
- [ ] **Cache hit**: `getOrSet` should return cached value without calling factory function.
- [ ] **Cache miss**: `getOrSet` should call factory, store result, and return the computed value.
- [ ] **Factory error**: If factory throws, error should propagate and no cache entry should be created.
- [ ] **Expired entry**: `getOrSet` should call factory when existing entry is expired.
- [ ] **Concurrent calls**: Multiple simultaneous `getOrSet` calls should not cause duplicate factory executions (optional: add locking mechanism).

### Cache Size Limits
- [ ] **Within limit**: Storing entries within the configured limit should succeed.
- [ ] **Exceeds limit (LRU eviction)**: When limit is exceeded, the least-recently-used entries should be evicted.
- [ ] **Namespace-specific limits**: Each namespace can have its own size limit.
- [ ] **Global limit**: A global limit should cap total entries across all namespaces.
- [ ] **Limit of 0**: Should throw a configuration error.
- [ ] **Negative limit**: Should throw a configuration error.

### Metrics and Logging
- [ ] **Hit count tracking**: `getStats` should return accurate hit count.
- [ ] **Miss count tracking**: `getStats` should return accurate miss count.
- [ ] **Hit ratio calculation**: `getStats` should return correct hit ratio (hits / (hits + misses)).
- [ ] **Entry count**: `getStats` should return current number of cached entries.
- [ ] **Reset stats**: `resetStats` should reset counters to zero.
- [ ] **Logging on miss**: When logger is configured, cache misses should be logged with key info.
- [ ] **Logging on eviction**: When logger is configured, evictions should be logged.

## 5. Implementation Details

### File Structure
- `packages/supabase/src/cache.ts`: Main service implementation.
- `packages/supabase/src/cache-utils.ts`: Utility functions (key builder, TTL validation).
- `packages/supabase/src/cache-config.ts`: Configuration types and defaults for size limits.
- `packages/supabase/src/cache-logger.ts`: Logger interface and default console logger.
- `packages/supabase/src/cache-metrics.ts`: Metrics tracking implementation.
- `packages/supabase/src/index.ts`: Export the cache service.
- `packages/supabase/migrations/001_create_cache_table.sql`: Database migration.

### Interface Definition

```typescript
// ============================================
// Configuration
// ============================================

export interface CacheSizeLimits {
  /** Global maximum number of cache entries. Default: unlimited (Infinity) */
  globalMaxEntries?: number;
  /** Per-namespace maximum entries. Keys are namespace names. */
  namespaceMaxEntries?: Record<string, number>;
}

export interface CacheConfig {
  /** Size limit configuration */
  limits?: CacheSizeLimits;
  /** Optional logger instance from @repo/logger. If not provided, logging is disabled. */
  logger?: Logger;
  /** Enable metrics tracking. Default: true */
  enableMetrics?: boolean;
}

export const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  limits: { globalMaxEntries: Infinity, namespaceMaxEntries: {} },
  logger: undefined as unknown as Logger, // No logger by default
  enableMetrics: true,
};

// ============================================
// Logger (from @repo/logger)
// ============================================

// The cache service uses the shared Logger interface from @repo/logger.
// This provides monorepo-wide consistent logging.
//
// Import in implementation:
// import { createLogger, type Logger } from '@repo/logger';
//
// See: packages/logger/docs/LOGGER_PACKAGE_PLAN.md for full logger documentation.

import type { Logger } from '@repo/logger';

// ============================================
// Metrics
// ============================================

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;  // hits / (hits + misses), or 0 if no operations
  entryCount: number;
  evictions: number;
}

// ============================================
// Core Cache Interface
// ============================================

export interface CacheResult<T> {
  value: T;
  expiresAt: Date;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<{ expiresAt: Date }>;
  getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds: number): Promise<T>;
  delete(key: string): Promise<void>;
  clearExpired(): Promise<number>; // Returns count of deleted rows
  getStats(): Promise<CacheStats>;
  resetStats(): Promise<void>;
}

// TTL constraints
export const MIN_TTL_SECONDS = 1;
export const MAX_TTL_SECONDS = 31536000; // 1 year

// Size limit constraints
export const MIN_CACHE_ENTRIES = 1;
export const MAX_CACHE_ENTRIES = 1_000_000; // 1 million entries
```

### Stub Functions

```typescript
import { createClient } from './client';

/**
 * Validate TTL is within acceptable range
 */
export function validateTTL(ttlSeconds: number): void {
  if (ttlSeconds < MIN_TTL_SECONDS) {
    throw new Error(`TTL must be at least ${MIN_TTL_SECONDS} second(s)`);
  }
  if (ttlSeconds > MAX_TTL_SECONDS) {
    throw new Error(`TTL must not exceed ${MAX_TTL_SECONDS} seconds (1 year)`);
  }
}

/**
 * Build a namespaced cache key
 */
export function buildCacheKey(app: string, namespace: string, identifier: string): string {
  return `${app}:${namespace}:${identifier}`;
}

/**
 * Get a value from the cache
 * Returns null if key doesn't exist or is expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // TODO: Query cache table where key = key AND expires_at > now()
  // TODO: If found, return value as T
  // TODO: If not found or expired, return null
  return null;
}

/**
 * Set a value in the cache with TTL
 * Uses upsert to handle both insert and update
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<{ expiresAt: Date }> {
  // TODO: Validate TTL
  // TODO: Calculate expires_at = now() + ttlSeconds
  // TODO: Upsert into cache table
  // TODO: Return { expiresAt }
  throw new Error('Not implemented');
}

/**
 * Delete a specific key from the cache
 * Does not throw if key doesn't exist
 */
export async function deleteCache(key: string): Promise<void> {
  // TODO: Delete from cache table where key = key
}

/**
 * Clear all expired cache entries
 * Returns the number of deleted rows
 */
export async function clearExpired(): Promise<number> {
  // TODO: Delete from cache table where expires_at < now()
  // TODO: Return count of deleted rows
  return 0;
}

/**
 * Get a value from cache, or compute and store it if missing/expired.
 * Implements the cache-aside (read-through) pattern.
 */
export async function getOrSetCache<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // TODO: Try to get from cache first
  // TODO: If found and not expired, increment hit counter and return value
  // TODO: If not found or expired, increment miss counter
  // TODO: Call factory to compute value
  // TODO: Store computed value with TTL
  // TODO: Return computed value
  throw new Error('Not implemented');
}

/**
 * Get current cache statistics
 */
export async function getStats(): Promise<CacheStats> {
  // TODO: Query count of entries in cache table
  // TODO: Return stats object with hits, misses, hitRatio, entryCount, evictions
  return {
    hits: 0,
    misses: 0,
    hitRatio: 0,
    entryCount: 0,
    evictions: 0,
  };
}

/**
 * Reset cache statistics counters
 */
export async function resetStats(): Promise<void> {
  // TODO: Reset in-memory or persisted counters
}

/**
 * Evict entries using LRU policy when size limit is exceeded
 * @param namespace - Optional namespace to limit eviction scope
 * @param targetCount - Number of entries to evict
 */
async function evictLRU(namespace?: string, targetCount: number = 1): Promise<number> {
  // TODO: Query oldest entries by created_at (or add accessed_at for true LRU)
  // TODO: Delete oldest entries up to targetCount
  // TODO: Log evictions if logger is configured
  // TODO: Increment eviction counter
  return 0;
}

/**
 * Validate cache size limit configuration
 */
export function validateSizeLimits(limits: CacheSizeLimits): void {
  if (limits.globalMaxEntries !== undefined) {
    if (limits.globalMaxEntries < MIN_CACHE_ENTRIES) {
      throw new Error(`Global max entries must be at least ${MIN_CACHE_ENTRIES}`);
    }
    if (limits.globalMaxEntries > MAX_CACHE_ENTRIES) {
      throw new Error(`Global max entries must not exceed ${MAX_CACHE_ENTRIES}`);
    }
  }
  // Validate per-namespace limits
  if (limits.namespaceMaxEntries) {
    for (const [ns, limit] of Object.entries(limits.namespaceMaxEntries)) {
      if (limit < MIN_CACHE_ENTRIES) {
        throw new Error(`Namespace '${ns}' max entries must be at least ${MIN_CACHE_ENTRIES}`);
      }
    }
  }
}

/**
 * Create a configured cache service instance
 */
export function createCacheService(config: CacheConfig = {}): CacheService {
  const mergedConfig = { ...DEFAULT_CACHE_CONFIG, ...config };
  
  // Validate configuration
  if (mergedConfig.limits) {
    validateSizeLimits(mergedConfig.limits);
  }
  
  // TODO: Initialize metrics counters
  // TODO: Return object implementing CacheService interface
  throw new Error('Not implemented');
}
```

## 6. Cleanup Strategy

Instead of a background worker (which doesn't fit serverless), we use:

1. **Lazy Purge**: During `get`, if a key is found but expired, delete it and return `null`.
2. **Explicit Cleanup**: Call `clearExpired()` from an API route or scheduled function.
3. **Supabase Cron (Optional)**: If `pg_cron` is enabled on your Supabase project:
   ```sql
   -- Run every hour to clean up expired cache entries
   SELECT cron.schedule(
     'cleanup-expired-cache',
     '0 * * * *',
     $$DELETE FROM public.cache WHERE expires_at < now()$$
   );
   ```

## 7. Execution Plan

| Phase | Task | Output |
|-------|------|--------|
| 1 | Create SQL migration file | `migrations/001_create_cache_table.sql` |
| 2 | Run migration on Supabase (dev environment) | Table created in database |
| 3 | **Implement `@repo/logger` package** (see `packages/logger/docs/LOGGER_PACKAGE_PLAN.md`) | Logger package ready |
| 4 | Add `vitest` to `packages/supabase` if not present | Test framework ready |
| 5 | Write test cases in `cache.test.ts` | All tests failing (Red) |
| 6 | Implement `validateTTL` and `buildCacheKey` utilities | Utility tests passing |
| 7 | Implement `setCache` function | Store tests passing |
| 8 | Implement `getCache` function with lazy purge | Retrieve + expiration tests passing |
| 9 | Implement `deleteCache` function | Delete tests passing |
| 10 | Implement `clearExpired` function | Cleanup tests passing |
| 11 | Add `@repo/logger` dependency to `@repo/supabase` | Logger integration ready |
| 12 | Implement metrics tracking (`getStats`, `resetStats`) | Metrics tests passing |
| 13 | Implement `getOrSetCache` function | Cache-aside tests passing |
| 14 | Implement size limit validation and LRU eviction | Size limit tests passing |
| 15 | Implement `createCacheService` factory | Factory tests passing |
| 16 | Export from `@repo/supabase` package | Package exports updated |
| 17 | Integration test in `apps/prompt-enhancer` | End-to-end validation |

## 8. Usage Examples

### Basic Usage

```typescript
import { getCache, setCache, deleteCache, buildCacheKey } from '@repo/supabase';

// Build a namespaced key
const cacheKey = buildCacheKey('prompt-enhancer', 'model', 'gpt-4-turbo');

// Set a value with 1 hour TTL
const { expiresAt } = await setCache(cacheKey, { name: 'GPT-4 Turbo', maxTokens: 128000 }, 3600);
console.log(`Cache expires at: ${expiresAt}`);

// Get the value
const model = await getCache<{ name: string; maxTokens: number }>(cacheKey);
if (model) {
  console.log(`Model: ${model.name}`);
}

// Delete when no longer needed
await deleteCache(cacheKey);
```

### Advanced Usage with Configuration

```typescript
import { createCacheService, buildCacheKey, type CacheConfig } from '@repo/supabase';
import { createLogger } from '@repo/logger';

// Create a logger for the cache service
const cacheLogger = createLogger('Cache', { level: 'debug' });

// Configure cache with limits, logging, and metrics
const config: CacheConfig = {
  limits: {
    globalMaxEntries: 10000,
    namespaceMaxEntries: {
      'model': 100,
      'enhancement': 5000,
    },
  },
  logger: cacheLogger,
  enableMetrics: true,
};

const cache = createCacheService(config);

// Using getOrSet (cache-aside pattern)
const cacheKey = buildCacheKey('prompt-enhancer', 'model', 'gpt-4-turbo');

const model = await cache.getOrSet(
  cacheKey,
  async () => {
    // This factory is only called on cache miss
    console.log('Fetching model metadata from API...');
    return await fetchModelMetadata('gpt-4-turbo');
  },
  3600 // 1 hour TTL
);

// Get cache statistics
const stats = await cache.getStats();
console.log(`Cache hit ratio: ${(stats.hitRatio * 100).toFixed(1)}%`);
console.log(`Total entries: ${stats.entryCount}`);
console.log(`Evictions: ${stats.evictions}`);

// Reset stats (e.g., after a deployment)
await cache.resetStats();
```

## 9. Design Decisions

### Logging Strategy

We use the shared `@repo/logger` package for **monorepo-wide consistent logging**:

- **Centralized configuration** — All packages use the same Logger interface
- **Environment-aware** — Auto-detects `NODE_ENV` for log level and format
- **Vercel-compatible** — Console-based output captured by Vercel logs
- **Opt-in** — If no logger is configured, no logs are emitted

```typescript
import { createLogger } from '@repo/logger';
import { createCacheService } from '@repo/supabase';

// Create a named logger for the cache service
const logger = createLogger('Cache');

// Inject into cache service
const cache = createCacheService({
  logger: logger,
  enableMetrics: true,
});

// Use child loggers for more context
const requestLogger = logger.child({ requestId: 'req-123' });
requestLogger.info('Cache lookup', { key: 'user:456' });
```

**Related Documentation**: See `packages/logger/docs/LOGGER_PACKAGE_PLAN.md` for full logger package documentation.

### Cache Size Limits

- **LRU Eviction**: When limits are exceeded, the least-recently-used entries are evicted
- **Namespace-specific limits**: Allow fine-grained control per use case
- **Global limit**: Provides a safety cap across all namespaces

### Metrics Tracking

- Metrics are stored **in-memory** for serverless simplicity
- Stats are scoped to the cache service instance
- For persistent metrics across serverless invocations, consider:
  - Storing metrics in a separate DB table
  - Using Vercel Analytics or similar service

## 10. Resolved Questions

- [x] ~~Should we implement `getOrSet` (cache-aside pattern) as a convenience method?~~ **Yes**, implemented as `getOrSet` method on `CacheService`.
- [x] ~~Do we need cache size limits or entry count limits?~~ **Yes**, configurable via `CacheConfig.limits` with global and per-namespace options.
- [x] ~~Should we add metrics/logging for cache hit/miss ratios?~~ **Yes**, via `getStats()` method and `@repo/logger` integration.

## 11. Dependencies

This package depends on:
- `@repo/logger` — For consistent logging across the monorepo

```json
{
  "dependencies": {
    "@repo/logger": "workspace:*"
  }
}
```

