export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Silent = 4,
}

let currentLevel: LogLevel = typeof import.meta !== 'undefined' &&
  (import.meta as Record<string, unknown>).env &&
  (import.meta as Record<string, Record<string, unknown>>).env.DEV
  ? LogLevel.Debug
  : LogLevel.Warn;

let prefix = '[Vylos]';

export const logger = {
  setLevel(level: LogLevel) {
    currentLevel = level;
  },

  setPrefix(value: string) {
    prefix = value;
  },

  getPrefix(): string {
    return prefix;
  },

  debug(...args: unknown[]) {
    if (currentLevel <= LogLevel.Debug) {
      console.debug(prefix, ...args);
    }
  },

  info(...args: unknown[]) {
    if (currentLevel <= LogLevel.Info) {
      console.info(prefix, ...args);
    }
  },

  warn(...args: unknown[]) {
    if (currentLevel <= LogLevel.Warn) {
      console.warn(prefix, ...args);
    }
  },

  error(...args: unknown[]) {
    if (currentLevel <= LogLevel.Error) {
      console.error(prefix, ...args);
    }
  },
};
