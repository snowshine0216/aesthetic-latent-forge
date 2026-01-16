import type { LogLevel, LogMeta, TransportFn } from './types';

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
} as const;

const LEVEL_LABELS: Record<Exclude<LogLevel, 'silent'>, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

/**
 * Format metadata for human-readable console output
 */
const formatMeta = (meta: LogMeta): string => {
  const entries = Object.entries(meta);
  if (entries.length === 0) return '';

  const formatted = entries
    .map(([key, value]) => {
      const valueStr =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `${key}=${valueStr}`;
    })
    .join(' ');

  return ` ${COLORS.dim}${formatted}${COLORS.reset}`;
};

/**
 * Console transport - human-readable output for development
 */
export const consoleTransport: TransportFn = (
  level,
  name,
  message,
  meta,
  timestamp
): void => {
  const color = COLORS[level];
  const label = LEVEL_LABELS[level];
  const timestampStr = timestamp
    ? `${COLORS.dim}${new Date().toISOString()}${COLORS.reset} `
    : '';
  const metaStr = formatMeta(meta);

  const output = `${timestampStr}${color}[${label}]${COLORS.reset} ${COLORS.dim}(${name})${COLORS.reset} ${message}${metaStr}`;

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
