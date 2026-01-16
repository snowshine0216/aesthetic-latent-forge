import type { LogLevel, LogMeta, TransportFn } from './types';

/**
 * Safely stringify objects, handling circular references
 */
export const safeStringify = (obj: unknown): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
};

/**
 * JSON transport - structured output for production
 * Outputs Vercel-compatible structured JSON logs
 */
export const jsonTransport: TransportFn = (
  level,
  name,
  message,
  meta,
  timestamp
): void => {
  const logEntry: Record<string, unknown> = {
    level,
    name,
    message,
    ...meta,
  };

  if (timestamp) {
    logEntry.timestamp = new Date().toISOString();
  }

  // Use safeStringify to handle circular references
  const output = safeStringify(logEntry);

  // Use appropriate console method for each level
  switch (level) {
    case 'debug':
      console.debug(output);
      break;
    case 'info':
      console.info(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
};
