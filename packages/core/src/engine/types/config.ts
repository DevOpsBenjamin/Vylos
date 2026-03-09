export interface LanguageEntry {
  code: string;
  label: string;
}

export interface VylosConfig {
  name: string;
  id: string;
  version: string;
  languages: LanguageEntry[];
  defaultLanguage: string;
  defaultLocation: string;
  resolution: { width: number; height: number };
  /** The game time at which new games begin. Defaults to 12 if not specified. */
  startGameTime?: number;
}
