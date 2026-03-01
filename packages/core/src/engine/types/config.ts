export interface VylosConfig {
  name: string;
  id: string;
  version: string;
  languages: string[];
  defaultLanguage: string;
  defaultLocation: string;
  resolution: { width: number; height: number };
  /** The game time at which new games begin. Defaults to 12 if not specified. */
  startGameTime?: number;
  /** Log prefix shown in console messages. Defaults to '[Vylos]'. */
  logPrefix?: string;
  /** Console global name for dev tools. Defaults to 'Vylos'. */
  consoleName?: string;
}
