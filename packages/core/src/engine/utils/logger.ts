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

export const logger = {
  setLevel(level: LogLevel) {
    currentLevel = level;
  },

  debug(...args: unknown[]) {
    if (currentLevel <= LogLevel.Debug) {
      console.debug('[Vylos]', ...args);
    }
  },

  info(...args: unknown[]) {
    if (currentLevel <= LogLevel.Info) {
      console.info('[Vylos]', ...args);
    }
  },

  warn(...args: unknown[]) {
    if (currentLevel <= LogLevel.Warn) {
      console.warn('[Vylos]', ...args);
    }
  },

  error(...args: unknown[]) {
    if (currentLevel <= LogLevel.Error) {
      console.error('[Vylos]', ...args);
    }
  },
};
