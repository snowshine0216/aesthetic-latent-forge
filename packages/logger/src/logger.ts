import type {
  Logger,
  LoggerOptions,
  LogMeta,
  LogLevel,
  TransportFn,
} from './types';
import {
  shouldLog,
  getDefaultLevel,
  getDefaultFormat,
} from './types';
import { consoleTransport } from './console-transport';
import { jsonTransport } from './json-transport';

// Global default level (can be changed via setGlobalLogLevel)
let globalDefaultLevel: LogLevel | undefined;

/**
 * Set the default log level for newly created loggers
 */
export const setGlobalLogLevel = (level: LogLevel): void => {
  globalDefaultLevel = level;
};

/**
 * Get the current global default level
 */
export const getGlobalLogLevel = (): LogLevel =>
  globalDefaultLevel ?? getDefaultLevel();

/**
 * Reset global log level to undefined (for testing)
 */
export const resetGlobalLogLevel = (): void => {
  globalDefaultLevel = undefined;
};

/**
 * Create a logger implementation with the given configuration
 */
const createLoggerImpl = (
  name: string,
  level: LogLevel,
  transport: TransportFn,
  timestamp: boolean,
  bindings: LogMeta
): Logger => {
  const log = (
    messageLevel: Exclude<LogLevel, 'silent'>,
    message: string,
    meta?: LogMeta
  ): void => {
    if (!shouldLog(level, messageLevel)) return;

    // Stringify non-string messages
    const normalizedMessage =
      typeof message === 'string' ? message : String(message);

    // Merge bindings with call-specific meta
    const mergedMeta = { ...bindings, ...meta };

    transport(messageLevel, name, normalizedMessage, mergedMeta, timestamp);
  };

  return {
    name,
    level,

    debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
    info: (message: string, meta?: LogMeta) => log('info', message, meta),
    warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
    error: (message: string, meta?: LogMeta) => log('error', message, meta),

    child: (childBindings: LogMeta): Logger =>
      createLoggerImpl(name, level, transport, timestamp, {
        ...bindings,
        ...childBindings,
      }),
  };
};

/**
 * Create a named logger instance
 *
 * @param name - The name of the logger (typically the service or module name)
 * @param options - Optional configuration for the logger
 * @returns A Logger instance
 *
 * @example
 * ```ts
 * const logger = createLogger('MyService');
 * logger.info('Application started');
 * logger.debug('Processing request', { requestId: 'abc123' });
 * ```
 */
export const createLogger = (
  name: string,
  options: LoggerOptions = {}
): Logger => {
  const level = options.level ?? getGlobalLogLevel();
  const format = options.format ?? getDefaultFormat();
  const timestamp = options.timestamp ?? true;
  const bindings = options.bindings ?? {};

  const transport = format === 'json' ? jsonTransport : consoleTransport;

  return createLoggerImpl(name, level, transport, timestamp, bindings);
};
