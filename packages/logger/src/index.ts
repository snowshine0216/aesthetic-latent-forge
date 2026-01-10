// Main exports
export {
  createLogger,
  setGlobalLogLevel,
  getGlobalLogLevel,
  resetGlobalLogLevel,
} from './logger';

// Type exports
export type {
  Logger,
  LoggerOptions,
  LogLevel,
  LogMeta,
  TransportFn,
} from './types';

export {
  LOG_LEVEL_VALUES,
  shouldLog,
  getDefaultLevel,
  getDefaultFormat,
} from './types';

// Transport exports (for advanced use cases)
export { consoleTransport } from './console-transport';
export { jsonTransport, safeStringify } from './json-transport';
