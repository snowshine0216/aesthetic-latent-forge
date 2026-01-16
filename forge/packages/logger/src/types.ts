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
// Transport Types
// ============================================

export type TransportFn = (
  level: Exclude<LogLevel, 'silent'>,
  name: string,
  message: string,
  meta: LogMeta,
  timestamp: boolean
) => void;

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

export const shouldLog = (
  currentLevel: LogLevel,
  messageLevel: LogLevel
): boolean => LOG_LEVEL_VALUES[messageLevel] >= LOG_LEVEL_VALUES[currentLevel];

export const getDefaultLevel = (): LogLevel => {
  const env = process.env.NODE_ENV;
  if (env === 'production') return 'info';
  if (env === 'test') return 'silent';
  return 'debug';
};

export const getDefaultFormat = (): 'console' | 'json' =>
  process.env.NODE_ENV === 'production' ? 'json' : 'console';
